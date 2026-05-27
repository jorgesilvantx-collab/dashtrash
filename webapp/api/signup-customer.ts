import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase";
import { sendMail, SUPPORT_EMAIL } from "./_lib/mail";
import { geocodeAddress, haversineMiles, clusterKeyFromLatLng } from "./_lib/geo";
import { fail, ok, readJson, setCors } from "./_lib/http";

type Body = {
  full_name: string;
  email: string;
  phone: string;
  customer_type: "residential" | "enterprise" | "elderly";
  street_address: string;
  city: string;
  state: string;
  zip: string;
  pickup_days?: string[];
  recycling_days?: string[];
  num_bins?: number;
  num_properties?: number;
  insurance_provider?: string;
  insurance_member_id?: string;
  notes?: string;
  lat?: number;
  lng?: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return fail(res, "Method not allowed", 405);

  const body = readJson<Body>(req);
  if (!body?.full_name || !body?.email || !body?.phone || !body?.street_address) {
    return fail(res, "Missing required fields");
  }

  try {
    const fullAddress = `${body.street_address}, ${body.city}, ${body.state} ${body.zip}`;

    let geo = body.lat && body.lng ? { lat: body.lat, lng: body.lng, display: fullAddress } : null;
    if (!geo) geo = await geocodeAddress(fullAddress);

    const { data: areas } = await admin
      .from("service_areas")
      .select("center_lat, center_lng, radius_miles, cluster_threshold")
      .eq("active", true);

    let inArea = false;
    let minDistance = Infinity;
    let threshold = 25;
    if (geo && areas?.length) {
      for (const a of areas) {
        const dist = haversineMiles({ lat: geo.lat, lng: geo.lng }, { lat: a.center_lat, lng: a.center_lng });
        if (dist < minDistance) minDistance = dist;
        if (dist <= a.radius_miles) inArea = true;
        threshold = a.cluster_threshold ?? threshold;
      }
    }

    const pickup_day = (body.pickup_days?.[0]) || null;

    if (inArea || !geo) {
      const { data, error } = await admin
        .from("customer_leads")
        .insert({
          full_name: body.full_name,
          email: body.email,
          phone: body.phone,
          customer_type: body.customer_type,
          street_address: body.street_address,
          city: body.city,
          state: (body.state || "TX").toUpperCase(),
          zip: body.zip,
          lat: geo?.lat ?? null,
          lng: geo?.lng ?? null,
          pickup_day,
          num_bins: body.num_bins ?? 1,
          num_properties: body.num_properties ?? 1,
          insurance_provider: body.insurance_provider || null,
          insurance_member_id: body.insurance_member_id || null,
          notes: [
            body.pickup_days?.length ? `Trash: ${body.pickup_days.join(", ")}` : null,
            body.recycling_days?.length ? `Recycling: ${body.recycling_days.join(", ")}` : null,
            body.notes,
          ].filter(Boolean).join(" | ") || null,
          in_service_area: !!inArea,
        })
        .select("id")
        .single();
      if (error) throw error;

      const subject = `New ${body.customer_type} signup: ${body.full_name}`;
      const text = [
        `${body.full_name} (${body.email}, ${body.phone})`,
        `Type: ${body.customer_type}`,
        `Address: ${fullAddress}`,
        body.pickup_days?.length ? `Trash days: ${body.pickup_days.join(", ")}` : null,
        body.recycling_days?.length ? `Recycling days: ${body.recycling_days.join(", ")}` : null,
        `Bins: ${body.num_bins ?? 1}`,
        body.customer_type === "enterprise" ? `Properties: ${body.num_properties ?? 1}` : null,
        body.notes ? `Notes: ${body.notes}` : null,
      ].filter(Boolean).join("\n");

      await admin.from("notifications_outbox").insert({
        recipient: SUPPORT_EMAIL,
        subject,
        body: text,
        template: "new_customer_signup",
        payload: { lead_id: data.id, customer_type: body.customer_type, address: fullAddress },
      });

      const r1 = await sendMail({ to: SUPPORT_EMAIL, subject, text, replyTo: body.email });
      await sendMail({
        to: body.email,
        subject: "Welcome to DashTrashTX — we got your signup",
        text: `Hi ${body.full_name.split(" ")[0]},\n\nThanks for signing up with DashTrashTX! Our team will reach out within 24 hours to confirm your pickup schedule and complete checkout.\n\nIf you have questions, reply to this email or call (682) 362-5847.\n\n— The DashTrashTX team`,
      });

      if (data.id && r1.ok) {
        await admin
          .from("notifications_outbox")
          .update({ sent_at: new Date().toISOString() })
          .eq("payload->>lead_id", data.id)
          .is("sent_at", null);
      }

      return ok(res, { kind: "in_area", leadId: data.id });
    }

    const clusterKey = clusterKeyFromLatLng(geo.lat, geo.lng);
    const { count: existingCount } = await admin
      .from("waitlist")
      .select("id", { count: "exact", head: true })
      .eq("cluster_key", clusterKey)
      .in("status", ["waiting", "cluster_ready"]);

    const newCount = (existingCount ?? 0) + 1;

    const { data, error } = await admin
      .from("waitlist")
      .insert({
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        customer_type: body.customer_type,
        street_address: body.street_address,
        city: body.city,
        state: (body.state || "TX").toUpperCase(),
        zip: body.zip,
        lat: geo.lat,
        lng: geo.lng,
        cluster_key: clusterKey,
        cluster_size_at_signup: newCount,
        status: newCount >= threshold ? "cluster_ready" : "waiting",
        notes: body.notes || null,
      })
      .select("id")
      .single();
    if (error) throw error;

    const subject = newCount >= threshold
      ? `Cluster READY in ${clusterKey} (${newCount} signups)`
      : `New waitlist signup in ${clusterKey} (${newCount}/${threshold})`;
    const text = `${body.full_name} (${body.email}, ${body.phone}) joined the waitlist at ${fullAddress}. Cluster ${clusterKey} now has ${newCount}/${threshold} homes. Distance from nearest service area: ${minDistance.toFixed(1)} mi.`;

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject,
      body: text,
      template: newCount >= threshold ? "cluster_ready" : "waitlist_signup",
      payload: { waitlist_id: data.id, cluster_key: clusterKey, cluster_size: newCount, threshold },
    });

    await sendMail({ to: SUPPORT_EMAIL, subject, text, replyTo: body.email });
    await sendMail({
      to: body.email,
      subject: "You're on the DashTrashTX waitlist",
      text: `Hi ${body.full_name.split(" ")[0]},\n\nYour address is outside our current routes, but you're now on the waitlist for your neighborhood. Your area has ${newCount} of ${threshold} signups needed before we open service. You'll be among the first notified.\n\n— The DashTrashTX team`,
    });

    return ok(res, {
      kind: "waitlisted",
      waitlistId: data.id,
      clusterCount: newCount,
      threshold,
      distanceMiles: minDistance,
    });
  } catch (e) {
    console.error("signup-customer error", e);
    return fail(res, e instanceof Error ? e.message : "Server error", 500, "server_error");
  }
}
