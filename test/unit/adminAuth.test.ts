import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  adminConfigured,
  hashPassword,
  issueToken,
  SESSION_HOURS,
  tokenValid,
  verifyPassword,
} from "~~/server/utils/adminAuth";

const PASSWORD = "correct-horse-battery-staple";

beforeEach(() => {
  process.env.ADMIN_PASSWORD_HASH = hashPassword(PASSWORD);
  process.env.ADMIN_SESSION_SECRET = "test-secret-not-a-real-one";
});

afterEach(() => {
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_SESSION_SECRET;
});

describe("password hashing", () => {
  it("accepts the right password", () => {
    expect(verifyPassword(PASSWORD, process.env.ADMIN_PASSWORD_HASH!)).toBe(true);
  });

  it("rejects the wrong password", () => {
    expect(verifyPassword("hunter2", process.env.ADMIN_PASSWORD_HASH!)).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(verifyPassword("", process.env.ADMIN_PASSWORD_HASH!)).toBe(false);
  });

  it("salts, so the same password hashes differently each time", () => {
    expect(hashPassword(PASSWORD)).not.toBe(hashPassword(PASSWORD));
  });

  it("never stores the password in the hash", () => {
    expect(hashPassword(PASSWORD)).not.toContain(PASSWORD);
  });

  it("rejects malformed stored values rather than throwing", () => {
    for (const bad of ["", "nonsense", "scrypt$only-two", "bcrypt$aa$bb", "scrypt$$"]) {
      expect(() => verifyPassword(PASSWORD, bad)).not.toThrow();
      expect(verifyPassword(PASSWORD, bad)).toBe(false);
    }
  });
});

describe("configuration", () => {
  it("is configured when a hash is present", () => {
    expect(adminConfigured()).toBe(true);
  });

  it("falls back to the password hash as the signing secret", () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(adminConfigured()).toBe(true);
    expect(tokenValid(issueToken())).toBe(true);
  });

  it("FAILS CLOSED with no password configured", () => {
    // The single most important property here: an unconfigured deployment must
    // show nothing, never everything.
    delete process.env.ADMIN_PASSWORD_HASH;
    expect(adminConfigured()).toBe(false);
    expect(tokenValid(issueToken())).toBe(false);
  });
});

describe("session tokens", () => {
  it("accepts a token it just issued", () => {
    expect(tokenValid(issueToken())).toBe(true);
  });

  it("rejects an expired token", () => {
    const issuedAt = Date.now() - (SESSION_HOURS + 1) * 3600_000;
    expect(tokenValid(issueToken(issuedAt))).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = issueToken();
    process.env.ADMIN_SESSION_SECRET = "a-completely-different-secret";
    expect(tokenValid(token)).toBe(false);
  });

  it("rejects a tampered expiry", () => {
    // Pushing the expiry out must invalidate the signature.
    const token = issueToken();
    const [, sig] = token.split(".");
    const forged = `${Date.now() + 999 * 3600_000}.${sig}`;
    expect(tokenValid(forged)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const [payload, sig] = issueToken().split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("a") ? "b" : "a");
    expect(tokenValid(`${payload}.${flipped}`)).toBe(false);
  });

  it("rejects junk rather than throwing", () => {
    for (const bad of [undefined, "", ".", "no-dot", "abc.", ".xyz", "a.zzzz"]) {
      expect(() => tokenValid(bad as string | undefined)).not.toThrow();
      expect(tokenValid(bad as string | undefined)).toBe(false);
    }
  });

  it("rotating the session secret signs everyone out", () => {
    const token = issueToken();
    expect(tokenValid(token)).toBe(true);
    process.env.ADMIN_SESSION_SECRET = "rotated";
    expect(tokenValid(token)).toBe(false);
  });
});
