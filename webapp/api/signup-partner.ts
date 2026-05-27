import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { sendMail, SUPPORT_EMAIL } from "./_lib/mail.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";

type Body = {
  organization: string;
  full_name: string;
  role?: string;
  email: string;
  phone: string;
  org_type?: string;
  clients_count?: number;
  city?: string;
  notes?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body?.organization || !body?.full_name || !body?.email || !body?.phone) {
    return fail(res, "Missing required fields");
  }

  try {
    const subject = `New partner inquiry: ${body.organization}`;
    const text = [
      `Organization: ${body.organization}`,
      `Contact: ${body.full_name}${body.role ? ` (${body.role})` : ""}`,
      `Email: ${body.email}`,
      `Phone: ${body.phone}`,
      body.org_type ? `Type: ${body.org_type}` : null,
      body.clients_count ? `Clients: ${body.clients_count}` : null,
      body.city ? `City: ${body.city}` : null,
      body.notes ? `Notes: ${body.notes}` : null,
    ].filter(Boolean).join("\n");

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject,
      body: text,
      template: "new_partner_inquiry",
      payload: {
        organization: body.organization,
        contact_name: body.full_name,
        email: body.email,
        phone: body.phone,
        org_type: body.org_type,
        clients_count: body.clients_count,
        city: body.city,
        notes: body.notes,
      },
    });

    await sendMail({ to: SUPPORT_EMAIL, subject, text, replyTo: body.email });
    await sendMail({
      to: body.email,
      subject: "DashTrashTX partnership — we got your inquiry",
      text: `Hi ${body.full_name.split(" ")[0]},\n\nThanks for reaching out about a DashTrashTX partnership for ${body.organization}. Our partner team will review and reach out within 1 business day to discuss how we can support your clients.\n\nQuestions in the meantime? Reply to this email or call (682) 362-5847.\n\n— The DashTrashTX team`,
    });

    return ok(res, { kind: "submitted" });
  } catch (e) {
    console.error("signup-partner error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
