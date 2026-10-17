import type { AnnouncementResponse } from "~~/shared/posts";

// Checked on every page render, so an announcement appears and disappears at
// its times without anyone redeploying anything. Wrapped in an object so
// "nothing running" is still a body rather than an empty 204.
export default defineEventHandler(
  (): AnnouncementResponse => ({ announcement: currentAnnouncement() }),
);
