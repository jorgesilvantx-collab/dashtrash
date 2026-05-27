import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase.js";
import { sendMail, SUPPORT_EMAIL } from "./_lib/mail.js";
import { geocodeAddress, haversineMiles, clusterKeyFromLatLng } from "./_lib/geo.js";
import { fail, ok, readJson, setCors } from "./_lib/http.js";
import { ownerNotification, welcomeInArea, waitlistJoined } from "./_lib/email-templates.js";

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
  user_id?: string;
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
          user_id: body.user_id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const ownerPayload: Record<string, unknown> = {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        customer_type: body.customer_type,
        address: fullAddress,
        trash_days: body.pickup_days,
        recycling_days: body.recycling_days,
        num_bins: body.num_bins ?? 1,
        ...(body.customer_type === "enterprise"
          ? { num_properties: body.num_properties ?? 1 }
          : {}),
        insurance_provider: body.insurance_provider,
        insurance_member_id: body.insurance_member_id,
        notes: body.notes,
      };
      const ownerTpl = ownerNotification({
        formType: "customer-in-area",
        payload: ownerPayload,
        leadId: data.id,
        subjectExtra: `${body.full_name} @ ${fullAddress}`,
        supportEmail: SUPPORT_EMAIL,
        replyToHint: body.email,
      });

      await admin.from("notifications_outbox").insert({
        recipient: SUPPORT_EMAIL,
        subject: ownerTpl.subject,
        body: ownerTpl.text,
        template: "new_customer_signup",
        payload: { lead_id: data.id, customer_type: body.customer_type, address: fullAddress },
      });

      const r1 = await sendMail({
        to: SUPPORT_EMAIL,
        subject: ownerTpl.subject,
        html: ownerTpl.html,
        text: ownerTpl.text,
        replyTo: body.email,
      });

      const customerTpl = welcomeInArea({
        firstName: body.full_name,
        address: fullAddress,
        supportEmail: SUPPORT_EMAIL,
      });
      await sendMail({
        to: body.email,
        subject: customerTpl.subject,
        html: customerTpl.html,
        text: customerTpl.text,
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
        user_id: body.user_id ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;

    const clusterReady = newCount >= threshold;
    const ownerPayload: Record<string, unknown> = {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      customer_type: body.customer_type,
      address: fullAddress,
      cluster_key: clusterKey,
      cluster_progress: `${newCount} / ${threshold}`,
      distance_from_service: `${minDistance.toFixed(1)} mi`,
      cluster_status: clusterReady ? "READY — threshold hit" : "Waiting",
      notes: body.notes,
    };
    const ownerTpl = ownerNotification({
      formType: "customer-waitlist",
      payload: ownerPayload,
      leadId: data.id,
      subjectExtra: clusterReady
        ? `Cluster READY in ${clusterKey} (${newCount} signups)`
        : `${body.full_name} joined cluster ${clusterKey} (${newCount}/${threshold})`,
      supportEmail: SUPPORT_EMAIL,
      replyToHint: body.email,
    });

    await admin.from("notifications_outbox").insert({
      recipient: SUPPORT_EMAIL,
      subject: ownerTpl.subject,
      body: ownerTpl.text,
      template: clusterReady ? "cluster_ready" : "waitlist_signup",
      payload: { waitlist_id: data.id, cluster_key: clusterKey, cluster_size: newCount, threshold },
    });

    await sendMail({
      to: SUPPORT_EMAIL,
      subject: ownerTpl.subject,
      html: ownerTpl.html,
      text: ownerTpl.text,
      replyTo: body.email,
    });

    const customerTpl = waitlistJoined({
      firstName: body.full_name,
      address: fullAddress,
      current: newCount,
      threshold,
      neighborsNeeded: Math.max(0, threshold - newCount),
      supportEmail: SUPPORT_EMAIL,
    });
    await sendMail({
      to: body.email,
      subject: customerTpl.subject,
      html: customerTpl.html,
      text: customerTpl.text,
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
