// Every database call in the app goes through this module.
//
// We use `node:sqlite`, which is built into Node 24, so there is no native module
// to compile and nothing for the CI-build-then-rsync pipeline to get wrong. The
// surface we use is deliberately tiny, so swapping to another driver later would
// be a change to this one file.

// Loaded through a shim; see server/utils/sqlite.ts for why.
import { DatabaseSync, type SqliteDatabase } from "./sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export interface SubmissionRow {
  id: string;
  reference: string;
  kind: string;
  received_at: string;
  status: string;
  flags: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  idempotency_key: string;
  payload: string;
  delivered_at: string | null;
  purge_after: string | null;
}

export interface SubmissionFileRow {
  id: string;
  submission_id: string;
  role: string;
  position: number;
  original_name: string;
  mime: string;
  bytes: number;
  sha256: string;
  path: string;
}

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS submissions (
     id              TEXT PRIMARY KEY,
     reference       TEXT NOT NULL UNIQUE,
     kind            TEXT NOT NULL,
     received_at     TEXT NOT NULL,
     status          TEXT NOT NULL DEFAULT 'new',
     flags           TEXT NOT NULL DEFAULT '[]',
     acknowledged_at TEXT,
     acknowledged_by TEXT,
     idempotency_key TEXT NOT NULL UNIQUE,
     payload         TEXT NOT NULL,
     -- Sync bookkeeping. The droplet is a mailbox, not an archive: once the
     -- pharmacy has acknowledged a submission it is purged after a short grace
     -- period, so a breach here exposes days rather than years.
     delivered_at    TEXT,
     purge_after     TEXT
   );`,
  `CREATE INDEX IF NOT EXISTS submissions_undelivered_idx
     ON submissions (delivered_at, received_at);`,
  `CREATE INDEX IF NOT EXISTS submissions_purge_idx
     ON submissions (purge_after);`,
  `CREATE INDEX IF NOT EXISTS submissions_status_idx
     ON submissions (status, received_at);`,
  `CREATE TABLE IF NOT EXISTS submission_files (
     id            TEXT PRIMARY KEY,
     submission_id TEXT NOT NULL,
     role          TEXT NOT NULL,
     position      INTEGER NOT NULL,
     original_name TEXT NOT NULL,
     mime          TEXT NOT NULL,
     bytes         INTEGER NOT NULL,
     sha256        TEXT NOT NULL,
     path          TEXT NOT NULL,
     FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE
   );`,
  `CREATE INDEX IF NOT EXISTS submission_files_submission_idx
     ON submission_files (submission_id);`,
  // Notifications are queued, not sent inline. An email provider having a bad
  // minute must never mean a prescription request is accepted and then lost.
  `CREATE TABLE IF NOT EXISTS outbox (
     id              INTEGER PRIMARY KEY AUTOINCREMENT,
     submission_id   TEXT NOT NULL,
     kind            TEXT NOT NULL,
     recipient       TEXT NOT NULL,
     attempts        INTEGER NOT NULL DEFAULT 0,
     next_attempt_at TEXT NOT NULL,
     sent_at         TEXT,
     last_error      TEXT,
     FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE
   );`,
  `CREATE INDEX IF NOT EXISTS outbox_pending_idx
     ON outbox (sent_at, next_attempt_at);`,
  // Blog posts. The body is kept twice: the editor's JSON, which is what gets
  // edited, and the HTML made from it when saved, which is what visitors get.
  // An announcement is the three announcement_ columns, all set or all null.
  `CREATE TABLE IF NOT EXISTS posts (
     id                     TEXT PRIMARY KEY,
     slug                   TEXT NOT NULL UNIQUE,
     title                  TEXT NOT NULL,
     excerpt                TEXT NOT NULL DEFAULT '',
     summary                TEXT NOT NULL DEFAULT '',
     cover_image            TEXT,
     cover_alt              TEXT NOT NULL DEFAULT '',
     body_json              TEXT NOT NULL,
     body_html              TEXT NOT NULL,
     status                 TEXT NOT NULL DEFAULT 'draft',
     published_at           TEXT,
     created_at             TEXT NOT NULL,
     updated_at             TEXT NOT NULL,
     announcement_snippet   TEXT,
     announcement_starts_at TEXT,
     announcement_ends_at   TEXT
   );`,
  `CREATE INDEX IF NOT EXISTS posts_published_idx
     ON posts (status, published_at);`,
  // Only one post may carry the announcement at a time. The code moves it
  // rather than tripping this, which is here so that can never go wrong
  `CREATE UNIQUE INDEX IF NOT EXISTS posts_one_announcement_idx
     ON posts ((1)) WHERE announcement_snippet IS NOT NULL;`,
  // Full-text search over posts, kept in step by server/utils/posts.ts in the
  // same transaction as each save. Words are matched by how they start, so
  // "vaccin" finds vaccine and vaccines; the prefix index keeps that fast.
  `CREATE VIRTUAL TABLE IF NOT EXISTS posts_search USING fts5(
     post_id UNINDEXED, title, summary, body,
     tokenize = 'unicode61 remove_diacritics 2',
     prefix = '2 3'
   );`,
];

// Columns added to a table after it was first created. SQLite has no
// ADD COLUMN IF NOT EXISTS, so each is added only when missing. New
// databases get them here too, after the CREATE TABLE above
const ADDED_COLUMNS = [
  { table: "posts", column: "category", definition: "TEXT NOT NULL DEFAULT 'news'" },
];

const LATE_INDEXES = [
  // The blog list, filtered by category, newest first
  `CREATE INDEX IF NOT EXISTS posts_category_idx
     ON posts (status, category, published_at);`,
];

let db: SqliteDatabase | null = null;

export function dataDir(): string {
  return process.env.DATA_DIR || join(process.cwd(), ".data");
}

export function getDb(): SqliteDatabase {
  if (db) return db;

  const file = process.env.DATABASE_PATH || join(dataDir(), "submissions.db");
  mkdirSync(dirname(file), { recursive: true });

  db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  for (const sql of MIGRATIONS) db.exec(sql);
  for (const { table, column, definition } of ADDED_COLUMNS) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!columns.some((c) => c.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
  }
  for (const sql of LATE_INDEXES) db.exec(sql);

  return db;
}

/** Tests use this to point at a fresh database between cases. */
export function closeDb(): void {
  db?.close();
  db = null;
}

/**
 * Consistent snapshot of a live WAL database. `node:sqlite` has no `.backup()`,
 * but `VACUUM INTO` is plain SQL and does the same job on any driver.
 */
export function backupTo(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  getDb().exec(`VACUUM INTO '${path.replace(/'/g, "''")}'`);
}

export interface PersistArgs {
  id: string;
  reference: string;
  kind: string;
  receivedAt: string;
  flags: string[];
  idempotencyKey: string;
  payload: unknown;
  files: Omit<SubmissionFileRow, "submission_id">[];
  notifications: { kind: string; recipient: string }[];
}

/**
 * Writes the submission, its files and its queued notifications in one
 * transaction. The patient is only told "we got it" after this returns.
 *
 * Returns null when the idempotency key has been seen before, so a retried or
 * double-tapped submit is a no-op rather than a duplicate record.
 */
export function persistSubmission(args: PersistArgs): { duplicate: boolean } {
  const d = getDb();

  const existing = d
    .prepare("SELECT id FROM submissions WHERE idempotency_key = ?")
    .get(args.idempotencyKey);
  if (existing) return { duplicate: true };

  d.exec("BEGIN IMMEDIATE");
  try {
    d.prepare(
      `INSERT INTO submissions
         (id, reference, kind, received_at, status, flags, idempotency_key, payload)
       VALUES (?, ?, ?, ?, 'new', ?, ?, ?)`,
    ).run(
      args.id,
      args.reference,
      args.kind,
      args.receivedAt,
      JSON.stringify(args.flags),
      args.idempotencyKey,
      JSON.stringify(args.payload),
    );

    const insertFile = d.prepare(
      `INSERT INTO submission_files
         (id, submission_id, role, position, original_name, mime, bytes, sha256, path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const f of args.files) {
      insertFile.run(
        f.id,
        args.id,
        f.role,
        f.position,
        f.original_name,
        f.mime,
        f.bytes,
        f.sha256,
        f.path,
      );
    }

    const insertOutbox = d.prepare(
      `INSERT INTO outbox (submission_id, kind, recipient, next_attempt_at)
       VALUES (?, ?, ?, ?)`,
    );
    for (const n of args.notifications) {
      insertOutbox.run(args.id, n.kind, n.recipient, args.receivedAt);
    }

    d.exec("COMMIT");
    return { duplicate: false };
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

/** Unacknowledged first, then newest. A limit of -1 returns every row */
export function listSubmissions(limit = 100): SubmissionRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM submissions
       ORDER BY acknowledged_at IS NOT NULL, received_at DESC
       LIMIT ?`,
    )
    .all(limit) as unknown as SubmissionRow[];
}

export function getSubmission(id: string): SubmissionRow | undefined {
  return getDb()
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .get(id) as unknown as SubmissionRow | undefined;
}

export function getSubmissionFiles(id: string): SubmissionFileRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM submission_files WHERE submission_id = ? ORDER BY role, position",
    )
    .all(id) as unknown as SubmissionFileRow[];
}

/**
 * The retention clock starts here, never at receipt. Nothing may delete a
 * submission that no human has acknowledged.
 */
export function acknowledgeSubmission(id: string, by: string): boolean {
  const res = getDb()
    .prepare(
      `UPDATE submissions
         SET status = 'in_progress', acknowledged_at = ?, acknowledged_by = ?
       WHERE id = ? AND acknowledged_at IS NULL`,
    )
    .run(new Date().toISOString(), by, id);
  return res.changes > 0;
}

export function countUnacknowledgedOlderThan(iso: string): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM submissions WHERE acknowledged_at IS NULL AND received_at < ?",
    )
    .get(iso) as unknown as { n: number };
  return row?.n ?? 0;
}
