import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { stripeRequest } from "./_lib/stripe.js";
import { admin } from "./_lib/supabase.js";

// Customer-facing subscription cancellation. Defaults to cancel-at-period-end
// so service continues through the paid month; pass `immediately: true` to
// terminate right away (used internally when customer deletes their last home).

type Body = { customer_id?: string; immediately?: boolean; reason?: string };

type Sub = {
  id: string;
  stripe_subscription_id: string | null;
  status: string;
};

type StripeSub = {
  id: string;
  status: string;
  cancel_at_period_end?: boolean;
  cancel_at?: number | null;
  canceled_at?: number | null;
  current_period_end?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body.customer_id) return fail(res, "customer_id required");

  try {
    const { data, error } = await admin
      .from("subscriptions")
      .select("id,stripe_subscription_id,status")
      .eq("customer_id", body.customer_id)
      .in("status", ["active", "trialing", "past_due", "incomplete"])
      .limit(1)
      .single();

    if (error || !data) return fail(res, "No active subscription found", 404, "not_found");
    const sub = data as Sub;

    if (!sub.stripe_subscription_id) {
      await admin
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("id", sub.id);
      return ok(res, { canceled: true, immediately: true, stripe_subscription_id: null });
    }

    let stripeUpdate: StripeResult;
    if (body.immediately) {
      stripeUpdate = await stripeRequest<StripeSub>(`/subscriptions/${sub.stripe_subscription_id}`, {
        method: "DELETE",
      });
    } else {
      stripeUpdate = await stripeRequest<StripeSub>(`/subscriptions/${sub.stripe_subscription_id}`, {
        method: "POST",
        body: {
          cancel_at_period_end: true,
          cancellation_details: body.reason ? { comment: body.reason } : undefined,
        },
      });
    }
    if (!stripeUpdate.ok) return fail(res, stripeUpdate.error.message, 500, "stripe_error");

    const stripeSub = stripeUpdate.data;
    await admin
      .from("subscriptions")
      .update({
        status: stripeSub.status === "canceled" ? "canceled" : sub.status,
        cancel_at: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000).toISOString() : null,
        canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

    return ok(res, {
      canceled: true,
      immediately: !!body.immediately,
      stripe_subscription_id: stripeSub.id,
      status: stripeSub.status,
      cancel_at: stripeSub.cancel_at,
      current_period_end: stripeSub.current_period_end,
    });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}

type StripeResult =
  | { ok: true; data: StripeSub }
  | { ok: false; status: number; error: { message: string } };
