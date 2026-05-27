import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { sendMail, SUPPORT_EMAIL, ownerInboxes } from "./_lib/mail.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { ownerNotification, driverApplied } from "./_lib/email-templates.js";

type Body = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  vehicle_make_model?: string;
  has_truck_or_suv?: boolean;
  years_driving?: number;
  availability: string;
  has_license?: boolean;
  has_insurance?: boolean;
  why_join?: string;
  preferred_routes?: string[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body?.full_name || !body?.email || !body?.phone) return fail(res, "Missing required fields");

  try {
    const { data, error } = await admin
      .from("job_applications")
      .insert({
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        state: (body.state || "TX").toUpperCase(),
        position: "driver",
        vehicle_make_model: body.vehicle_make_model || null,
        has_truck_or_suv: !!body.has_truck_or_suv,
        years_driving: body.years_driving ?? 1,
        availability: body.availability,
        has_license: !!body.has_license,
        has_insurance: !!body.has_insurance,
        why_join: [
          body.preferred_routes?.length ? `Preferred routes: ${body.preferred_routes.join(", ")}` : null,
          body.why_join,
        ].filter(Boolean).join(" | ") || null,
      })
      .select("id")
      .single();
    if (error) throw error;

    const ownerPayload: Record<string, unknown> = {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      city: body.city,
      state: body.state,
      vehicle_make_model: body.vehicle_make_model,
      has_truck_or_suv: body.has_truck_or_suv,
      years_driving: body.years_driving ?? 1,
      availability: body.availability,
      has_license: body.has_license,
      has_insurance: body.has_insurance,
      preferred_routes: body.preferred_routes,
      why_join: body.why_join,
    };
    const ownerTpl = ownerNotification({
      formType: "driver",
      payload: ownerPayload,
      leadId: data.id,
      subjectExtra: body.full_name,
      supportEmail: SUPPORT_EMAIL,
      replyToHint: body.email,
    });

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject: ownerTpl.subject,
      body: ownerTpl.text,
      template: "new_application",
      payload: { application_id: data.id, position: "driver" },
    });

    await sendMail({
      to: ownerInboxes(),
      subject: ownerTpl.subject,
      html: ownerTpl.html,
      text: ownerTpl.text,
      replyTo: body.email,
    });

    const driverTpl = driverApplied({
      firstName: body.full_name,
      supportEmail: SUPPORT_EMAIL,
    });
    await sendMail({
      to: body.email,
      subject: driverTpl.subject,
      html: driverTpl.html,
      text: driverTpl.text,
    });

    return ok(res, { kind: "submitted", applicationId: data.id });
  } catch (e) {
    console.error("signup-driver error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
