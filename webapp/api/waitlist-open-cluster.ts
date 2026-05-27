import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { sendMail } from "./_lib/mail.js";
import { admin } from "./_lib/supabase.js";

// Owner clicks "Open this cluster" → marks every row in the cluster as
// service_available, then emails each subscriber a signup link.

type Body = { cluster_key?: string };

type WaitRow = { id: string; email: string; full_name: string | null; cluster_key: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const { cluster_key } = readJson<Body>(req);
  if (!cluster_key) return fail(res, "cluster_key required");

  try {
    const { data, error } = await admin
      .from("waitlist")
      .select("id,email,full_name,cluster_key")
      .eq("cluster_key", cluster_key);
    if (error) throw error;
    const rows = (data || []) as WaitRow[];
    if (rows.length === 0) return fail(res, "No subscribers in cluster", 404, "empty_cluster");

    await admin
      .from("waitlist")
      .update({ status: "service_available", notified_at: new Date().toISOString() })
      .eq("cluster_key", cluster_key);

    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host =
      (req.headers["x-forwarded-host"] as string) || req.headers.host || "dashtrashtx.com";
    const origin = `${proto}://${host}`;

    let sent = 0;
    let failed = 0;
    for (const r of rows) {
      const first = (r.full_name || "neighbor").split(" ")[0];
      const url = `${origin}/signup?from=waitlist&email=${encodeURIComponent(r.email)}`;
      const html = `
<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial;background:#f7f6f1;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e6dc;border-radius:24px;padding:36px 32px;color:#1a2030">
    <div style="font-family:'Bebas Neue','Arial Narrow';font-size:28px;letter-spacing:0.05em">DASH TRASH</div>
    <h1 style="font-size:24px;margin:18px 0 8px">Good news, ${first} — we're live in your neighborhood.</h1>
    <p style="color:#5b6473;line-height:1.6;margin:0 0 24px">Enough of your neighbors signed up that we can now route a driver to you every week. Lock in your spot before the route fills up.</p>
    <a href="${url}" style="display:inline-block;background:#5EE3E3;color:#1a2030;text-decoration:none;padding:14px 24px;border-radius:16px;font-weight:700">Start service — $63/mo</a>
    <p style="color:#8b94a3;font-size:13px;margin-top:28px">Questions? Reply to this email or call (682) 362-5847.</p>
  </div>
</body></html>`;
      const r2 = await sendMail({
        to: r.email,
        subject: `DashTrash is now serving your area — claim your spot`,
        text: `Hi ${first},\n\nWe're now servicing your neighborhood! Sign up here: ${url}\n\n— DashTrash`,
        html,
      });
      if (r2.ok) sent++; else failed++;
    }

    return ok(res, { cluster_key, total: rows.length, sent, failed });
  } catch (e) {
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
