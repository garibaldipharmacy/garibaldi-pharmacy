// Prescription request intake. Replaces Netlify Forms.
//
// One atomic multipart POST for all three forms. Either the whole submission
// lands (record + files + queued notifications, in one transaction) or none of it
// does. We never want a record without its prescription image, or files on disk
// with no record pointing at them.
//
// The patient is told "we got it" only after the transaction commits.

import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import {
  envelopeSchema,
  fieldErrors,
  LIMITS,
  MAX_FILES_PER_SUBMISSION,
  requestBodySchema,
  type RequestBody,
  type SubmitResponse,
} from "~~/shared/forms";

/** The most a valid submission can be: every file plus room for the fields */
const MAX_REQUEST_BYTES = LIMITS.maxTotalBytes + 1024 * 1024;

interface PendingFile {
  role: "prescription" | "insurance_front" | "insurance_back";
  position: number;
  key: string;
  // Where the form shows this file's errors, matching the client's own
  // validation paths rather than the upload's part name
  field: string;
}

/** Collects the file references a validated body expects, in a stable order. */
function expectedFiles(body: RequestBody): PendingFile[] {
  if (body.kind !== "send") return [];

  const out: PendingFile[] = body.prescriptions.map((p, i) => ({
    role: "prescription" as const,
    position: i,
    key: p.key,
    field: `prescriptions.${i}.file`,
  }));

  body.insurance.forEach((card, i) => {
    out.push({
      role: "insurance_front",
      position: i,
      key: card.front.key,
      field: `insurance.${i}.front`,
    });
    if (card.back) {
      out.push({
        role: "insurance_back",
        position: i,
        key: card.back.key,
        field: `insurance.${i}.back`,
      });
    }
  });

  return out;
}

export default defineEventHandler(async (event): Promise<SubmitResponse> => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";

  // ---------------------------------------------------------------------
  // Rate limit before doing any work
  // ---------------------------------------------------------------------
  const limited = rateLimit(`submit:${clientIp}`, {
    limit: Number(process.env.SUBMIT_RATE_LIMIT || 5),
    windowMs: 10 * 60_000,
  });
  if (!limited.allowed) {
    setResponseStatus(event, 429);
    setResponseHeader(event, "Retry-After", String(limited.retryAfterSeconds));
    return {
      ok: false,
      error: "Too many requests. Please wait a few minutes, or call us at 604-848-7059.",
    };
  }

  // ---------------------------------------------------------------------
  // Bound the body before reading it. readMultipartFormData buffers the whole
  // request in memory, so the per-file limits below come too late to stop an
  // oversized upload exhausting the server. Browsers always send a length
  // for form uploads; the allowance covers the form fields and multipart
  // boundaries on top of the files.
  // ---------------------------------------------------------------------
  const declaredBytes = Number(getRequestHeader(event, "content-length"));
  if (!declaredBytes || declaredBytes > MAX_REQUEST_BYTES) {
    setResponseStatus(event, 413);
    const mb = Math.round(LIMITS.maxTotalBytes / 1024 / 1024);
    return {
      ok: false,
      error: `Your attachments add up to more than ${mb} MB in total. Please remove one and try again.`,
    };
  }

  // ---------------------------------------------------------------------
  // Parse multipart
  // ---------------------------------------------------------------------
  const parts = await readMultipartFormData(event).catch(() => null);
  if (!parts) {
    setResponseStatus(event, 400);
    return { ok: false, error: "We could not read that submission." };
  }

  const payloadPart = parts.find((p) => p.name === "payload");
  if (!payloadPart) {
    setResponseStatus(event, 400);
    return { ok: false, error: "We could not read that submission." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(payloadPart.data.toString("utf8"));
  } catch {
    setResponseStatus(event, 400);
    return { ok: false, error: "We could not read that submission." };
  }

  const envelopeResult = envelopeSchema.safeParse(raw);
  if (!envelopeResult.success) {
    setResponseStatus(event, 400);
    return { ok: false, error: "We could not read that submission." };
  }
  const envelope = envelopeResult.data;

  // ---------------------------------------------------------------------
  // Honeypot. The only signal allowed to discard silently, because a human
  // cannot fill a hidden field. Return a convincing success so the bot leaves.
  // ---------------------------------------------------------------------
  if (envelope.botField.trim() !== "") {
    return { ok: true, reference: makeReference() };
  }

  // ---------------------------------------------------------------------
  // Turnstile. Skipped when unconfigured so local dev works.
  // ---------------------------------------------------------------------
  const turnstile = await verifyTurnstile(envelope.turnstileToken, clientIp);
  if (!turnstile.ok) {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error:
        "We could not verify that you are human. Please try again, or call us at 604-848-7059.",
    };
  }

  // ---------------------------------------------------------------------
  // Validate the body
  // ---------------------------------------------------------------------
  let body: RequestBody;
  try {
    body = requestBodySchema.parse(raw);
  } catch (err) {
    setResponseStatus(event, 400);
    if (err instanceof ZodError) return { ok: false, errors: fieldErrors(err) };
    return { ok: false, error: "We could not read that submission." };
  }

  // ---------------------------------------------------------------------
  // Match, validate and encrypt files
  // ---------------------------------------------------------------------
  const wanted = expectedFiles(body);
  if (wanted.length > MAX_FILES_PER_SUBMISSION) {
    setResponseStatus(event, 400);
    return { ok: false, error: "That is more files than we can accept." };
  }

  // Every file is checked before any is written, so a rejected submission
  // leaves nothing on disk
  const errors: Record<string, string> = {};
  const accepted: { want: PendingFile; part: (typeof parts)[number]; mime: string }[] = [];
  let totalBytes = 0;

  for (const want of wanted) {
    const part = parts.find((p) => p.name === want.key && p.filename);
    if (!part) {
      errors[want.field] = "That file did not upload. Please try again.";
      continue;
    }

    const check = checkUpload(part.data);
    if (!check.ok) {
      errors[want.field] = check.message;
      continue;
    }

    totalBytes += part.data.length;
    if (totalBytes > LIMITS.maxTotalBytes) {
      const mb = Math.round(LIMITS.maxTotalBytes / 1024 / 1024);
      errors[want.field] = `Your attachments add up to more than ${mb} MB in total.`;
      break;
    }

    accepted.push({ want, part, mime: check.mime });
  }

  if (Object.keys(errors).length > 0) {
    setResponseStatus(event, 400);
    return { ok: false, errors };
  }

  // Written only now, and removed again unless the record that points at
  // them is saved
  const stored: {
    id: string;
    role: string;
    position: number;
    original_name: string;
    mime: string;
    bytes: number;
    sha256: string;
    path: string;
  }[] = [];
  const removeStoredFiles = () => {
    for (const file of stored) removeStored(file.path);
  };

  try {
    for (const { want, part, mime } of accepted) {
      const file = storeEncrypted(part.data);
      stored.push({
        id: file.id,
        role: want.role,
        position: want.position,
        // Kept as metadata only. Never used to build a path.
        original_name: (part.filename ?? "upload").slice(0, 255),
        mime,
        bytes: file.bytes,
        sha256: file.sha256,
        path: file.path,
      });
    }
  } catch (err) {
    removeStoredFiles();
    console.error("[requests] failed to store attachments", {
      kind: body.kind,
      error: (err as Error).message,
    });
    setResponseStatus(event, 503);
    return {
      ok: false,
      error: "We could not save that. Please try again, or call us at 604-848-7059.",
    };
  }

  // ---------------------------------------------------------------------
  // Persist, then queue the patient's receipt email. One transaction.
  // ---------------------------------------------------------------------
  const receivedAt = new Date();
  const reference = makeReference();

  const freeText: string[] = [];
  if (body.kind === "refill") freeText.push(body.medications, body.specialInstructions);
  if (body.kind === "transfer") freeText.push(body.medications, body.notes);

  const flags = reviewFlags({
    renderedAt: envelope.renderedAt,
    receivedAt,
    freeText,
  });

  try {
    const { duplicate } = persistSubmission({
      id: randomUUID(),
      reference,
      kind: body.kind,
      receivedAt: receivedAt.toISOString(),
      flags,
      idempotencyKey: envelope.idempotencyKey,
      payload: body,
      files: stored,
      // Staff are not emailed: the request reaches them through the dashboard.
      notifications: [{ kind: "patient_confirmation", recipient: body.patient.email }],
    });

    // A retry or a double-tapped submit button is a no-op, not a second record.
    // The first attempt's files are the ones on record, so this one's go.
    if (duplicate) {
      removeStoredFiles();
      const existing = getDb()
        .prepare("SELECT reference FROM submissions WHERE idempotency_key = ?")
        .get(envelope.idempotencyKey) as unknown as { reference: string } | undefined;
      return { ok: true, reference: existing?.reference ?? reference };
    }
  } catch (err) {
    removeStoredFiles();
    console.error("[requests] failed to persist submission", {
      kind: body.kind,
      error: (err as Error).message,
    });
    setResponseStatus(event, 503);
    return {
      ok: false,
      error: "We could not save that. Please try again, or call us at 604-848-7059.",
    };
  }

  // Deliberately not awaited: the submission is already safely committed, and the
  // outbox retries on its own. The patient should not wait on an email provider.
  drainOutbox().catch((err) =>
    console.error("[requests] outbox drain failed", (err as Error).message),
  );

  console.info("[requests] accepted", { kind: body.kind, reference, flags });

  return { ok: true, reference };
});
