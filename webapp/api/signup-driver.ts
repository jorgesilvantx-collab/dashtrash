import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { sendMail, SUPPORT_EMAIL } from "./_lib/mail.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";

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

    const subject = `New driver application: ${body.full_name}`;
    const text = [
      `${body.full_name} (${body.email}, ${body.phone})`,
      `Location: ${body.city}, ${body.state}`,
      `Vehicle: ${body.vehicle_make_model || "n/a"}`,
      `Truck/SUV: ${body.has_truck_or_suv ? "yes" : "no"}`,
      `Years driving: ${body.years_driving ?? 1}`,
      `License: ${body.has_license ? "yes" : "no"}`,
      `Insurance: ${body.has_insurance ? "yes" : "no"}`,
      `Availability: ${body.availability}`,
      body.preferred_routes?.length ? `Preferred routes: ${body.preferred_routes.join(", ")}` : null,
      body.why_join ? `Why: ${body.why_join}` : null,
    ].filter(Boolean).join("\n");

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject,
      body: text,
      template: "new_application",
      payload: { application_id: data.id, position: "driver" },
    });

    await sendMail({ to: SUPPORT_EMAIL, subject, text, replyTo: body.email });
    await sendMail({
      to: body.email,
      subject: "We got your DashTrashTX application",
      text: `Hi ${body.full_name.split(" ")[0]},\n\nThanks for applying to drive with DashTrashTX! We review every application within 48 hours. If you're a fit, we'll reach out to schedule a quick call and a ride-along.\n\nQuestions? Reply to this email or call (682) 362-5847.\n\n— The DashTrashTX team`,
    });

    return ok(res, { kind: "submitted", applicationId: data.id });
  } catch (e) {
    console.error("signup-driver error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
