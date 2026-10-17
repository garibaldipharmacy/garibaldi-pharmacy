// Periodic deletion of delivered submissions.
//
// This is what makes the droplet a mailbox rather than an archive. A breach
// here should expose days of prescription requests, not years of them.
//
// Only ever touches rows the pharmacy has acknowledged. A submission nobody has
// taken is never deleted by anything, regardless of age.

const INTERVAL_MS = 60 * 60_000; // hourly is ample for a 7-day grace period

export default defineNitroPlugin(() => {
  // Not during tests or prerendering, where a background timer would just hold
  // the process open.
  if (import.meta.test) return;

  const run = () => {
    try {
      if (!syncEnabled()) return; // nothing is draining, so nothing may be purged
      purgeDelivered();
    } catch (err) {
      console.error("[sync] purge failed:", (err as Error).message);
    }
  };

  setTimeout(run, 30_000).unref?.();
  setInterval(run, INTERVAL_MS).unref?.();
});
