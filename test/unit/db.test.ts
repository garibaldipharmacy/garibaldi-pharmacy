import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import {
  acknowledgeSubmission,
  backupTo,
  closeDb,
  countUnacknowledgedOlderThan,
  getSubmission,
  getSubmissionFiles,
  listSubmissions,
  persistSubmission,
  getDb,
} from "~~/server/utils/db";
import { DatabaseSync } from "~~/server/utils/sqlite";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "gp-db-"));
  process.env.DATABASE_PATH = join(dir, "test.db");
  closeDb();
});

afterEach(() => {
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

let referenceCounter = 0;

function submission(overrides: Partial<Parameters<typeof persistSubmission>[0]> = {}) {
  return {
    id: randomUUID(),
    // Unique per call: `reference` is uniquely indexed, as it must be.
    reference: `REF${String(referenceCounter++).padStart(5, "0")}`,
    kind: "refill",
    receivedAt: new Date().toISOString(),
    flags: [] as string[],
    idempotencyKey: randomUUID(),
    payload: { kind: "refill", medications: "Ramipril 10mg" },
    files: [],
    notifications: [{ kind: "patient_confirmation", recipient: "patient@example.com" }],
    ...overrides,
  };
}

describe("persistence", () => {
  it("stores a submission and returns it", () => {
    const s = submission();
    expect(persistSubmission(s)).toEqual({ duplicate: false });

    const row = getSubmission(s.id);
    expect(row).toMatchObject({ reference: s.reference, kind: "refill", status: "new" });
    expect(JSON.parse(row!.payload)).toMatchObject({ medications: "Ramipril 10mg" });
  });

  it("stores attached files alongside the submission", () => {
    const s = submission({
      kind: "send",
      files: [
        {
          id: "f_1",
          role: "prescription",
          position: 0,
          original_name: "IMG_4821.HEIC",
          mime: "image/heic",
          bytes: 1234,
          sha256: "a".repeat(64),
          path: "2026/10/f_1.enc",
        },
      ],
    });
    persistSubmission(s);
    const files = getSubmissionFiles(s.id);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ role: "prescription", mime: "image/heic" });
  });

  it("treats a repeated idempotency key as a no-op", () => {
    // A double-tapped submit button must not create two prescription requests.
    const key = randomUUID();
    expect(persistSubmission(submission({ idempotencyKey: key }))).toEqual({
      duplicate: false,
    });
    expect(persistSubmission(submission({ idempotencyKey: key }))).toEqual({
      duplicate: true,
    });
    expect(listSubmissions()).toHaveLength(1);
  });

  it("writes everything in one transaction", () => {
    // A file row referencing nothing would violate the foreign key, and the whole
    // submission must roll back rather than leaving an orphan record.
    const s = submission({
      files: [
        {
          id: "f_bad",
          role: "prescription",
          position: 0,
          original_name: "x",
          mime: "image/png",
          bytes: 1,
          sha256: "b".repeat(64),
          // Duplicate primary key on the second insert below forces a failure.
          path: "2026/10/f_bad.enc",
        },
        {
          id: "f_bad",
          role: "prescription",
          position: 1,
          original_name: "y",
          mime: "image/png",
          bytes: 1,
          sha256: "c".repeat(64),
          path: "2026/10/f_bad2.enc",
        },
      ],
    });
    expect(() => persistSubmission(s)).toThrow();
    expect(getSubmission(s.id)).toBeUndefined();
    expect(listSubmissions()).toHaveLength(0);
  });
});

describe("acknowledgement", () => {
  it("starts the retention clock only when a human acknowledges", () => {
    const s = submission();
    persistSubmission(s);
    expect(getSubmission(s.id)!.acknowledged_at).toBeNull();

    expect(acknowledgeSubmission(s.id, "DG")).toBe(true);
    const row = getSubmission(s.id)!;
    expect(row.status).toBe("in_progress");
    expect(row.acknowledged_at).not.toBeNull();
    expect(row.acknowledged_by).toBe("DG");
  });

  it("is idempotent, so two staff clicking at once cannot double-claim", () => {
    const s = submission();
    persistSubmission(s);
    expect(acknowledgeSubmission(s.id, "DG")).toBe(true);
    expect(acknowledgeSubmission(s.id, "EU")).toBe(false);
    expect(getSubmission(s.id)!.acknowledged_by).toBe("DG");
  });

  it("counts unacknowledged submissions, which is the overdue alarm", () => {
    const old = new Date(Date.now() - 48 * 3600_000).toISOString();
    persistSubmission(submission({ receivedAt: old }));
    persistSubmission(submission());

    const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
    expect(countUnacknowledgedOlderThan(cutoff)).toBe(1);
  });

  it("stops counting once acknowledged", () => {
    const old = new Date(Date.now() - 48 * 3600_000).toISOString();
    const s = submission({ receivedAt: old });
    persistSubmission(s);
    acknowledgeSubmission(s.id, "DG");

    const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
    expect(countUnacknowledgedOlderThan(cutoff)).toBe(0);
  });
});

describe("listing", () => {
  it("puts unacknowledged requests first, newest first within that", () => {
    const older = submission({
      receivedAt: new Date(Date.now() - 3600_000).toISOString(),
      reference: "OLDER001",
    });
    const newer = submission({ reference: "NEWER002" });
    persistSubmission(older);
    persistSubmission(newer);
    acknowledgeSubmission(newer.id, "DG");

    const rows = listSubmissions();
    expect(rows.map((r) => r.reference)).toEqual(["OLDER001", "NEWER002"]);
  });
});

describe("backups", () => {
  it("writes a consistent snapshot with VACUUM INTO", () => {
    // node:sqlite has no .backup(), but VACUUM INTO is plain SQL and gives a
    // consistent copy of a live WAL database.
    persistSubmission(submission());
    const snapshot = join(dir, "snapshot.db");
    backupTo(snapshot);
    expect(existsSync(snapshot)).toBe(true);
  });
});

describe("upgrading an existing database", () => {
  it("adds the sync columns to a submissions table created before sync existed", () => {
    // Staging and production already hold this table. CREATE TABLE IF NOT EXISTS
    // leaves it alone, so the new columns have to be added explicitly or every
    // query that touches them fails.
    const old = new DatabaseSync(process.env.DATABASE_PATH!);
    old.exec(`CREATE TABLE submissions (
      id              TEXT PRIMARY KEY,
      reference       TEXT NOT NULL UNIQUE,
      kind            TEXT NOT NULL,
      received_at     TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'new',
      flags           TEXT NOT NULL DEFAULT '[]',
      acknowledged_at TEXT,
      acknowledged_by TEXT,
      idempotency_key TEXT NOT NULL UNIQUE,
      payload         TEXT NOT NULL
    );`);
    old.exec(`INSERT INTO submissions (id, reference, kind, received_at, idempotency_key, payload)
      VALUES ('old-1', 'OLD00001', 'refill', '2026-09-01T00:00:00.000Z', 'k-1', '{}');`);
    old.close();

    const db = getDb();
    const columns = (db.prepare("PRAGMA table_info(submissions)").all() as { name: string }[]).map((c) => c.name);
    expect(columns).toEqual(expect.arrayContaining(["delivered_at", "purge_after"]));

    const indexes = (db.prepare("PRAGMA index_list(submissions)").all() as { name: string }[]).map((i) => i.name);
    expect(indexes).toEqual(expect.arrayContaining(["submissions_undelivered_idx", "submissions_purge_idx"]));

    // The existing request survives, still waiting to be delivered.
    expect(getSubmission("old-1")).toMatchObject({ reference: "OLD00001", delivered_at: null, purge_after: null });
    persistSubmission(submission());
    expect(listSubmissions()).toHaveLength(2);
  });
});
