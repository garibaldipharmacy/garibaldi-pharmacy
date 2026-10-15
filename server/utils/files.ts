// Upload handling: content sniffing and encryption at rest.
//
// Nothing here trusts the client. Not the `accept` attribute, not the filename,
// not the declared Content-Type. The only thing we believe is the bytes.

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ACCEPTED_MIME_TYPES, LIMITS } from "~~/shared/forms";
// Explicit rather than relying on Nitro auto-imports, so this module is testable
// in plain vitest without the Nuxt runtime.
import { dataDir } from "./db";

export type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

// ---------------------------------------------------------------------------
// Content sniffing
// ---------------------------------------------------------------------------

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

/**
 * Identifies a file by its magic bytes. Returns null for anything we do not
 * explicitly recognise, which is the whole point: a renamed `.exe` fails here
 * no matter what the browser claimed it was.
 */
export function sniffMime(buf: Buffer): AcceptedMime | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }

  // PDF: "%PDF"
  if (buf.subarray(0, 4).toString("latin1") === "%PDF") return "application/pdf";

  // WebP: "RIFF" .... "WEBP"
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }

  // HEIC/HEIF: ISO-BMFF box, "ftyp" at offset 4, brand at offset 8.
  if (buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (HEIC_BRANDS.has(brand)) {
      return brand === "mif1" || brand === "msf1" ? "image/heif" : "image/heic";
    }
  }

  return null;
}

export interface FileCheckOk {
  ok: true;
  mime: AcceptedMime;
}
export interface FileCheckError {
  ok: false;
  message: string;
}

export function checkUpload(buf: Buffer): FileCheckOk | FileCheckError {
  if (buf.length === 0) {
    return { ok: false, message: "That file is empty" };
  }
  if (buf.length > LIMITS.maxBytesPerFile) {
    const mb = Math.round(LIMITS.maxBytesPerFile / 1024 / 1024);
    return { ok: false, message: `Each file must be smaller than ${mb} MB` };
  }
  const mime = sniffMime(buf);
  if (!mime) {
    return {
      ok: false,
      message: "That file type is not supported. Use a photo or a PDF.",
    };
  }
  return { ok: true, mime };
}

export function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

// ---------------------------------------------------------------------------
// Encryption at rest
// ---------------------------------------------------------------------------
//
// AES-256-GCM, fresh 12-byte IV per file, auth tag verified on read.
//
// Honest scope: the key lives on the same machine as the ciphertext, so this does
// not stop an attacker who already has root. It does protect droplet snapshots,
// backups copied off the box, and a decommissioned disk image. The strong version
// (X25519 sealed boxes, private key only inside the pharmacy) arrives with the
// dashboard integration.

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

export function keyPath(): string {
  return process.env.UPLOAD_KEY_PATH || join(dataDir(), "keys", "uploads.key");
}

export function uploadsDir(): string {
  return process.env.UPLOADS_DIR || join(dataDir(), "uploads");
}

let cachedKey: Buffer | null = null;

/** Loads the key, creating it owner-readable on first use. */
export function uploadKey(): Buffer {
  if (cachedKey) return cachedKey;

  const path = keyPath();
  if (existsSync(path)) {
    const key = readFileSync(path);
    if (key.length !== 32) {
      throw new Error(`Upload key at ${path} is not 32 bytes`);
    }
    cachedKey = key;
    return key;
  }

  mkdirSync(dirname(path), { recursive: true });
  const key = randomBytes(32);
  writeFileSync(path, key, { mode: 0o600 });
  cachedKey = key;
  return key;
}

/** Tests reset this when they move DATA_DIR. */
export function resetKeyCache(): void {
  cachedKey = null;
}

export function encryptBuffer(plain: Buffer): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, uploadKey(), iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

export function decryptBuffer(blob: Buffer): Buffer {
  const iv = blob.subarray(0, IV_BYTES);
  const tag = blob.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const body = blob.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, uploadKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

export interface StoredFile {
  id: string;
  path: string;
  bytes: number;
  sha256: string;
}

/**
 * Writes an encrypted file under `uploads/YYYY/MM/<random>.enc`.
 *
 * The on-disk name is random. The patient's filename is kept as metadata only and
 * is never used to build a path, so a file called `../../etc/passwd` is just a
 * string in a database column.
 */
export function storeEncrypted(plain: Buffer): StoredFile {
  const now = new Date();
  const id = `f_${randomUUID()}`;
  const relative = join(
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${id}.enc`,
  );
  const absolute = join(uploadsDir(), relative);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, encryptBuffer(plain), { mode: 0o600 });

  return { id, path: relative, bytes: plain.length, sha256: sha256(plain) };
}

export function readEncrypted(relative: string): Buffer {
  return decryptBuffer(readFileSync(join(uploadsDir(), relative)));
}

/**
 * Deletes a stored file. Used to clean up when a submission's files were
 * written but its record never was, so nothing is left on disk unreferenced.
 * A file that is already gone is fine.
 */
export function removeStored(relative: string): void {
  rmSync(join(uploadsDir(), relative), { force: true });
}
