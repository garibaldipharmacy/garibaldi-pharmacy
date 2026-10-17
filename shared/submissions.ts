// Wire format for a stored submission.
//
// Defined here rather than inside the admin routes because the shift-dashboard
// will eventually read the same shape over its own sync endpoint. Keeping the
// contract in one place means that work is parsing something already typed,
// rather than rediscovering the schema from the database.

import type { RequestBody } from "./forms";

export type SubmissionStatus = "new" | "in_progress" | "contacted" | "completed";

export type FileRole = "prescription" | "insurance_front" | "insurance_back";

export interface SubmissionFileDTO {
  id: string;
  role: FileRole;
  /** Index within its group, so "Prescription 2" and "Card 1 (back)" can be labelled. */
  position: number;
  /** The patient's filename. Metadata only; never used to build a path. */
  originalName: string;
  mime: string;
  bytes: number;
  sha256: string;
}

export interface SubmissionSummaryDTO {
  id: string;
  reference: string;
  kind: RequestBody["kind"];
  receivedAt: string;
  status: SubmissionStatus;
  /** Review markers from the spam heuristics. Never a reason to hide anything. */
  flags: string[];
  acknowledgedAt: string | null;
  patientName: string;
  fileCount: number;
}

export interface SubmissionDetailDTO extends SubmissionSummaryDTO {
  payload: RequestBody;
  files: SubmissionFileDTO[];
}

export const KIND_LABELS: Record<RequestBody["kind"], string> = {
  refill: "Refill",
  transfer: "Transfer",
  send: "New prescription",
};

export const FILE_ROLE_LABELS: Record<FileRole, string> = {
  prescription: "Prescription",
  insurance_front: "Insurance card (front)",
  insurance_back: "Insurance card (back)",
};

export const FLAG_LABELS: Record<string, string> = {
  fast_submit: "Submitted unusually fast",
  many_links: "Contains several links",
};
