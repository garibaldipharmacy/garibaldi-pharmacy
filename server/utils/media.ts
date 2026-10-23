// Pictures for blog posts.
//
// Unlike prescription uploads these are public, so they're stored as plain
// files rather than encrypted. They're still only accepted from a signed-in
// session, identified by their bytes rather than their name, and given
// random names, so nothing about the upload decides where it lands.

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "./db";
import { sniffMime } from "./files";

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type MediaMime = keyof typeof EXTENSIONS;

const MIME_BY_EXTENSION: Record<string, MediaMime> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** A stored file's name, and the only shape the public route will serve */
export const MEDIA_FILE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function mediaDir(): string {
  return process.env.MEDIA_DIR || join(dataDir(), "media");
}

export type StoreMediaResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export function storeMedia(buf: Buffer): StoreMediaResult {
  if (!buf.length) return { ok: false, message: "That file is empty." };
  if (buf.length > MEDIA_MAX_BYTES) {
    return { ok: false, message: "Pictures must be smaller than 10 MB." };
  }
  const mime = sniffMime(buf);
  if (!mime || !(mime in EXTENSIONS)) {
    return { ok: false, message: "Use a JPEG, PNG or WebP picture." };
  }

  const file = `${randomUUID()}.${EXTENSIONS[mime as MediaMime]}`;
  mkdirSync(mediaDir(), { recursive: true });
  writeFileSync(join(mediaDir(), file), buf);
  return { ok: true, url: `/media/${file}` };
}

export function readMedia(file: string): { data: Buffer; mime: MediaMime } | null {
  const match = MEDIA_FILE.exec(file);
  if (!match) return null;
  const path = join(mediaDir(), file);
  if (!existsSync(path)) return null;
  return { data: readFileSync(path), mime: MIME_BY_EXTENSION[match[1]] };
}
