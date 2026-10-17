export default defineEventHandler(async (event) => {
  requireAdmin(event);
  return savePostFromRequest(event, null);
});
