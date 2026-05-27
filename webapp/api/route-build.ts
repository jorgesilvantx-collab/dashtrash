import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";

// POST /api/route-build
// Builds routes for a given date by:
//   1. Finding all active homes whose pickup_day matches the day-of-week for route_date
//   2. Grouping them into geo-clusters (same logic as signup-customer)
//   3. Optimising each cluster with nearest-neighbour (ORS if available)
//   4. Inserting route + route_stop records into the DB
// Idempotent: skips homes that already have a stop on that date.
// Auth: caller must include a valid ADMIN_ACTION_KEY query param OR the
//       request must originate from the admin UI which sets the header.

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ORS_KEY = process.env.OPENROUTE_KEY || process.env.OPENROUTESERVICE_KEY || "";

type Body = {
  route_date: string;        // YYYY-MM-DD
  driver_id?: string;        // optional — assign all built routes to this driver
  start_lat?: number;        // driver's starting location for optimisation
  start_lng?: number;
};

type HomeRow = {
  id: string;
  street_address: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  customer_id: string;
  pickup_day: string;
  label: string | null;
  gate_code: string | null;
  notes: string | null;
  num_bins: number | null;
};

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighbour(
  start: { lat: number; lng: number },
  stops: Array<{ id: string; lat: number; lng: number }>,
): { order: typeof stops; totalMi: number } {
  const remaining = [...stops];
  const order: typeof stops = [];
  let cur = start;
  let totalM = 0;
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineM(cur, remaining[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    totalM += bestD;
    cur = remaining[best];
    order.push(remaining.splice(best, 1)[0]);
  }
  return { order, totalMi: totalM / 1609.344 };
}

async function orsOptimise(
  start: { lat: number; lng: number },
  stops: Array<{ id: string; lat: number; lng: number }>,
): Promise<{ order: typeof stops; totalMi: number } | null> {
  if (!ORS_KEY || stops.length > 50) return null;
  try {
    const res = await fetch("https://api.openrouteservice.org/optimization", {
      method: "POST",
      headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        jobs: stops.map((s, i) => ({ id: i + 1, location: [s.lng, s.lat], service: 60 })),
        vehicles: [{ id: 1, profile: "driving-car", start: [start.lng, start.lat], end: [start.lng, start.lat] }],
      }),
    });
    if (!res.ok) return null;
    const j = await res.json() as { routes?: Array<{ steps: Array<{ type: string; job?: number; distance: number }> }> };
    const steps = j.routes?.[0]?.steps?.filter((s) => s.type === "job") ?? [];
    if (!steps.length) return null;
    const order = steps.map((s) => stops[s.job! - 1]);
    const totalMi = (j.routes?.[0]?.steps?.at(-1)?.distance ?? 0) / 1609.344;
    return { order, totalMi };
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  const route_date = (body?.route_date || "").trim();
  if (!route_date || !/^\d{4}-\d{2}-\d{2}$/.test(route_date)) {
    return fail(res, "route_date (YYYY-MM-DD) required");
  }

  const dayName = DAYS[new Date(route_date + "T12:00:00Z").getUTCDay()];
  const driverId = body?.driver_id || null;
  const startLat = body?.start_lat ?? 32.7767;
  const startLng = body?.start_lng ?? -96.797;
  const start = { lat: startLat, lng: startLng };

  try {
    // 1. Load active subscriptions for this day
    const subRes = await admin
      .from("subscriptions")
      .select("customer_id")
      .eq("status", "active");
    const subs = (subRes.data as Array<{ customer_id: string }>) || [];
    if (!subs.length) return ok(res, { routes_created: 0, note: "No active subscriptions" });
    const activeCustomerIds = subs.map((s) => s.customer_id);

    // 2. Load homes matching pickup_day for active customers
    const homesRes = await admin
      .from("homes")
      .select("id, street_address, city, state, lat, lng, customer_id, pickup_day, label, gate_code, notes, num_bins")
      .eq("pickup_day", dayName)
      .eq("active", true)
      .in("customer_id", activeCustomerIds);
    const allHomes = ((homesRes.data as HomeRow[]) || []).filter(
      (h) => h.lat != null && h.lng != null,
    );
    if (!allHomes.length) {
      return ok(res, { routes_created: 0, note: `No active homes with pickup_day=${dayName}` });
    }

    // 3. Check which homes already have stops on this date (idempotent)
    const existingRes = await admin
      .from("route_stops")
      .select("home_id")
      .eq("route_date", route_date);
    const existingHomeIds = new Set(
      ((existingRes.data as Array<{ home_id: string }>) || []).map((r) => r.home_id),
    );
    const homes = allHomes.filter((h) => !existingHomeIds.has(h.id));
    if (!homes.length) {
      return ok(res, { routes_created: 0, note: "All homes already have stops for this date" });
    }

    // 4. Cluster by rounded lat/lng (0.03° ≈ 2 mi)
    const clusters = new Map<string, HomeRow[]>();
    for (const h of homes) {
      const key = `${(Math.round(h.lat! / 0.03) * 0.03).toFixed(2)},${(Math.round(h.lng! / 0.03) * 0.03).toFixed(2)}`;
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(h);
    }

    // 5. For each cluster: optimise, create route, create stops
    const createdRoutes: Array<{ id: string; stops: number; miles: number; cluster: string }> = [];
    let clusterIndex = 0;

    for (const [clusterKey, clusterHomes] of clusters) {
      clusterIndex++;
      const stopInputs = clusterHomes.map((h) => ({ id: h.id, lat: h.lat!, lng: h.lng! }));

      let optimised = await orsOptimise(start, stopInputs);
      if (!optimised) optimised = nearestNeighbour(start, stopInputs);
      const { order, totalMi } = optimised;

      // Create route record
      const routeInsert = await admin
        .from("routes")
        .insert({
          name: `${dayName} Route ${clusterIndex} (${route_date})`,
          status: "draft",
          route_date,
          driver_id: driverId,
          total_stops: order.length,
          total_miles: Math.round(totalMi * 10) / 10,
          cluster_key: clusterKey,
        })
        .select("id")
        .single();

      if (routeInsert.error || !routeInsert.data) {
        console.error("route insert error", routeInsert.error);
        continue;
      }
      const routeId = (routeInsert.data as { id: string }).id;

      // Create two stops per home: pull_out + return_in
      const stopRows = order.flatMap((h, seq) => [
        {
          route_id: routeId,
          home_id: h.id,
          route_date,
          sequence: seq * 2 + 1,
          action: "pull_out",
          status: "pending",
          gate_code: clusterHomes.find((c) => c.id === h.id)?.gate_code ?? null,
          notes: clusterHomes.find((c) => c.id === h.id)?.notes ?? null,
        },
        {
          route_id: routeId,
          home_id: h.id,
          route_date,
          sequence: seq * 2 + 2,
          action: "return_in",
          status: "pending",
          gate_code: clusterHomes.find((c) => c.id === h.id)?.gate_code ?? null,
          notes: null,
        },
      ]);

      await admin.from("route_stops").insert(stopRows);

      createdRoutes.push({ id: routeId, stops: order.length, miles: Math.round(totalMi * 10) / 10, cluster: clusterKey });
    }

    return ok(res, {
      routes_created: createdRoutes.length,
      day: dayName,
      route_date,
      homes_scheduled: homes.length,
      routes: createdRoutes,
    });
  } catch (e) {
    console.error("route-build error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500);
  }
}
