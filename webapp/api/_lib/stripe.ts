// Minimal Stripe REST wrapper (no stripe SDK) so the Vercel bundler stays clean.
// Uses the Stripe API directly via fetch with Basic Auth (secret key:).

const STRIPE_KEY =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_RESTRICTED_KEY ||
  "";

const API = "https://api.stripe.com/v1";

function form(data: Record<string, unknown>, prefix = ""): string {
  const params: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") {
          params.push(form(item as Record<string, unknown>, `${key}[${i}]`));
        } else {
          params.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof v === "object") {
      params.push(form(v as Record<string, unknown>, key));
    } else {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return params.filter(Boolean).join("&");
}

export type StripeResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: { message: string; type?: string; code?: string } };

export async function stripeRequest<T = unknown>(
  path: string,
  init: { method?: "GET" | "POST" | "DELETE"; body?: Record<string, unknown> } = {},
): Promise<StripeResult<T>> {
  if (!STRIPE_KEY) {
    return { ok: false, status: 500, error: { message: "STRIPE_SECRET_KEY (or STRIPE_RESTRICTED_KEY) not configured" } };
  }
  const method = init.method || "GET";
  const headers: Record<string, string> = {
    Authorization: `Basic ${Buffer.from(`${STRIPE_KEY}:`).toString("base64")}`,
  };
  let body: string | undefined;
  let url = `${API}${path}`;
  if (init.body) {
    const encoded = form(init.body);
    if (method === "GET") {
      url += (path.includes("?") ? "&" : "?") + encoded;
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      body = encoded;
    }
  }
  try {
    const res = await fetch(url, { method, headers, body });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const err = (json as { error?: { message?: string; type?: string; code?: string } }).error;
      return {
        ok: false,
        status: res.status,
        error: {
          message: err?.message || `Stripe ${method} ${path} → HTTP ${res.status}`,
          type: err?.type,
          code: err?.code,
        },
      };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: { message: e instanceof Error ? e.message : "Stripe request failed" },
    };
  }
}
