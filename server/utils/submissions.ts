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
