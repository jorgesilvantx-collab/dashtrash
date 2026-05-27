import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";

// Computes optimal route order + total distance + driver payout ($1/home + $0.15/mi)
// via OpenRouteService Optimization (VROOM under the hood).
// Falls back to nearest-neighbor heuristic if ORS is unavailable.

const ORS_KEY = process.env.OPENROUTE_KEY || process.env.OPENROUTESERVICE_KEY || "";

type Stop = { id: string | number; lat: number; lng: number; service_time?: number };
type Body = {
  start: { lat: number; lng: number };
  stops: Stop[];
  end?: { lat: number; lng: number };
  pay_per_home?: number;
  pay_per_mile?: number;
};

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighbor(start: { lat: number; lng: number }, stops: Stop[]) {
  const remaining = stops.slice();
  const order: Stop[] = [];
  let cur = start;
  let totalM = 0;
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineMeters(cur, remaining[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    totalM += bestD;
    cur = remaining[best];
    order.push(remaining.splice(best, 1)[0]);
  }
  return { order, totalM };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body?.start || !Array.isArray(body?.stops) || body.stops.length === 0) {
    return fail(res, "start + stops[] required");
  }

  const payPerHome = body.pay_per_home ?? 1.0;
  const payPerMile = body.pay_per_mile ?? 0.15;
  const end = body.end ?? body.start;

  try {
    if (ORS_KEY && body.stops.length <= 50) {
      const orsBody = {
        jobs: body.stops.map((s, i) => ({
          id: i + 1,
          location: [s.lng, s.lat],
          service: s.service_time ?? 60,
        })),
        vehicles: [
          {
            id: 1,
            profile: "driving-car",
            start: [body.start.lng, body.start.lat],
            end: [end.lng, end.lat],
          },
        ],
      };
      const orsRes = await fetch("https://api.openrouteservice.org/optimization", {
        method: "POST",
        headers: {
          Authorization: ORS_KEY,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json",
        },
        body: JSON.stringify(orsBody),
      });
      if (orsRes.ok) {
        const data = (await orsRes.json()) as {
          routes?: Array<{
            steps?: Array<{ type: string; job?: number; location?: [number, number] }>;
            distance?: number;
            duration?: number;
          }>;
        };
        const r = data.routes?.[0];
        if (r) {
          const orderedJobs = (r.steps ?? [])
            .filter((s) => s.type === "job" && typeof s.job === "number")
            .map((s) => body.stops[(s.job as number) - 1]);
          const meters = r.distance ?? 0;
          const miles = meters / 1609.344;
          const pay = body.stops.length * payPerHome + miles * payPerMile;
          return ok(res, {
            provider: "openrouteservice",
            order: orderedJobs,
            distance_miles: Number(miles.toFixed(2)),
            duration_seconds: Math.round(r.duration ?? 0),
            estimated_pay: Number(pay.toFixed(2)),
            pay_breakdown: {
              homes: body.stops.length,
              pay_per_home: payPerHome,
              pay_per_mile: payPerMile,
              home_pay: Number((body.stops.length * payPerHome).toFixed(2)),
              mileage_pay: Number((miles * payPerMile).toFixed(2)),
            },
          });
        }
      }
    }

    // Fallback: nearest-neighbor with great-circle distance
    const nn = nearestNeighbor(body.start, body.stops);
    const milesFallback = nn.totalM / 1609.344 + haversineMeters(nn.order[nn.order.length - 1] || body.start, end) / 1609.344;
    const pay = body.stops.length * payPerHome + milesFallback * payPerMile;
    return ok(res, {
      provider: "nearest-neighbor",
      order: nn.order,
      distance_miles: Number(milesFallback.toFixed(2)),
      duration_seconds: Math.round(milesFallback * 60 * 2),
      estimated_pay: Number(pay.toFixed(2)),
      pay_breakdown: {
        homes: body.stops.length,
        pay_per_home: payPerHome,
        pay_per_mile: payPerMile,
        home_pay: Number((body.stops.length * payPerHome).toFixed(2)),
        mileage_pay: Number((milesFallback * payPerMile).toFixed(2)),
      },
    });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "route optimization failed", 500, "ors_error");
  }
}
