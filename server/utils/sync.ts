// The sync door: how shift-dashboard drains prescription requests.
//
// Deliberately a different door, with a different lock, from /api/admin:
//
//   /api/admin/*  session cookie   human      browse, items persist
//   /api/sync/*   bearer token     machine    drain once, acknowledge, purge
//
// Sharing endpoints between the two would mean either a machine holding a human
// session cookie, or a human session that never expires. Both are bad, and
// worse when the payload is prescriptions.

import { createHash, timingSafeEqual } from "node:crypto";
import { unlinkSync } from "node:fs";
import { join } from "node:path";
import type { H3Event } from "h3";
import { getDb } from "./db";
import { sealJson, syncPublicKey } from "./sealedBox";
import { readEncrypted, uploadsDir } from "./files";

/** Days a delivered submission is kept before purging. A replay window, not an archive. */
export const PURGE_GRACE_DAYS = 7;

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * The token is stored hashed, so a leaked `.env` does not immediately yield a
 * working credential. SHA-256 is fine here: this is a 32-byte random token, not
 * a human password, so there is nothing to brute force.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export function syncEnabled(): boolean {
  return Boolean(process.env.SYNC_TOKEN_HASH && syncPublicKey());
}

export function requireSyncToken(event: H3Event): void {
  if (!syncEnabled()) {
    // Fails closed, and says why only in the server log.
    console.warn(
      "[sync] blocked: SYNC_TOKEN_HASH and SYNC_PUBLIC_KEY must both be set for the sync endpoints",
    );
    throw createError({ statusCode: 503, statusMessage: "Sync is not configured." });
  }

  const header = getRequestHeader(event, "authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!presented) {
    throw createError({ statusCode: 401, statusMessage: "Missing bearer token." });
  }

  const expected = Buffer.from(process.env.SYNC_TOKEN_HASH!.trim(), "hex");
  const actual = Buffer.from(hashToken(presented), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    console.warn("[sync] rejected a request with a bad token");
    throw createError({ statusCode: 401, statusMessage: "Invalid token." });
  }

  setResponseHeader(event, "Cache-Control", "no-store");
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

export interface OutboxFile {
  id: string;
  bytes: number;
}

export interface OutboxItem {
  id: string;
  reference: string;
  kind: string;
  receivedAt: string;
  /** Base64 sealed JSON. Contains the patient data and the file manifest. */
  sealed: string;
  /**
   * Cleartext file handles so the dashboard knows what to fetch. Deliberately
   * only an opaque id and a byte count: the original filename can itself be
   * identifying ("jane-doe-script.jpg"), so it lives inside the sealed payload.
   */
  files: OutboxFile[];
}

interface SubmissionWithFiles {
  id: string;
  reference: string;
  kind: string;
  received_at: string;
  status: string;
  flags: string;
  payload: string;
}

/**
 * Pending submissions, sealed to the dashboard's public key.
 *
 * Ordered oldest first so a backlog drains in the order patients submitted,
 * which is the order a pharmacist would want to work through them.
 */
export function pendingOutbox(limit = 50): OutboxItem[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, reference, kind, received_at, status, flags, payload
         FROM submissions
        WHERE delivered_at IS NULL
        ORDER BY received_at ASC
        LIMIT ?`,
    )
    .all(Math.min(Math.max(limit, 1), 200)) as unknown as SubmissionWithFiles[];

  const publicKey = syncPublicKey()!;

  return rows.map((row) => {
    const files = db
      .prepare(
        `SELECT id, role, position, original_name, mime, bytes, sha256
           FROM submission_files WHERE submission_id = ? ORDER BY role, position`,
      )
      .all(row.id) as unknown as {
      id: string;
      role: string;
      position: number;
      original_name: string;
      mime: string;
      bytes: number;
      sha256: string;
    }[];

    // Everything identifying goes inside the envelope, including the manifest.
    const sealed = sealJson(
      {
        reference: row.reference,
        kind: row.kind,
        receivedAt: row.received_at,
        flags: JSON.parse(row.flags || "[]"),
        payload: JSON.parse(row.payload),
        files: files.map((f) => ({
          id: f.id,
          role: f.role,
          position: f.position,
          originalName: f.original_name,
          mime: f.mime,
          bytes: f.bytes,
          sha256: f.sha256,
        })),
      },
      publicKey,
    );

    return {
      id: row.id,
      reference: row.reference,
      kind: row.kind,
      receivedAt: row.received_at,
      sealed: sealed.toString("base64"),
      files: files.map((f) => ({ id: f.id, bytes: f.bytes })),
    };
  });
}

/**
 * One attachment, decrypted from local storage then immediately resealed to the
 * dashboard. The plaintext exists only in memory, for the length of the request.
 */
export function sealedFile(fileId: string): Buffer | null {
  const row = getDb()
    .prepare(
      `SELECT f.path FROM submission_files f
         JOIN submissions s ON s.id = f.submission_id
        WHERE f.id = ? AND s.delivered_at IS NULL`,
    )
    .get(fileId) as unknown as { path: string } | undefined;
  if (!row) return null;

  const plaintext = readEncrypted(row.path);
  return sealJson({ fileId, data: plaintext.toString("base64") }, syncPublicKey()!);
}

/**
 * Marks submissions delivered and schedules their deletion.
 *
 * The dashboard calls this only after committing them to its own database, so
 * the worst case is re-delivering something it already has, which its unique
 * external_id makes a no-op. Losing a prescription request is not possible.
 */
export function acknowledgeDelivery(ids: string[]): number {
  if (ids.length === 0) return 0;

  const db = getDb();
  const now = new Date();
  const purgeAfter = new Date(now.getTime() + PURGE_GRACE_DAYS * 86_400_000);

  const stmt = db.prepare(
    `UPDATE submissions
        SET delivered_at = ?, purge_after = ?
      WHERE id = ? AND delivered_at IS NULL`,
  );

  let changed = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const id of ids.slice(0, 500)) {
      changed += stmt.run(now.toISOString(), purgeAfter.toISOString(), id).changes;
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return changed;
}

// ---------------------------------------------------------------------------
// Purge
// ---------------------------------------------------------------------------

/**
 * Deletes delivered submissions past their grace period, and their files.
 *
 * Only ever touches rows with a `delivered_at`. A submission the pharmacy has
 * not taken is never deleted by anything, no matter how old it is.
 */
export function purgeDelivered(now = new Date()): { submissions: number; files: number } {
  const db = getDb();
  const due = db
    .prepare(
      `SELECT id FROM submissions
        WHERE delivered_at IS NOT NULL AND purge_after IS NOT NULL AND purge_after <= ?`,
    )
    .all(now.toISOString()) as unknown as { id: string }[];

  if (due.length === 0) return { submissions: 0, files: 0 };

  let files = 0;
  for (const { id } of due) {
    const paths = db
      .prepare("SELECT path FROM submission_files WHERE submission_id = ?")
      .all(id) as unknown as { path: string }[];

    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("DELETE FROM submission_files WHERE submission_id = ?").run(id);
      db.prepare("DELETE FROM outbox WHERE submission_id = ?").run(id);
      db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    for (const p of paths) {
      try {
        unlinkSync(join(uploadsDir(), p.path));
        files += 1;
      } catch {
        // A file already gone is not a reason to keep the row.
      }
    }
  }

  console.info(`[sync] purged ${due.length} delivered submission(s), ${files} file(s)`);
  return { submissions: due.length, files };
}
