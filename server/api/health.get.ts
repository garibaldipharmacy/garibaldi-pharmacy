// Liveness and readiness. CI calls this after a deploy and rolls back the
// symlink if it does not answer, so it must assert real dependencies rather than
// just proving the process started.

export default defineEventHandler((event) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // The database opening is the check that matters. A release that cannot reach
  // its own storage must not be left serving.
  try {
    getDb().prepare("SELECT 1").get();
    checks.database = "ok";
  } catch (err) {
    checks.database = `failed: ${(err as Error).message}`;
    healthy = false;
  }

  // Not fatal, but if notifications are wedged nobody is being told about
  // incoming prescription requests, which is the failure we most care about.
  try {
    const stuck = stuckNotificationCount();
    checks.notifications = stuck === 0 ? "ok" : `${stuck} stuck`;
  } catch (err) {
    checks.notifications = `unknown: ${(err as Error).message}`;
  }

  // Surfaces the thing that silently kills a request pipeline: submissions piling
  // up with nobody acknowledging them.
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const overdue = countUnacknowledgedOlderThan(cutoff);
    checks.unacknowledged_over_24h = String(overdue);
  } catch {
    checks.unacknowledged_over_24h = "unknown";
  }

  if (!healthy) setResponseStatus(event, 503);
  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    status: healthy ? "ok" : "degraded",
    release: process.env.RELEASE_ID ?? "dev",
    checks,
  };
});
