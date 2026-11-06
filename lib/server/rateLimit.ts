// SERVER ONLY. Simple in-memory limits for the public site.
//
// Note: on Vercel, memory is per server instance and is cleared when an
// instance restarts, so these limits are "good enough" protection for a demo,
// not a guarantee. They protect the Groq quota from accidental or casual abuse.

const WINDOW_MS = 60_000;
export const ASK_LIMIT_PER_MINUTE = 20;
const MAX_TRACKED_VISITORS = 5000;

const recent = new Map<string, number[]>();

/** Who is asking: the first address in x-forwarded-for (set by Vercel), else x-real-ip, else "local". */
export function visitorKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}

/** Counts one request; refuses if this visitor already made 20 in the last minute. */
export function takeAskSlot(key: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSeconds: number } {
  if (recent.size > MAX_TRACKED_VISITORS) recent.clear(); // keep memory bounded
  const times = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= ASK_LIMIT_PER_MINUTE) {
    recent.set(key, times);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((times[0] + WINDOW_MS - now) / 1000)) };
  }
  times.push(now);
  recent.set(key, times);
  return { ok: true };
}

// ---------- "Run evaluation" on the live site: at most once every 10 minutes ----------

export const EVAL_COOLDOWN_MS = 10 * 60_000;
let lastEvalStart = 0;

/** Starts an evaluation run if none started in the last 10 minutes (for everyone). */
export function claimEvalRun(now = Date.now()): { allowed: true } | { allowed: false; minutesLeft: number } {
  const waitMs = lastEvalStart + EVAL_COOLDOWN_MS - now;
  if (waitMs > 0) return { allowed: false, minutesLeft: Math.ceil(waitMs / 60_000) };
  lastEvalStart = now;
  return { allowed: true };
}
