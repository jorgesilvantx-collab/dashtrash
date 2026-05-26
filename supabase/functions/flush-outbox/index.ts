// supabase/functions/flush-outbox/index.ts
// Reads unsent rows from notifications_outbox and sends them via Resend.
// Invoke on a cron (every minute) or manually via a POST.
//
// Required env:
//   SUPABASE_URL                — auto-set by Supabase
//   SUPABASE_SERVICE_ROLE_KEY   — auto-set by Supabase
//   RESEND_API_KEY              — set via `supabase secrets set RESEND_API_KEY=...`
//   MAIL_FROM                   — e.g. "DashTrashTX <noreply@dashtrashtx.com>"
//
// deno-lint-ignore-file no-explicit-any

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "DashTrashTX <noreply@dashtrashtx.com>";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function sendEmail(to: string, subject: string, body: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [to],
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`resend ${res.status}: ${errText}`);
  }
  return await res.json();
}

Deno.serve(async (_req) => {
  const { data: rows, error } = await supabase
    .from("notifications_outbox")
    .select("id, recipient, subject, body")
    .is("sent_at", null)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  for (const row of rows ?? []) {
    try {
      await sendEmail(row.recipient, row.subject, row.body);
      await supabase
        .from("notifications_outbox")
        .update({ sent_at: new Date().toISOString(), error: null })
        .eq("id", row.id);
      results.push({ id: row.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase
        .from("notifications_outbox")
        .update({ error: msg })
        .eq("id", row.id);
      results.push({ id: row.id, ok: false, error: msg });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
