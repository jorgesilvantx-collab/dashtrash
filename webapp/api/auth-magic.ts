import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendMail } from "./_lib/mail.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";

// Workaround for Supabase project's Site URL still pointing at localhost.
// We generate the magic-link server-side via the admin API, then email the
// user a link to OUR domain that carries the hashed token. The verify page
// calls supabase.auth.verifyOtp() client-side — bypassing Supabase's broken
// /auth/v1/verify redirect entirely.

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || "";

type Body = { email?: string; role?: "customer" | "driver" | "admin"; next?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  const email = (body?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return fail(res, "Valid email required");

  // Owner allow-list: these emails always get admin role regardless of what the
  // login form claims. Add more via the OWNER_EMAILS env var (comma-separated).
  const OWNER_EMAILS = new Set(
    (process.env.OWNER_EMAILS || "jorge@dashtrashtx.com,jorgesilva@dashtrashtx.com,owner@dashtrashtx.com")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );

  let role: "customer" | "driver" | "admin" =
    body?.role && ["customer", "driver", "admin"].includes(body.role) ? body.role : "customer";
  if (OWNER_EMAILS.has(email)) role = "admin";

  const next = body?.next || "";

  try {
    const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "magiclink", email }),
    });

    if (!linkRes.ok) {
      const txt = await linkRes.text().catch(() => "");
      return fail(res, `Could not generate sign-in link: ${txt}`, 500, "supabase_error");
    }

    const link = (await linkRes.json()) as { hashed_token?: string; email_otp?: string; id?: string };
    if (!link.hashed_token) return fail(res, "No token returned", 500, "supabase_error");

    if (link.id) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ id: link.id, email, role }),
      }).catch(() => {});
    }

    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "dashtrashtx.com";
    const origin = `${proto}://${host}`;

    const params = new URLSearchParams({
      email,
      token: link.hashed_token,
      type: "magiclink",
    });
    if (next) params.set("next", next);
    const verifyUrl = `${origin}/auth/verify?${params.toString()}`;

    const html = `
<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;background:#f7f6f1;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e6dc;border-radius:24px;padding:36px 32px;color:#1a2030">
    <div style="font-family:'Bebas Neue','Arial Narrow',sans-serif;font-size:28px;letter-spacing:0.05em;color:#1a2030;margin-bottom:8px">DASH TRASH</div>
    <h1 style="font-size:22px;margin:18px 0 8px;color:#1a2030">Your sign-in link</h1>
    <p style="color:#5b6473;line-height:1.6;margin:0 0 24px">Click the button below to sign in to your DashTrash account. The link expires in 1 hour.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#5EE3E3;color:#1a2030;text-decoration:none;padding:14px 24px;border-radius:16px;font-weight:700;font-size:15px">Sign in to DashTrash</a>
    <p style="color:#8b94a3;font-size:13px;margin-top:28px">If the button doesn't work, copy this link:</p>
    <p style="color:#5b6473;font-size:12px;word-break:break-all;background:#f7f6f1;padding:12px;border-radius:10px">${verifyUrl}</p>
    <p style="color:#8b94a3;font-size:12px;margin-top:24px">Didn't request this? Ignore this email — no account changes will be made.</p>
  </div>
</body></html>`;

    const send = await sendMail({
      to: email,
      subject: "Your DashTrash sign-in link",
      text: `Click to sign in: ${verifyUrl}\n\nThis link expires in 1 hour. Didn't request this? Ignore this email.`,
      html,
    });

    if (!send.ok) return fail(res, `Could not send email: ${send.error}`, 500, "email_error");

    return ok(res, { sent: true });
  } catch (e) {
    console.error("auth-magic error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
