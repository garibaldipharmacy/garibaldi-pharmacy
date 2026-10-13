// Outbound email via the Resend HTTPS API.
//
// Not SMTP: DigitalOcean blocks outbound 25, 465 and 587 by default, so an SMTP
// relay is not merely a deliverability preference, it will not connect at all.
//
// Two messages, both deliberately free of patient health information:
//
//   staff_notification    "a request arrived, open the dashboard"
//   patient_confirmation  "we got it, here is your reference number"
//
// The patient's email address is unverified. A typo means sending to a stranger,
// so the confirmation contains a reference code and nothing clinical.

import { getDb } from "./db";
import { redact } from "./security";

export interface Mail {
  to: string;
  subject: string;
  text: string;
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

export function pharmacyEmail(): string {
  return process.env.PHARMACY_EMAIL || "pharmacist@garibaldipharmacy.com";
}

export function siteUrl(): string {
  return process.env.NUXT_SITE_URL || "https://garibaldipharmacy.com";
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
// Message bodies
// ---------------------------------------------------------------------------

const SERVICE_LABEL: Record<string, string> = {
  refill: "prescription refill request",
  transfer: "prescription transfer request",
  send: "new prescription",
};

export function staffNotification(args: {
  kind: string;
  reference: string;
  flagged: boolean;
}): Mail {
  const label = SERVICE_LABEL[args.kind] ?? "request";
  return {
    to: pharmacyEmail(),
    subject: `New ${label} (ref ${args.reference})`,
    text: [
      `A new ${label} was submitted on the website.`,
      ``,
      `Reference: ${args.reference}`,
      args.flagged ? `This one is flagged for review.` : ``,
      ``,
      `Open the dashboard to view it: ${siteUrl()}/admin/submissions`,
      ``,
      `No patient details are included in this email by design.`,
    ]
      .filter((line) => line !== ``)
      .join("\n"),
  };
}

export function patientConfirmation(args: {
  kind: string;
  reference: string;
  email: string;
  receivedAt: Date;
}): Mail {
  const label = SERVICE_LABEL[args.kind] ?? "request";
  const when = args.receivedAt.toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    dateStyle: "full",
    timeStyle: "short",
  });

  return {
    to: args.email,
    subject: `We received your ${label} (ref ${args.reference})`,
    text: [
      `Hi,`,
      ``,
      `We received your ${label} on ${when}.`,
      `Your reference number is ${args.reference}.`,
      ``,
      `A member of our team will contact you within one business day. If you have`,
      `not heard from us by then, please call us at 604-848-7059.`,
      ``,
      `Garibaldi Pharmacy`,
      `102-1870 Dowad Drive, Squamish, BC`,
    ].join("\n"),
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

/**
 * Drains queued notifications. Called after a submission is committed and on an
 * interval, so an email provider having a bad minute never means an accepted
 * prescription request goes unannounced.
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
    const submission = db
      .prepare("SELECT kind, reference, received_at, flags FROM submissions WHERE id = ?")
      .get(row.submission_id) as unknown as
      | { kind: string; reference: string; received_at: string; flags: string }
      | undefined;
    if (!submission) continue;

    const mail =
      row.kind === "patient_confirmation"
        ? patientConfirmation({
            kind: submission.kind,
            reference: submission.reference,
            email: row.recipient,
            receivedAt: new Date(submission.received_at),
          })
        : staffNotification({
            kind: submission.kind,
            reference: submission.reference,
            flagged: submission.flags !== "[]",
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
