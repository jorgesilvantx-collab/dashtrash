import type { VercelRequest, VercelResponse } from "@vercel/node";
import { admin } from "./_lib/supabase";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { error } = await admin.from("service_areas").select("id").limit(1);
    res.status(200).json({ data: { ok: true, error: error?.message ?? null } });
  } catch (e) {
    res.status(500).json({ error: { message: e instanceof Error ? e.message : String(e) } });
  }
}
