import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fail, ok, setCors } from "./_lib/http.js";
import { sendMail, ownerInboxes } from "./_lib/mail.js";

// One-shot endpoint that sends a test email to every owner inbox so Jorge can
// verify delivery from the live site. Visit GET /api/admin-test-email?key=<ADMIN_ACTION_KEY>.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const adminKey = process.env.ADMIN_ACTION_KEY || "";
  const provided = (req.query.key as string) || "";
  if (!adminKey || provided !== adminKey) return fail(res, "Unauthorized", 401, "unauthorized");

  const inboxes = ownerInboxes();
  if (!inboxes.length) return fail(res, "No owner inboxes configured", 500, "missing_config");

  const stamp = new Date().toISOString();
  const result = await sendMail({
    to: inboxes,
    subject: `DashTrashTX delivery test — ${stamp}`,
    text: `This is a delivery test from your live Vercel deployment.\n\nRecipients: ${inboxes.join(", ")}\nSent: ${stamp}\n\nIf you see this in your inbox, owner notifications are working.`,
    html: `<div style="font-family:ui-sans-serif,system-ui,Arial;background:#f7f6f1;padding:32px"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #e8e6dc"><h1 style="color:#1a2030;margin:0 0 12px;font-size:22px">DashTrashTX delivery test</h1><p style="color:#5b6473;line-height:1.6;margin:0 0 16px">Live Vercel → Resend test fired at <strong>${stamp}</strong>.</p><p style="color:#5b6473;line-height:1.6;margin:0 0 16px">Recipients: <code style="background:#f7f6f1;padding:2px 6px;border-radius:6px">${inboxes.join(", ")}</code></p><p style="color:#8b94a3;font-size:13px;margin:0">If this lands in your inbox, signup/waitlist/driver/partner notifications will too.</p></div></div>`,
  });

  if (!result.ok) return fail(res, `Send failed: ${result.error}`, 502, "send_failed");
  return ok(res, { sent: true, to: inboxes, resendId: result.id, at: stamp });
}
