import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { sendMail, SUPPORT_EMAIL } from "./_lib/mail.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { ownerNotification, partnerInquiry } from "./_lib/email-templates.js";

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
    const ownerPayload: Record<string, unknown> = {
      organization: body.organization,
      full_name: body.full_name,
      role: body.role,
      email: body.email,
      phone: body.phone,
      org_type: body.org_type,
      clients_count: body.clients_count,
      city: body.city,
      notes: body.notes,
    };
    const ownerTpl = ownerNotification({
      formType: "partner",
      payload: ownerPayload,
      subjectExtra: `${body.organization} (${body.full_name})`,
      supportEmail: SUPPORT_EMAIL,
      replyToHint: body.email,
    });

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject: ownerTpl.subject,
      body: ownerTpl.text,
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

    await sendMail({
      to: SUPPORT_EMAIL,
      subject: ownerTpl.subject,
      html: ownerTpl.html,
      text: ownerTpl.text,
      replyTo: body.email,
    });

    const partnerTpl = partnerInquiry({
      firstName: body.full_name,
      companyName: body.organization,
      supportEmail: SUPPORT_EMAIL,
    });
    await sendMail({
      to: body.email,
      subject: partnerTpl.subject,
      html: partnerTpl.html,
      text: partnerTpl.text,
    });

    return ok(res, { kind: "submitted" });
  } catch (e) {
    console.error("signup-partner error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
