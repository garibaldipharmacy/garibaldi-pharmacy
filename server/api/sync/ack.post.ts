// Acknowledges delivery and schedules deletion.
//
// The dashboard calls this only after committing a submission to its own
// database. Worst case is redelivery, which its unique external_id makes a
// no-op. There is no path here that loses a prescription request.

export default defineEventHandler(async (event) => {
  requireSyncToken(event);

  const body = await readBody<{ ids?: unknown }>(event).catch(() => ({}));
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((v): v is string => typeof v === "string")
    : [];

  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Provide an array of ids." });
  }

  const acknowledged = acknowledgeDelivery(ids);
  console.info(`[sync] acknowledged ${acknowledged} submission(s)`);

  return { acknowledged };
});
