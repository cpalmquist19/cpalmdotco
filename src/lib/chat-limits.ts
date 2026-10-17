import { STRIKE_WEIGHT, type GuardReason } from "./chat-guard";

/**
 * Per-visitor rate limits and a temporary lockout for visitors who keep sending blocked messages,
 * plus a site-wide daily cap on model calls.
 *
 * State lives in this server instance's memory. That is enough to stop a script hammering one
 * instance, but a serverless host may run several instances and restarts reset the counts, so
 * treat it as a speed bump. A shared store (Upstash/Vercel KV) is the upgrade for hard guarantees.
 */

const BURST_LIMIT = 8; // requests per minute
const HOURLY_LIMIT = 60;
const STRIKE_LIMIT = 6; // blocked-message points inside the strike window trigger a lockout
const STRIKE_WINDOW_MS = 10 * 60_000;
const LOCKOUT_MS = 10 * 60_000;
const DAILY_MODEL_CALLS = Number(process.env.CHAT_DAILY_LIMIT) || 2000;
const MAX_TRACKED_VISITORS = 5000;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

type Visitor = {
  hits: number[];
  strikes: { at: number; weight: number }[];
  lockedUntil: number;
};

const visitors = new Map<string, Visitor>();
let daily = { day: "", calls: 0 };

export type LimitResult = { ok: true } | { ok: false; status: 429 | 503; retryAfter: number; message: string };

/** Best-effort client address. Hosts such as Vercel overwrite these headers, so they can be trusted there. */
export function clientId(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
}

function visitor(id: string, now: number) {
  let entry = visitors.get(id);
  if (!entry) {
    if (visitors.size >= MAX_TRACKED_VISITORS) prune(now);
    entry = { hits: [], strikes: [], lockedUntil: 0 };
    visitors.set(id, entry);
  }
  entry.hits = entry.hits.filter((t) => now - t < HOUR);
  entry.strikes = entry.strikes.filter((s) => now - s.at < STRIKE_WINDOW_MS);
  return entry;
}

/** Forget visitors with nothing recent, so the map can't grow without bound. */
function prune(now: number) {
  for (const [id, entry] of visitors) {
    const recent = entry.hits.some((t) => now - t < HOUR);
    if (!recent && entry.lockedUntil < now) visitors.delete(id);
  }
  // Still full of active visitors (a flood from many addresses): start over rather than grow
  if (visitors.size >= MAX_TRACKED_VISITORS) visitors.clear();
}

/** Call once per incoming request, before reading the body. Counts the request if it is allowed. */
export function checkRate(id: string, now = Date.now()): LimitResult {
  const entry = visitor(id, now);

  if (entry.lockedUntil > now) {
    return {
      ok: false,
      status: 429,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
      message: "You've been sending messages I can't answer, so chat is paused for a few minutes. Please try again later.",
    };
  }

  const lastMinute = entry.hits.filter((t) => now - t < MINUTE);
  if (lastMinute.length >= BURST_LIMIT) {
    return {
      ok: false,
      status: 429,
      retryAfter: Math.max(1, Math.ceil((lastMinute[0] + MINUTE - now) / 1000)),
      message: "You're sending messages quickly. Give it a moment and try again.",
    };
  }
  if (entry.hits.length >= HOURLY_LIMIT) {
    return {
      ok: false,
      status: 429,
      retryAfter: Math.max(1, Math.ceil((entry.hits[0] + HOUR - now) / 1000)),
      message: "You've reached the hourly chat limit. Please come back a little later, or contact Caleb directly.",
    };
  }

  entry.hits.push(now);
  return { ok: true };
}

/** Call when a message was blocked by the guard. Enough of them in a short time locks the visitor out. */
export function recordStrike(id: string, reason: GuardReason, now = Date.now()) {
  const weight = STRIKE_WEIGHT[reason];
  if (weight === 0) return;
  const entry = visitor(id, now);
  entry.strikes.push({ at: now, weight });
  if (entry.strikes.reduce((sum, s) => sum + s.weight, 0) >= STRIKE_LIMIT) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.strikes = [];
  }
}

/** Call right before paying for a model call. A site-wide ceiling on spend if everything else fails. */
export function reserveModelCall(now = Date.now()): LimitResult {
  const day = new Date(now).toISOString().slice(0, 10);
  if (daily.day !== day) daily = { day, calls: 0 };
  if (daily.calls >= DAILY_MODEL_CALLS) {
    const tomorrow = Date.parse(`${day}T00:00:00Z`) + 24 * HOUR;
    return {
      ok: false,
      status: 503,
      retryAfter: Math.max(60, Math.ceil((tomorrow - now) / 1000)),
      message: "BEAM-E has answered a lot of questions today and is taking a break. Please try again tomorrow, or contact Caleb directly.",
    };
  }
  daily.calls++;
  return { ok: true };
}
