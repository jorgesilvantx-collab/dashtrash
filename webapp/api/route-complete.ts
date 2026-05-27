import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { stripeRequest } from "./_lib/stripe.js";
import { admin } from "./_lib/supabase.js";

// Marks a route complete and, if the driver has a Stripe Connect account with
// payouts enabled, transfers the driver's pay (homes × $1 + miles × $0.15).
// Refuses to complete if any stop is still pending.

type Body = { route_id?: string; miles?: number };

type Stop = { id: string; status: string };
type RouteRow = {
  id: string;
  driver_id: string | null;
  status: string;
  total_miles: number | null;
  total_stops: number | null;
};
type DriverRow = {
  profile_id: string;
  email: string;
  pay_per_home_cents: number;
  pay_per_mile_cents: number;
  stripe_account_id: string | null;
  stripe_payouts_enabled: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body.route_id) return fail(res, "route_id required");

  try {
    const { data: rRow, error: rErr } = await admin
      .from("routes")
      .select("id,driver_id,status,total_miles,total_stops")
      .eq("id", body.route_id)
      .single();
    if (rErr || !rRow) return fail(res, rErr?.message || "Route not found", 404, "not_found");
    const route = rRow as RouteRow;

    if (route.status === "completed") {
      return fail(res, "Route already completed", 409, "already_completed");
    }
    if (!route.driver_id) {
      return fail(res, "Route has no driver assigned", 400, "no_driver");
    }

    const stopsRes = await admin.from("route_stops").select("id,status").eq("route_id", route.id);
    if (stopsRes.error) throw stopsRes.error;
    const stops = (stopsRes.data || []) as Stop[];
    const pending = stops.filter((s) => s.status !== "completed");
    if (pending.length > 0) {
      return fail(res, `${pending.length} stop(s) still pending`, 400, "stops_pending");
    }

    const { data: dRow, error: dErr } = await admin
      .from("drivers")
      .select("profile_id,email,pay_per_home_cents,pay_per_mile_cents,stripe_account_id,stripe_payouts_enabled")
      .eq("profile_id", route.driver_id)
      .single();
    if (dErr || !dRow) return fail(res, dErr?.message || "Driver not found", 404, "driver_not_found");
    const driver = dRow as DriverRow;

    const stopsCount = stops.length;
    const miles = Number(body.miles ?? route.total_miles ?? 0);
    const homePayCents = stopsCount * driver.pay_per_home_cents;
    const mileagePayCents = Math.round(miles * driver.pay_per_mile_cents);
    const totalCents = homePayCents + mileagePayCents;

    await admin
      .from("routes")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_miles: miles,
        total_stops: stopsCount,
      })
      .eq("id", route.id);

    const insertPayout = await admin.from("driver_payouts").insert({
      driver_id: driver.profile_id,
      route_id: route.id,
      stops_count: stopsCount,
      miles,
      pay_per_home_cents: driver.pay_per_home_cents,
      pay_per_mile_cents: driver.pay_per_mile_cents,
      home_pay_cents: homePayCents,
      mileage_pay_cents: mileagePayCents,
      total_cents: totalCents,
      status: "pending",
    }).select("id").single();
    if (insertPayout.error) throw insertPayout.error;
    const payoutRow = insertPayout.data as { id: string };

    let payoutStatus: "pending" | "paid" | "failed" | "manual" = "pending";
    let transferId: string | null = null;
    let failureReason: string | null = null;

    if (driver.stripe_account_id && driver.stripe_payouts_enabled && totalCents > 0) {
      const xfer = await stripeRequest<{ id: string }>("/transfers", {
        method: "POST",
        body: {
          amount: totalCents,
          currency: "usd",
          destination: driver.stripe_account_id,
          description: `DashTrash route ${route.id} (${stopsCount} stops, ${miles.toFixed(1)} mi)`,
          metadata: { route_id: route.id, driver_id: driver.profile_id, payout_id: payoutRow.id },
        },
      });
      if (xfer.ok) {
        payoutStatus = "paid";
        transferId = xfer.data.id;
      } else {
        payoutStatus = "failed";
        failureReason = xfer.error.message;
      }
    } else if (!driver.stripe_account_id || !driver.stripe_payouts_enabled) {
      payoutStatus = "manual";
      failureReason = "Stripe Connect not enabled for driver";
    }

    await admin
      .from("driver_payouts")
      .update({
        status: payoutStatus,
        stripe_transfer_id: transferId,
        failure_reason: failureReason,
        paid_at: payoutStatus === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", payoutRow.id);

    return ok(res, {
      route_id: route.id,
      payout: {
        id: payoutRow.id,
        status: payoutStatus,
        total_cents: totalCents,
        total_dollars: Number((totalCents / 100).toFixed(2)),
        stops: stopsCount,
        miles: Number(miles.toFixed(2)),
        stripe_transfer_id: transferId,
        failure_reason: failureReason,
      },
    });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
