export default defineEventHandler((event) => {
  requireAdmin(event);
  if (!deletePost(getRouterParam(event, "id") ?? "")) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }
  return { ok: true };
});
