// Takes one picture for a post. The editor shrinks pictures before sending
// them, so the limit here is only a backstop.

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const parts = await readMultipartFormData(event);
  const file = parts?.find((part) => part.name === "file");
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "Choose a picture to upload." });
  }

  const result = storeMedia(file.data);
  if (!result.ok) throw createError({ statusCode: 400, statusMessage: result.message });
  return { url: result.url };
});
