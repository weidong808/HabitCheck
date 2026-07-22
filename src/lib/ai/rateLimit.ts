type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.AI_RATE_LIMIT_PER_MIN || 20);

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
  }
  if (current.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  current.count += 1;
  return { allowed: true, remaining: MAX_PER_WINDOW - current.count };
}
