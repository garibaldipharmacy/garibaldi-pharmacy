import { ADMIN_PAGE_SIZE, type AdminStatusFilter, type PostPage, type PostSummaryDTO } from "~~/shared/posts";

const STATUSES: AdminStatusFilter[] = ["all", "published", "draft", "announcement"];

export default defineEventHandler((event): PostPage<PostSummaryDTO> => {
  requireAdmin(event);
  const { page, category, search } = readListQuery(event);
  const rawStatus = getQuery(event).status;
  const status = STATUSES.includes(rawStatus as AdminStatusFilter)
    ? (rawStatus as AdminStatusFilter)
    : "all";
  return listAdminPosts({ page, category, search, status }, ADMIN_PAGE_SIZE);
});
