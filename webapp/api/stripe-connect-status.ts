import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { stripeRequest } from "./_lib/stripe.js";
import { admin } from "./_lib/supabase.js";

// Pull the latest Connect account state from Stripe, mirror it into the drivers
// row, and return whether the driver can receive payouts.

type Body = { driver_id?: string };

type StripeAccount = {
  id: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements?: {
    currently_due?: string[];
    eventually_due?: string[];
    past_due?: string[];
    disabled_reason?: string | null;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST" && req.method !== "GET")
    return fail(res, "Method not allowed", 405);

  const driverId =
    (req.method === "GET" ? (req.query.driver_id as string) : readJson<Body>(req).driver_id) || "";
  if (!driverId) return fail(res, "driver_id required");

  try {
    const { data, error } = await admin
      .from("drivers")
      .select("profile_id,stripe_account_id,stripe_payouts_enabled,stripe_details_submitted,stripe_charges_enabled")
      .eq("profile_id", driverId)
      .single();
    if (error || !data) return fail(res, error?.message || "Driver not found", 404, "not_found");

    const driver = data as {
      stripe_account_id: string | null;
      stripe_payouts_enabled: boolean;
      stripe_details_submitted: boolean;
      stripe_charges_enabled: boolean;
    };

    if (!driver.stripe_account_id) {
      return ok(res, {
        connected: false,
        payouts_enabled: false,
        details_submitted: false,
        charges_enabled: false,
        requirements: null,
      });
    }

    const acctRes = await stripeRequest<StripeAccount>(`/accounts/${driver.stripe_account_id}`);
    if (!acctRes.ok) return fail(res, acctRes.error.message, 500, "stripe_error");

    const acct = acctRes.data;
    const payouts = !!acct.payouts_enabled;
    const submitted = !!acct.details_submitted;
    const charges = !!acct.charges_enabled;

    if (
      payouts !== driver.stripe_payouts_enabled ||
      submitted !== driver.stripe_details_submitted ||
      charges !== driver.stripe_charges_enabled
    ) {
      await admin
        .from("drivers")
        .update({
          stripe_payouts_enabled: payouts,
          stripe_details_submitted: submitted,
          stripe_charges_enabled: charges,
        })
        .eq("profile_id", driverId);
    }

    return ok(res, {
      connected: true,
      account_id: acct.id,
      payouts_enabled: payouts,
      details_submitted: submitted,
      charges_enabled: charges,
      requirements: acct.requirements ?? null,
    });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
