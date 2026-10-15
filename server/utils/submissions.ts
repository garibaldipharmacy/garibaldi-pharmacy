// Reading stored submissions.
//
// All the real work lives here rather than in the route handlers, because the
// shift-dashboard sync will eventually need the same operations behind a
// different door (bearer token, drain-and-ack) than the human admin view
// (session cookie, browse). Two thin route layers, one service module.

import type {
  SubmissionDetailDTO,
  SubmissionFileDTO,
  SubmissionSummaryDTO,
  SubmissionStatus,
} from "~~/shared/submissions";
import type { RequestBody } from "~~/shared/forms";
import { getSubmission, getSubmissionFiles, listSubmissions } from "./db";
import type { SubmissionFileRow, SubmissionRow } from "./db";
import { readEncrypted } from "./files";

function parseFlags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parsePayload(raw: string): RequestBody | null {
  try {
    return JSON.parse(raw) as RequestBody;
  } catch {
    return null;
  }
}

/**
 * Who it is from, for the list. Falls back rather than throwing: a row we cannot
 * fully parse must still be visible, because an unreadable prescription request
 * is exactly the one a pharmacist needs to know about.
 */
function patientName(payload: RequestBody | null): string {
  if (!payload?.patient) return "(unreadable)";
  const { firstName, lastName } = payload.patient;
  return [firstName, lastName].filter(Boolean).join(" ") || "(no name given)";
}

function toSummary(row: SubmissionRow, fileCount: number): SubmissionSummaryDTO {
  const payload = parsePayload(row.payload);
  return {
    id: row.id,
    reference: row.reference,
    kind: row.kind as RequestBody["kind"],
    receivedAt: row.received_at,
    status: row.status as SubmissionStatus,
    flags: parseFlags(row.flags),
    acknowledgedAt: row.acknowledged_at,
    patientName: patientName(payload),
    fileCount,
  };
}

function toFileDTO(row: SubmissionFileRow): SubmissionFileDTO {
  return {
    id: row.id,
    role: row.role as SubmissionFileDTO["role"],
    position: row.position,
    originalName: row.original_name,
    mime: row.mime,
    bytes: row.bytes,
    sha256: row.sha256,
  };
}

export function listSubmissionSummaries(limit = 100): SubmissionSummaryDTO[] {
  return listSubmissions(limit).map((row) =>
    toSummary(row, getSubmissionFiles(row.id).length),
  );
}

/** Every text value in a payload, skipping the internal file references */
function payloadText(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "number") out.push(String(value));
  else if (Array.isArray(value)) value.forEach((item) => payloadText(item, out));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key !== "key") payloadText(item, out);
    }
  }
  return out;
}

const digitsOnly = (text: string) => text.replace(/\D/g, "");

/**
 * Whether a submission matches every word of a staff search. Words are
 * checked against the reference, the request type and everything the patient
 * entered. A word with digits also matches ignoring punctuation and spaces,
 * so "6048487059" finds "604-848-7059"
 */
export function submissionMatches(row: SubmissionRow, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;

  const payload = parsePayload(row.payload);
  const text = [row.reference, row.kind, ...payloadText(payload)]
    .join("\n")
    .toLowerCase();
  const digits = digitsOnly(text);

  return words.every((word) => {
    if (text.includes(word)) return true;
    const wordDigits = digitsOnly(word);
    return wordDigits.length >= 3 && digits.includes(wordDigits);
  });
}

/** Summaries of every stored submission matching a search, newest first */
export function searchSubmissionSummaries(
  query: string,
  limit = 100,
): SubmissionSummaryDTO[] {
  return listSubmissions(-1)
    .filter((row) => submissionMatches(row, query))
    .slice(0, limit)
    .map((row) => toSummary(row, getSubmissionFiles(row.id).length));
}

export function getSubmissionDetail(id: string): SubmissionDetailDTO | null {
  const row = getSubmission(id);
  if (!row) return null;

  const files = getSubmissionFiles(id);
  const payload = parsePayload(row.payload);

  return {
    ...toSummary(row, files.length),
    // An unparseable payload still returns the row, so the reference code and
    // timestamp are visible and staff can phone the patient.
    payload: payload ?? ({ kind: row.kind } as RequestBody),
    files: files.map(toFileDTO),
  };
}

export interface DecryptedFile {
  data: Buffer;
  mime: string;
  originalName: string;
}

/**
 * Decrypts one attachment. The fileId must belong to the given submission, so a
 * guessed identifier cannot be used to walk the whole store.
 */
export function readSubmissionFile(
  submissionId: string,
  fileId: string,
): DecryptedFile | null {
  const file = getSubmissionFiles(submissionId).find((f) => f.id === fileId);
  if (!file) return null;

  return {
    data: readEncrypted(file.path),
    mime: file.mime,
    originalName: file.original_name,
  };
}
