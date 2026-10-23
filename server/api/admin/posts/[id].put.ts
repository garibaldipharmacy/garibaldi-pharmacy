export default defineEventHandler(async (event) => {
  requireAdmin(event);
  return savePostFromRequest(event, getRouterParam(event, "id") ?? "");
});
