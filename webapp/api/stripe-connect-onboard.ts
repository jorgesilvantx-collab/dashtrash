import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { stripeRequest } from "./_lib/stripe.js";
import { admin } from "./_lib/supabase.js";

// Creates (or fetches) the driver's Stripe Connect Express account and returns
// an onboarding link they can complete to enable payouts. Idempotent — re-runs
// reuse the existing account id stored on the drivers row.

type Body = { driver_id?: string; email?: string; return_url?: string; refresh_url?: string };

type StripeAccount = {
  id: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
};

type StripeAccountLink = { url: string; expires_at: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  const driverId = (body.driver_id || "").trim();
  if (!driverId) return fail(res, "driver_id required");

  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host =
    (req.headers["x-forwarded-host"] as string) || req.headers.host || "dashtrashtx.com";
  const origin = `${proto}://${host}`;

  try {
    const { data: driverRow, error: dErr } = await admin
      .from("drivers")
      .select("profile_id,email,stripe_account_id")
      .eq("profile_id", driverId)
      .single();
    if (dErr || !driverRow) return fail(res, dErr?.message || "Driver not found", 404, "not_found");

    const driver = driverRow as { profile_id: string; email: string; stripe_account_id: string | null };
    const email = body.email || driver.email;

    let accountId = driver.stripe_account_id;

    if (!accountId) {
      const create = await stripeRequest<StripeAccount>("/accounts", {
        method: "POST",
        body: {
          type: "express",
          country: "US",
          email,
          capabilities: { transfers: { requested: true } },
          business_type: "individual",
          metadata: { driver_id: driverId, source: "dashtrashtx" },
        },
      });
      if (!create.ok) return fail(res, create.error.message, 500, "stripe_error");
      accountId = create.data.id;

      await admin.from("drivers").update({ stripe_account_id: accountId }).eq("profile_id", driverId);
    }

    const linkRes = await stripeRequest<StripeAccountLink>("/account_links", {
      method: "POST",
      body: {
        account: accountId,
        refresh_url: body.refresh_url || `${origin}/driver/payouts?refresh=1`,
        return_url: body.return_url || `${origin}/driver/payouts?return=1`,
        type: "account_onboarding",
        collect: "eventually_due",
      },
    });
    if (!linkRes.ok) return fail(res, linkRes.error.message, 500, "stripe_error");

    return ok(res, {
      account_id: accountId,
      onboarding_url: linkRes.data.url,
      expires_at: linkRes.data.expires_at,
    });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
