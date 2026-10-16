// One attachment, resealed to the pharmacy.
//
// The plaintext exists only in memory for the length of this request: read from
// local encrypted storage, immediately resealed, streamed out.

export default defineEventHandler((event) => {
  requireSyncToken(event);

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Bad request." });

  const sealed = sealedFile(id);
  if (!sealed) {
    throw createError({ statusCode: 404, statusMessage: "File not found." });
  }

  setResponseHeader(event, "Content-Type", "application/octet-stream");
  setResponseHeader(event, "Cache-Control", "no-store");
  return sealed;
});
