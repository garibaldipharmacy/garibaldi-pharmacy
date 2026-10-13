import type { SubmissionDetailDTO } from "~~/shared/submissions";

export default defineEventHandler((event): SubmissionDetailDTO => {
  requireAdmin(event);

  const id = getRouterParam(event, "id");
  const detail = id ? getSubmissionDetail(id) : null;
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: "Submission not found." });
  }
  return detail;
});
