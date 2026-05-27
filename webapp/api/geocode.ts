import type { VercelRequest, VercelResponse } from "@vercel/node";
import { suggestAddresses } from "./_lib/geo";
import { fail, ok, setCors } from "./_lib/http";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return fail(res, "Method not allowed", 405);

  const q = String(req.query.q ?? "").trim();
  if (!q || q.length < 3) return ok(res, { suggestions: [] });

  const suggestions = await suggestAddresses(q);
  return ok(res, { suggestions });
}
