// Serves blog pictures. Names are random and never reused, so a picture at
// an address never changes and browsers may keep it for a year.

export default defineEventHandler((event) => {
  const media = readMedia(getRouterParam(event, "file") ?? "");
  if (!media) throw createError({ statusCode: 404, statusMessage: "Not found." });

  setResponseHeader(event, "Content-Type", media.mime);
  setResponseHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  setResponseHeader(event, "X-Content-Type-Options", "nosniff");
  return media.data;
});
