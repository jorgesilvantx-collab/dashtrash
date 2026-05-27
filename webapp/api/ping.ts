import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    data: {
      ok: true,
      now: Date.now(),
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
        hasResend: !!process.env.RESEND_API_KEY,
        hasMapbox: !!process.env.MAPBOX_TOKEN,
        supportEmail: process.env.SUPPORT_EMAIL || null,
        mailFrom: process.env.MAIL_FROM || null,
      },
    },
  });
}
