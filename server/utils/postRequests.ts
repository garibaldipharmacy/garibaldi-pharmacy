import type { H3Event } from "h3";
import { SEARCH_MAX, isPostCategory, validatePostInput } from "~~/shared/posts";

/**
 * Validates and saves the post in the request body. A null id creates one.
 * Problems come back as 422 with `data.errors` keyed by field, so the editor
 * can show each message beside its field.
 */
export async function savePostFromRequest(event: H3Event, id: string | null) {
  const body = await readBody(event).catch(() => null);
  const result = validatePostInput(body);
  if (!result.ok) {
    throw createError({
      statusCode: 422,
      statusMessage: "Check the highlighted fields.",
      data: { errors: result.errors },
    });
  }

  const saved = savePost(id, result.value);
  if (!saved.ok && saved.reason === "not_found") {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }
  if (!saved.ok) {
    throw createError({
      statusCode: 422,
      statusMessage: "Check the highlighted fields.",
      data: { errors: { slug: "Another post already uses this web address." } },
    });
  }
  return { id: saved.id };
}

/**
 * ?page, ?category and ?q from a list request. A page that isn't a whole
 * number from 1 up, or a category that doesn't exist, is a 404: those
 * addresses don't exist, and saying so keeps them out of search engines
 */
export function readListQuery(event: H3Event) {
  const query = getQuery(event);

  const rawPage = query.page;
  const page = rawPage === undefined || rawPage === "" ? 1 : Number(rawPage);
  if (!Number.isInteger(page) || page < 1 || page > 10_000) {
    throw createError({ statusCode: 404, statusMessage: "Page not found." });
  }

  const rawCategory = query.category;
  const category =
    rawCategory === undefined || rawCategory === "" ? null : rawCategory;
  if (category !== null && !isPostCategory(category)) {
    throw createError({ statusCode: 404, statusMessage: "Page not found." });
  }

  const search = typeof query.q === "string" ? query.q.trim().slice(0, SEARCH_MAX) : "";

  return { page, category, search };
}
