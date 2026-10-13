import { beforeEach, describe, expect, it } from "vitest";
import {
  countLinks,
  FAST_SUBMIT_MS,
  makeReference,
  rateLimit,
  redact,
  resetRateLimits,
  reviewFlags,
  verifyTurnstile,
} from "~~/server/utils/security";

beforeEach(() => resetRateLimits());

describe("reference codes", () => {
  it("is eight uppercase hex characters", () => {
    expect(makeReference()).toMatch(/^[0-9A-F]{8}$/);
  });

  it("does not repeat in a small sample", () => {
    const seen = new Set(Array.from({ length: 500 }, () => makeReference()));
    expect(seen.size).toBe(500);
  });
});

describe("rate limiting", () => {
  const opts = { limit: 3, windowMs: 60_000 };

  it("allows up to the limit then blocks", () => {
    expect(rateLimit("ip", { ...opts, now: 0 }).allowed).toBe(true);
    expect(rateLimit("ip", { ...opts, now: 1 }).allowed).toBe(true);
    expect(rateLimit("ip", { ...opts, now: 2 }).allowed).toBe(true);
    expect(rateLimit("ip", { ...opts, now: 3 }).allowed).toBe(false);
  });

  it("reports a retry-after when blocked", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip", { ...opts, now: 0 });
    const blocked = rateLimit("ip", { ...opts, now: 1000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("recovers once the window passes", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip", { ...opts, now: 0 });
    expect(rateLimit("ip", { ...opts, now: 61_000 }).allowed).toBe(true);
  });

  it("tracks each client separately", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", { ...opts, now: 0 });
    expect(rateLimit("b", { ...opts, now: 0 }).allowed).toBe(true);
  });
});

describe("review heuristics", () => {
  // The rule that matters: these flag for a human to look at. They never discard.
  // A false positive here would mean a real patient's refill request vanishing.
  const receivedAt = new Date("2026-10-13T12:00:00Z");

  it("flags a submission completed implausibly fast", () => {
    const renderedAt = new Date(receivedAt.getTime() - 500).toISOString();
    expect(reviewFlags({ renderedAt, receivedAt, freeText: [] })).toContain("fast_submit");
  });

  it("does not flag a normal pace", () => {
    const renderedAt = new Date(receivedAt.getTime() - FAST_SUBMIT_MS - 5000).toISOString();
    expect(reviewFlags({ renderedAt, receivedAt, freeText: [] })).toEqual([]);
  });

  it("flags notes stuffed with links", () => {
    const renderedAt = new Date(receivedAt.getTime() - 60_000).toISOString();
    const flags = reviewFlags({
      renderedAt,
      receivedAt,
      freeText: ["buy http://a.example http://b.example www.c.example"],
    });
    expect(flags).toContain("many_links");
  });

  it("does not flag a patient who mentions one website", () => {
    const renderedAt = new Date(receivedAt.getTime() - 60_000).toISOString();
    const flags = reviewFlags({
      renderedAt,
      receivedAt,
      freeText: ["My doctor's site is www.example.com"],
    });
    expect(flags).toEqual([]);
  });

  it("counts links regardless of scheme", () => {
    expect(countLinks("http://a www.b https://c")).toBe(3);
  });

  it("tolerates a malformed renderedAt rather than throwing", () => {
    expect(() =>
      reviewFlags({ renderedAt: "not a date", receivedAt, freeText: [] }),
    ).not.toThrow();
  });
});

describe("turnstile", () => {
  it("skips verification when no secret is configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstile("")).resolves.toMatchObject({ ok: true, skipped: true });
  });

  it("rejects an empty token when a secret is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    await expect(verifyTurnstile("")).resolves.toMatchObject({ ok: false });
    delete process.env.TURNSTILE_SECRET_KEY;
  });
});

describe("log redaction", () => {
  it("removes patient identifiers", () => {
    const redacted = redact({
      kind: "transfer",
      patient: {
        firstName: "Jane",
        lastName: "Doe",
        dateOfBirth: "1980-01-01",
        phn: "9123456789",
        email: "jane@example.com",
      },
      medications: "Ramipril 10mg",
    }) as Record<string, any>;

    expect(redacted.kind).toBe("transfer");
    expect(redacted.patient.firstName).toBe("[redacted]");
    expect(redacted.patient.phn).toBe("[redacted]");
    expect(redacted.patient.email).toBe("[redacted]");
    expect(redacted.medications).toBe("[redacted]");
  });

  it("leaves non-identifying fields alone so logs stay useful", () => {
    const redacted = redact({ reference: "A3F91C2D", flags: ["fast_submit"] }) as Record<
      string,
      any
    >;
    expect(redacted.reference).toBe("A3F91C2D");
    expect(redacted.flags).toEqual(["fast_submit"]);
  });

  it("walks arrays", () => {
    const redacted = redact([{ email: "a@b.c" }]) as Record<string, any>[];
    expect(redacted[0].email).toBe("[redacted]");
  });

  it("never leaks a PHN into a serialised log line", () => {
    const line = JSON.stringify(redact({ patient: { phn: "9123456789" } }));
    expect(line).not.toContain("9123456789");
  });
});
