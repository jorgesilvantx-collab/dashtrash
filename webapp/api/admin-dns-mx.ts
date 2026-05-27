import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, setCors } from "./_lib/http.js";

// One-shot endpoint that installs Google Workspace MX records on dashtrashtx.com
// via the GoDaddy Domains API. Hit GET /api/admin-dns-mx?key=<ADMIN_KEY> from
// any browser to run it. Idempotent — overwrites any existing MX records.
//
// Requires three env vars set in Vercel:
//   GODADDY_API_KEY        — from https://developer.godaddy.com/keys
//   GODADDY_API_SECRET     — pair with the key above
//   ADMIN_ACTION_KEY       — any random string; required in ?key= to authorize
//
// Optional:
//   DOMAIN                 — defaults to dashtrashtx.com
//   GODADDY_API_BASE       — defaults to https://api.godaddy.com (use ote- for sandbox)

const GOOGLE_WORKSPACE_MX = [
  { type: "MX", name: "@", data: "aspmx.l.google.com", priority: 1, ttl: 3600 },
  { type: "MX", name: "@", data: "alt1.aspmx.l.google.com", priority: 5, ttl: 3600 },
  { type: "MX", name: "@", data: "alt2.aspmx.l.google.com", priority: 5, ttl: 3600 },
  { type: "MX", name: "@", data: "alt3.aspmx.l.google.com", priority: 10, ttl: 3600 },
  { type: "MX", name: "@", data: "alt4.aspmx.l.google.com", priority: 10, ttl: 3600 },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const adminKey = process.env.ADMIN_ACTION_KEY || "";
  const provided = (req.query.key as string) || "";
  if (!adminKey || provided !== adminKey) return fail(res, "Unauthorized", 401, "unauthorized");

  const apiKey = process.env.GODADDY_API_KEY || "";
  const apiSecret = process.env.GODADDY_API_SECRET || "";
  if (!apiKey || !apiSecret) return fail(res, "GODADDY_API_KEY / GODADDY_API_SECRET not set in Vercel", 500, "missing_env");

  const domain = (process.env.DOMAIN || "dashtrashtx.com").toLowerCase();
  const base = (process.env.GODADDY_API_BASE || "https://api.godaddy.com").replace(/\/+$/, "");
  const auth = `sso-key ${apiKey}:${apiSecret}`;

  try {
    const putRes = await fetch(`${base}/v1/domains/${domain}/records/MX/@`, {
      method: "PUT",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(GOOGLE_WORKSPACE_MX.map((r) => ({
        data: r.data,
        priority: r.priority,
        ttl: r.ttl,
      }))),
    });

    if (!putRes.ok) {
      const txt = await putRes.text().catch(() => "");
      return fail(res, `GoDaddy ${putRes.status}: ${txt}`, 502, "godaddy_error");
    }

    const getRes = await fetch(`${base}/v1/domains/${domain}/records/MX/@`, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    const records = getRes.ok ? await getRes.json().catch(() => []) : [];

    return ok(res, {
      domain,
      installed: GOOGLE_WORKSPACE_MX,
      verified: records,
      note: "DNS propagation takes 5-30 min. Then mail to support@dashtrashtx.com will land in your Google Workspace inbox.",
    });
  } catch (e) {
    console.error("admin-dns-mx error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
