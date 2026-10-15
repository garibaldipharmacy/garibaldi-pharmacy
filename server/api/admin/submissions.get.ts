import type { SubmissionSummaryDTO } from "~~/shared/submissions";

export default defineEventHandler((event): SubmissionSummaryDTO[] => {
  requireAdmin(event);
  // No filters or pagination: this is a break-glass view over a short
  // retention window, not a reporting tool. A search looks through every
  // stored submission, so staff can find one past the first 100.
  const q = getQuery(event).q;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  return query ? searchSubmissionSummaries(query, 100) : listSubmissionSummaries(100);
});
