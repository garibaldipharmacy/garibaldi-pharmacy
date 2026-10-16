import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, generateKeyPairSync } from "node:crypto";

import { closeDb, getDb, persistSubmission } from "~~/server/utils/db";
import { storeEncrypted } from "~~/server/utils/files";
import { resetSyncKeyCache } from "~~/server/utils/sealedBox";
import {
  acknowledgeDelivery,
  hashToken,
  pendingOutbox,
  purgeDelivered,
  PURGE_GRACE_DAYS,
  syncEnabled,
} from "~~/server/utils/sync";

let dir: string;
let counter = 0;

function keypair() {
  const { publicKey } = generateKeyPairSync("x25519");
  return (publicKey.export({ format: "der", type: "spki" }) as Buffer).toString("base64");
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "gp-sync-"));
  process.env.DATA_DIR = dir;
  process.env.DATABASE_PATH = join(dir, "test.db");
  process.env.SYNC_PUBLIC_KEY = keypair();
  process.env.SYNC_TOKEN_HASH = hashToken("test-token");
  resetSyncKeyCache();
  closeDb();
});

afterEach(() => {
  closeDb();
  rmSync(dir, { recursive: true, force: true });
  delete process.env.SYNC_PUBLIC_KEY;
  delete process.env.SYNC_TOKEN_HASH;
  resetSyncKeyCache();
});

function submit(overrides: Record<string, unknown> = {}) {
  const args = {
    id: randomUUID(),
    reference: `REF${String(counter++).padStart(5, "0")}`,
    kind: "refill",
    receivedAt: new Date().toISOString(),
    flags: [] as string[],
    idempotencyKey: randomUUID(),
    payload: {
      kind: "refill",
      patient: { firstName: "Testy", lastName: "McFixture", phn: "9123456789" },
      medications: "Ramipril 10mg capsules",
    },
    files: [],
    notifications: [],
    ...overrides,
  };
  persistSubmission(args as Parameters<typeof persistSubmission>[0]);
  return args;
}

describe("configuration", () => {
  it("needs both a public key and a token hash", () => {
    expect(syncEnabled()).toBe(true);

    delete process.env.SYNC_TOKEN_HASH;
    expect(syncEnabled()).toBe(false);

    process.env.SYNC_TOKEN_HASH = hashToken("test-token");
    delete process.env.SYNC_PUBLIC_KEY;
    resetSyncKeyCache();
    expect(syncEnabled()).toBe(false);
  });

  it("hashes tokens consistently and ignores surrounding whitespace", () => {
    expect(hashToken("abc")).toBe(hashToken("  abc\n"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("outbox", () => {
  it("returns pending submissions sealed, with no plaintext", () => {
    submit();
    const [item] = pendingOutbox();

    expect(item.kind).toBe("refill");
    // The envelope must not leak what it contains.
    const sealed = Buffer.from(item.sealed, "base64");
    expect(sealed.includes(Buffer.from("9123456789"))).toBe(false);
    expect(sealed.includes(Buffer.from("McFixture"))).toBe(false);
    expect(sealed.includes(Buffer.from("Ramipril"))).toBe(false);
  });

  it("exposes only non-identifying metadata in the clear", () => {
    submit();
    const [item] = pendingOutbox();
    // Enough for the dashboard to track and fetch, nothing about the patient.
    expect(Object.keys(item).sort()).toEqual(
      ["files", "id", "kind", "receivedAt", "reference", "sealed"].sort(),
    );
  });

  it("drains oldest first, so a backlog clears in submission order", () => {
    const older = submit({ receivedAt: new Date(Date.now() - 3600_000).toISOString() });
    const newer = submit();
    expect(pendingOutbox().map((i) => i.id)).toEqual([older.id, newer.id]);
  });

  it("respects the limit", () => {
    submit();
    submit();
    submit();
    expect(pendingOutbox(2)).toHaveLength(2);
  });

  it("clamps an absurd limit rather than trusting it", () => {
    submit();
    expect(() => pendingOutbox(1_000_000)).not.toThrow();
  });

  it("stops returning a submission once acknowledged", () => {
    const s = submit();
    expect(pendingOutbox()).toHaveLength(1);
    acknowledgeDelivery([s.id]);
    expect(pendingOutbox()).toHaveLength(0);
  });
});

describe("acknowledgement", () => {
  it("marks delivered and schedules the purge", () => {
    const s = submit();
    expect(acknowledgeDelivery([s.id])).toBe(1);

    const row = getDb()
      .prepare("SELECT delivered_at, purge_after FROM submissions WHERE id = ?")
      .get(s.id) as unknown as { delivered_at: string; purge_after: string };

    expect(row.delivered_at).toBeTruthy();
    const gap = Date.parse(row.purge_after) - Date.parse(row.delivered_at);
    expect(Math.round(gap / 86_400_000)).toBe(PURGE_GRACE_DAYS);
  });

  it("is idempotent, so a retried ack is harmless", () => {
    const s = submit();
    expect(acknowledgeDelivery([s.id])).toBe(1);
    expect(acknowledgeDelivery([s.id])).toBe(0);
  });

  it("ignores unknown ids without failing the batch", () => {
    const s = submit();
    expect(acknowledgeDelivery(["nope", s.id, "also-nope"])).toBe(1);
  });

  it("does nothing for an empty list", () => {
    expect(acknowledgeDelivery([])).toBe(0);
  });
});

describe("purge", () => {
  it("NEVER deletes a submission the pharmacy has not acknowledged", () => {
    // The single most important property here. An unread prescription request
    // must survive regardless of age; losing one is the worst outcome possible.
    submit({ receivedAt: new Date(Date.now() - 365 * 86_400_000).toISOString() });
    const result = purgeDelivered(new Date(Date.now() + 10 * 86_400_000));
    expect(result.submissions).toBe(0);
    expect(getDb().prepare("SELECT COUNT(*) AS n FROM submissions").get()).toMatchObject({
      n: 1,
    });
  });

  it("leaves an acknowledged submission alone until the grace period expires", () => {
    const s = submit();
    acknowledgeDelivery([s.id]);
    expect(purgeDelivered(new Date()).submissions).toBe(0);
  });

  it("deletes an acknowledged submission after the grace period", () => {
    const s = submit();
    acknowledgeDelivery([s.id]);

    const later = new Date(Date.now() + (PURGE_GRACE_DAYS + 1) * 86_400_000);
    expect(purgeDelivered(later).submissions).toBe(1);
    expect(getDb().prepare("SELECT COUNT(*) AS n FROM submissions").get()).toMatchObject({
      n: 0,
    });
  });

  it("removes the encrypted files with the row", () => {
    const stored = storeEncrypted(Buffer.from("%PDF-1.7 prescription"));
    const s = submit({
      kind: "send",
      files: [
        {
          id: stored.id,
          role: "prescription",
          position: 0,
          original_name: "script.pdf",
          mime: "application/pdf",
          bytes: stored.bytes,
          sha256: stored.sha256,
          path: stored.path,
        },
      ],
    });

    const onDisk = join(dir, "uploads", stored.path);
    expect(existsSync(onDisk)).toBe(true);

    acknowledgeDelivery([s.id]);
    purgeDelivered(new Date(Date.now() + (PURGE_GRACE_DAYS + 1) * 86_400_000));

    expect(existsSync(onDisk)).toBe(false);
  });
});
