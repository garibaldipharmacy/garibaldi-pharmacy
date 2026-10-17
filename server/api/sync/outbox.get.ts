// Pending prescription requests, sealed to the pharmacy's public key.
//
// This server cannot read what it returns here. It holds only the public half.

import type { OutboxItem } from "~~/server/utils/sync";

export default defineEventHandler((event): { items: OutboxItem[] } => {
  requireSyncToken(event);

  const limit = Number(getQuery(event).limit ?? 50);
  return { items: pendingOutbox(Number.isFinite(limit) ? limit : 50) };
});
