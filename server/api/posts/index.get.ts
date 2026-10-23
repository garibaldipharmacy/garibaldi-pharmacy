import { BLOG_PAGE_SIZE, POST_CATEGORIES, type BlogPageDTO } from "~~/shared/posts";

export default defineEventHandler((event): BlogPageDTO => {
  const { page, category, search } = readListQuery(event);
  const result = listBlogPage({ page, category, search }, BLOG_PAGE_SIZE);

  // Past the last page is a 404, so /blog/?page=99 isn't an empty page that
  // search engines index. Page 1 always exists, even with nothing on it
  if (page > result.pageCount) {
    throw createError({ statusCode: 404, statusMessage: "Page not found." });
  }

  const used = new Set(publishedCategories());
  return {
    ...result,
    categories: POST_CATEGORIES.filter((c) => used.has(c.slug)).map(
      ({ slug, label }) => ({ slug, label }),
    ),
  };
});
