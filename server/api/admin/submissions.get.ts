import type { SubmissionSummaryDTO } from "~~/shared/submissions";

export default defineEventHandler((event): SubmissionSummaryDTO[] => {
  requireAdmin(event);
  // Deliberately no search, filters or pagination. This is a break-glass view
  // over a short retention window, not a reporting tool.
  return listSubmissionSummaries(100);
});
