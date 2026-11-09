// Best-effort, per-instance limiter. On serverless hosts each instance has its own memory,
// so treat this as a first layer only. For strong protection add Firebase App Check,
// Cloudflare Turnstile, or a shared store such as Upstash Redis.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

export function clientKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
