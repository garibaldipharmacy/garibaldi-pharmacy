#!/usr/bin/env node
// Generates the keypair that lets the pharmacy read prescription requests, and
// the shared token the dashboard authenticates with.
//
//   node scripts/generate-sync-keypair.mjs
//
// Prefer the dashboard's own setup, which saves the secret halves straight into
// its keys folder and nightly backup (shift-dashboard docs/deployment-guide.md,
// step 7). This script is the fallback and produces the same formats.
//
// Run this ONCE, on the pharmacy's machine, and treat the output as follows:
//
//   SYNC_PUBLIC_KEY   -> the website's .env           (public half, safe)
//   SYNC_TOKEN_HASH   -> the website's .env           (a hash, safe)
//
//   SYNC_PRIVATE_KEY  -> the dashboard's .env ONLY    (SECRET, never leaves)
//   SYNC_TOKEN        -> the dashboard's .env ONLY    (SECRET)
//
// The private key must never be copied to the server. That is the entire point:
// the website seals prescription requests it cannot itself open.

import { generateKeyPairSync, randomBytes, createHash } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("x25519");

const pub = publicKey.export({ format: "der", type: "spki" }).toString("base64");
const priv = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");

const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");

console.log(`
=============================================================================
  WEBSITE  (garibaldi-pharmacy)  ->  /srv/garibaldi-prod/shared/.env
=============================================================================

SYNC_PUBLIC_KEY=${pub}
SYNC_TOKEN_HASH=${tokenHash}

=============================================================================
  DASHBOARD  (shift-dashboard)  ->  .env on the pharmacy PC
=============================================================================

SYNC_PRIVATE_KEY=${priv}
SYNC_TOKEN=${token}
SYNC_URL=https://garibaldipharmacy.com

=============================================================================

The private key decrypts every prescription request. If you lose it, anything
still sealed becomes unreadable. If you copy it to the website, the whole design
is pointless.

Back it up with the dashboard's attachment key, somewhere separate from the data.
`);
