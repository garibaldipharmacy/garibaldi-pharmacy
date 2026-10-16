// Lets the dashboard show whether the far end is healthy without parsing a
// drain response. Returns counts only, never content.

export default defineEventHandler((event) => {
  requireSyncToken(event);

  const db = getDb();
  const pending = db
    .prepare("SELECT COUNT(*) AS n FROM submissions WHERE delivered_at IS NULL")
    .get() as unknown as { n: number };
  const awaitingPurge = db
    .prepare("SELECT COUNT(*) AS n FROM submissions WHERE delivered_at IS NOT NULL")
    .get() as unknown as { n: number };

  return {
    ok: true,
    pending: pending?.n ?? 0,
    awaitingPurge: awaitingPurge?.n ?? 0,
    purgeGraceDays: PURGE_GRACE_DAYS,
  };
});
