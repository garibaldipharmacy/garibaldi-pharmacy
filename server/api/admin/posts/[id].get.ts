import type { PostDTO } from "~~/shared/posts";

export default defineEventHandler((event): PostDTO => {
  requireAdmin(event);
  const post = getPost(getRouterParam(event, "id") ?? "");
  if (!post) throw createError({ statusCode: 404, statusMessage: "Post not found." });
  return post;
});
