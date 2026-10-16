// Sealed boxes: anonymous public-key encryption.
//
// The droplet holds ONLY the public key. It can seal a submission and can never
// open one. The private key exists solely inside the pharmacy, on the machine
// running shift-dashboard. So a full compromise of this server yields ciphertext
// and nothing else: no names, no PHNs, no medication lists, no photographs.
//
// This is the "strong version" the migration plan deferred. Until it is switched
// on, submissions are stored with a key that lives on the same box, which
// protects snapshots and stolen disks but not an attacker with root. This does.
//
// ---------------------------------------------------------------------------
// WIRE FORMAT. The dashboard's open() must agree byte for byte.
//
//   [0, 44)    ephemeral X25519 public key, SPKI DER (always 44 bytes)
//   [44, 56)   AES-GCM nonce (12 bytes)
//   [56, 72)   AES-GCM authentication tag (16 bytes)
//   [72, ...)  ciphertext
//
// Key derivation:
//   shared = X25519(ephemeralPrivate, recipientPublic)
//   key    = HKDF-SHA256(shared, salt = ephemeralPub || recipientPub,
//                        info = "garibaldi-prescription-sync-v1", 32 bytes)
//
// Both public keys go into the HKDF salt so the derived key is bound to this
// exact exchange. Without that, a sealed box could be replayed against a
// different recipient.
//
// SPKI DER is used rather than raw 32-byte keys because Node can import and
// export it directly on every supported version, with no manual ASN.1 handling.
// ---------------------------------------------------------------------------

import {
  createCipheriv,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
  type KeyObject,
} from "node:crypto";

export const EPH_KEY_BYTES = 44; // X25519 SPKI DER is a fixed 44 bytes
export const NONCE_BYTES = 12;
export const TAG_BYTES = 16;
export const HEADER_BYTES = EPH_KEY_BYTES + NONCE_BYTES + TAG_BYTES; // 72

const HKDF_INFO = "garibaldi-prescription-sync-v1";

/** Parses the base64 SPKI public key from configuration. */
export function publicKeyFromBase64(base64: string): KeyObject {
  const der = Buffer.from(base64.trim(), "base64");
  if (der.length !== EPH_KEY_BYTES) {
    throw new Error(
      `Expected a ${EPH_KEY_BYTES}-byte X25519 SPKI public key, got ${der.length} bytes`,
    );
  }
  return createPublicKey({ key: der, format: "der", type: "spki" });
}

function deriveKey(shared: Buffer, ephPub: Buffer, recipientPub: Buffer): Buffer {
  const salt = Buffer.concat([ephPub, recipientPub]);
  return Buffer.from(hkdfSync("sha256", shared, salt, HKDF_INFO, 32));
}

/**
 * Seals a payload to the recipient's public key.
 *
 * A fresh ephemeral keypair is generated per call and its private half is
 * discarded immediately, so even this process cannot reopen what it just sealed.
 */
export function seal(plaintext: Buffer, recipientPublicKey: KeyObject): Buffer {
  const ephemeral = generateKeyPairSync("x25519");

  const ephPub = ephemeral.publicKey.export({ format: "der", type: "spki" }) as Buffer;
  const recipientPub = recipientPublicKey.export({
    format: "der",
    type: "spki",
  }) as Buffer;

  const shared = diffieHellman({
    privateKey: ephemeral.privateKey,
    publicKey: recipientPublicKey,
  });

  const key = deriveKey(shared, ephPub, recipientPub);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([ephPub, nonce, cipher.getAuthTag(), body]);
}

/** Convenience for sealing an object as JSON. */
export function sealJson(value: unknown, recipientPublicKey: KeyObject): Buffer {
  return seal(Buffer.from(JSON.stringify(value), "utf8"), recipientPublicKey);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

let cached: KeyObject | null | undefined;

/**
 * The dashboard's public key, or null when sync is not configured.
 *
 * Returning null rather than throwing is deliberate: a site with no dashboard
 * attached must keep accepting prescriptions. Sealing is an export path, not a
 * precondition for serving patients.
 */
export function syncPublicKey(): KeyObject | null {
  if (cached !== undefined) return cached;

  const configured = process.env.SYNC_PUBLIC_KEY?.trim();
  if (!configured) {
    cached = null;
    return null;
  }

  try {
    cached = publicKeyFromBase64(configured);
  } catch (err) {
    // Loud, because a malformed key means submissions silently stop being
    // exportable to the pharmacy.
    console.error("[sync] SYNC_PUBLIC_KEY is not a valid X25519 public key:", (err as Error).message);
    cached = null;
  }
  return cached;
}

/** Tests reset this after changing the environment. */
export function resetSyncKeyCache(): void {
  cached = undefined;
}

export function syncConfigured(): boolean {
  return syncPublicKey() !== null && Boolean(process.env.SYNC_TOKEN_HASH);
}
