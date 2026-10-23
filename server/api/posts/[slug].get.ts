import type { PublicPostDTO } from "~~/shared/posts";

// ?preview=1 also finds drafts, for the editor's Preview button, but only
// for a signed-in session. Anyone else gets the same 404 as a missing post,
// so drafts can't be discovered by guessing addresses.
export default defineEventHandler((event): PublicPostDTO => {
  const preview =
    getQuery(event).preview === "1" && tokenValid(getCookie(event, SESSION_COOKIE));
  const post = getPublicPost(getRouterParam(event, "slug") ?? "", {
    includeDrafts: preview,
  });
  if (!post) throw createError({ statusCode: 404, statusMessage: "Post not found." });
  return post;
});
