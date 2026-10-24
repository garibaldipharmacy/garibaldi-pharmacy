// Outbound email via the Resend HTTPS API.
//
// Not SMTP: DigitalOcean blocks outbound 25, 465 and 587 by default, so an SMTP
// relay is not merely a deliverability preference, it will not connect at all.
//
// One message per request: the patient's receipt, "we got it, here is your
// reference number", built in receiptEmail.ts. Staff are not emailed; requests
// reach them through the dashboard. A patient's reply goes to the pharmacy.
//
// The patient's email address is unverified. A typo means sending to a stranger,
// so the receipt contains a reference code and nothing the patient typed.

import type { RequestBody } from "~~/shared/forms";
import { getDb } from "./db";
import { buildReceiptEmail, type InlineImage } from "./receiptEmail";
import { redact } from "./security";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Pictures the HTML shows with cid: links */
  images?: InlineImage[];
  replyTo?: string;
}

export interface MailResult {
  ok: boolean;
  skipped: boolean;
  error?: string;
}

function fromAddress(): string {
  return (
    process.env.MAIL_FROM || "Garibaldi Pharmacy <noreply@send.garibaldipharmacy.com>"
  );
}

/** Where replies to the receipt go */
export function pharmacyEmail(): string {
  return process.env.PHARMACY_EMAIL || "pharmacist@garibaldipharmacy.com";
}

/**
 * Sends one message. With no API key configured the message is logged instead,
 * so local development and tests work without touching a provider.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[mail] not configured, would send:", redact({ to: mail.to, subject: mail.subject }));
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.html ? { html: mail.html } : {}),
        ...(mail.images?.length
          ? {
              attachments: mail.images.map((image) => ({
                filename: image.filename,
                content: image.content,
                content_type: image.contentType,
                content_id: image.contentId,
              })),
            }
          : {}),
        reply_to: mail.replyTo ?? pharmacyEmail(),
      }),
    });

    if (!res.ok) {
      return { ok: false, skipped: false, error: `Resend returned ${res.status}` };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    return { ok: false, skipped: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

export function patientConfirmation(args: {
  kind: string;
  reference: string;
  email: string;
  receivedAt: Date;
  payload: RequestBody | null;
}): Mail {
  const receipt = buildReceiptEmail(args);
  return {
    to: args.email,
    subject: receipt.subject,
    text: receipt.text,
    html: receipt.html,
    images: receipt.images,
    replyTo: pharmacyEmail(),
  };
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 8;

/** Exponential backoff: 1, 2, 4, 8 ... minutes, capped at an hour. */
function backoffMs(attempts: number): number {
  return Math.min(60 * 60_000, 60_000 * 2 ** Math.max(0, attempts - 1));
}

interface OutboxRow {
  id: number;
  submission_id: string;
  kind: string;
  recipient: string;
  attempts: number;
}

function parsePayload(raw: string): RequestBody | null {
  try {
    return JSON.parse(raw) as RequestBody;
  } catch {
    return null;
  }
}

/**
 * Sends queued receipts. Called after each submission is committed, so an
 * email provider having a bad minute never means an accepted prescription
 * request goes unacknowledged: a failed receipt is retried, with backoff, when
 * the next request arrives.
 */
export async function drainOutbox(now = new Date()): Promise<{ sent: number; failed: number }> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, submission_id, kind, recipient, attempts
         FROM outbox
        WHERE sent_at IS NULL AND next_attempt_at <= ? AND attempts < ?
        ORDER BY id
        LIMIT 25`,
    )
    .all(now.toISOString(), MAX_ATTEMPTS) as unknown as OutboxRow[];

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    // Staff notifications were retired. One queued before the upgrade is closed
    // off unsent rather than emailed to the pharmacy.
    if (row.kind !== "patient_confirmation") {
      db.prepare("UPDATE outbox SET sent_at = ?, last_error = ? WHERE id = ?").run(
        now.toISOString(),
        "not sent: staff notifications are retired",
        row.id,
      );
      continue;
    }

    const submission = db
      .prepare("SELECT kind, reference, received_at, payload FROM submissions WHERE id = ?")
      .get(row.submission_id) as unknown as
      | { kind: string; reference: string; received_at: string; payload: string }
      | undefined;
    if (!submission) continue;

    const mail = patientConfirmation({
      kind: submission.kind,
      reference: submission.reference,
      email: row.recipient,
      receivedAt: new Date(submission.received_at),
      payload: parsePayload(submission.payload),
    });

    const result = await sendMail(mail);
    if (result.ok) {
      db.prepare("UPDATE outbox SET sent_at = ?, last_error = NULL WHERE id = ?").run(
        now.toISOString(),
        row.id,
      );
      sent += 1;
    } else {
      const attempts = row.attempts + 1;
      db.prepare(
        "UPDATE outbox SET attempts = ?, next_attempt_at = ?, last_error = ? WHERE id = ?",
      ).run(
        attempts,
        new Date(now.getTime() + backoffMs(attempts)).toISOString(),
        result.error ?? "unknown error",
        row.id,
      );
      failed += 1;
    }
  }

  return { sent, failed };
}

/** Anything stuck is the signal that delivery is broken. Surfaced by /api/health. */
export function stuckNotificationCount(): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM outbox WHERE sent_at IS NULL AND attempts >= ?`,
    )
    .get(MAX_ATTEMPTS) as unknown as { n: number };
  return row?.n ?? 0;
}
