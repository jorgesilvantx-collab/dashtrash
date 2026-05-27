import type { VercelRequest, VercelResponse } from "@vercel/node";

export function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function readJson<T = unknown>(req: VercelRequest): T {
  const b = req.body;
  if (!b) return {} as T;
  if (typeof b === "string") {
    try { return JSON.parse(b) as T; } catch { return {} as T; }
  }
  return b as T;
}

export function ok(res: VercelResponse, data: unknown, status = 200) {
  setCors(res);
  res.status(status).json({ data });
}

export function fail(res: VercelResponse, message: string, status = 400, code = "bad_request") {
  setCors(res);
  res.status(status).json({ error: { message, code } });
}

export function rateKey(req: VercelRequest) {
  const fwd = req.headers["x-forwarded-for"];
  const ip = Array.isArray(fwd) ? fwd[0] : (fwd ?? "").split(",")[0]?.trim();
  return ip || (req.socket?.remoteAddress ?? "unknown");
}
