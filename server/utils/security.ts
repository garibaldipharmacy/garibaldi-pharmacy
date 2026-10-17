// Spam defence, rate limiting and log redaction.
//
// Guiding rule: **only the honeypot may silently discard a submission.** A human
// cannot fill a hidden field, so a hit there is certainly a bot. Every other
// signal is probabilistic, and a false positive means a real patient's refill
// request quietly disappears. Those signals flag for review instead.

import { randomBytes } from "node:crypto";

// ---------------------------------------------------------------------------
// Reference codes
// ---------------------------------------------------------------------------

/**
 * Short code shown to the patient and quoted on the phone. Eight hex characters
 * is ~4 billion values, which is ample when it only has to be unique among open
 * requests, and short enough to read aloud without sighing.
 */
export function makeReference(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed sliding window, in memory. Fine for a single-origin site: there is one
 * process, and a restart losing the window is not a meaningful attack.
 */
export function rateLimit(
  key: string,
  { limit, windowMs, now = Date.now() }: { limit: number; windowMs: number; now?: number },
): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimits(): void {
  buckets.clear();
}

// ---------------------------------------------------------------------------
// Heuristics: flag, never drop
// ---------------------------------------------------------------------------

/** Below this, a human did not read and fill the form. */
export const FAST_SUBMIT_MS = 2000;

/** A prescription note containing this many links is not a patient. */
export const SUSPICIOUS_LINK_COUNT = 3;

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

export interface HeuristicInput {
  renderedAt: string;
  receivedAt: Date;
  freeText: string[];
}

/**
 * Returns review flags. Never a verdict. A flagged submission is still stored and
 * still shown to staff, just with a marker.
 */
export function reviewFlags(input: HeuristicInput): string[] {
  const flags: string[] = [];

  const rendered = Date.parse(input.renderedAt);
  if (!Number.isNaN(rendered)) {
    const elapsed = input.receivedAt.getTime() - rendered;
    if (elapsed >= 0 && elapsed < FAST_SUBMIT_MS) flags.push("fast_submit");
  }

  const links = input.freeText.reduce((n, t) => n + countLinks(t), 0);
  if (links >= SUSPICIOUS_LINK_COUNT) flags.push("many_links");

  return flags;
}

// ---------------------------------------------------------------------------
// Turnstile
// ---------------------------------------------------------------------------

export interface TurnstileOutcome {
  ok: boolean;
  skipped: boolean;
}

/**
 * Verifies a Cloudflare Turnstile token.
 *
 * When no secret is configured (local development, unit tests) verification is
 * skipped rather than failed, so the form is usable without Cloudflare. The
 * deployment checklist must confirm the secret is set in production.
 */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<TurnstileOutcome> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const json = (await res.json()) as { success?: boolean };
    return { ok: json.success === true, skipped: false };
  } catch {
    // Cloudflare being unreachable must not block a prescription request.
    // Fail open and let the flag-for-review path carry the risk.
    return { ok: true, skipped: true };
  }
}

// ---------------------------------------------------------------------------
// Log redaction
// ---------------------------------------------------------------------------

const PHI_KEYS = new Set([
  "firstname",
  "lastname",
  "dateofbirth",
  "phn",
  "phone",
  "email",
  "medications",
  "notes",
  "specialinstructions",
  "frompharmacyname",
  "frompharmacyphone",
  "originalname",
  "sex",
]);

/**
 * Strips patient data before anything reaches a log line. Never log a raw request
 * body; log the output of this instead.
 */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PHI_KEYS.has(k.toLowerCase()) ? "[redacted]" : redact(v);
    }
    return out;
  }
  return value;
}
