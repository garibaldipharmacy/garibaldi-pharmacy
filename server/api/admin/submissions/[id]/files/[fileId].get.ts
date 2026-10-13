// Decrypts and streams one attachment.
//
// This is the only route that uses the upload key, and the only way a
// prescription image leaves the droplet in readable form. It is behind the same
// session guard as everything else, because guarding the page but not the file
// would be security theatre.

export default defineEventHandler((event) => {
  requireAdmin(event);

  const id = getRouterParam(event, "id");
  const fileId = getRouterParam(event, "fileId");
  if (!id || !fileId) {
    throw createError({ statusCode: 400, statusMessage: "Bad request." });
  }

  // Scoped to the submission, so a guessed file id cannot walk the whole store.
  const file = readSubmissionFile(id, fileId);
  if (!file) {
    throw createError({ statusCode: 404, statusMessage: "File not found." });
  }

  setResponseHeader(event, "Content-Type", file.mime);
  setResponseHeader(event, "Cache-Control", "no-store");
  // `inline` so a pharmacist can glance at it without a download round trip.
  // The filename is quoted and stripped: it came from a patient's device.
  const safeName = file.originalName.replace(/[^\w.\- ]+/g, "_").slice(0, 100);
  setResponseHeader(event, "Content-Disposition", `inline; filename="${safeName}"`);
  // Defence in depth: never let a crafted upload execute in our origin.
  setResponseHeader(event, "Content-Security-Policy", "default-src 'none'; sandbox");
  setResponseHeader(event, "X-Content-Type-Options", "nosniff");

  return file.data;
});
