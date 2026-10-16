import { afterEach, describe, expect, it } from "vitest";
import {
  createPrivateKey,
  createDecipheriv,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
} from "node:crypto";

import {
  EPH_KEY_BYTES,
  HEADER_BYTES,
  NONCE_BYTES,
  publicKeyFromBase64,
  resetSyncKeyCache,
  seal,
  sealJson,
  syncPublicKey,
  TAG_BYTES,
} from "~~/server/utils/sealedBox";

// ---------------------------------------------------------------------------
// The receiving half.
//
// This is deliberately a standalone implementation of what shift-dashboard
// does, written from the documented wire format rather than by importing
// anything shared. If the two ever drift, these tests fail here rather than in
// production with a pharmacist staring at an undecryptable prescription.
// ---------------------------------------------------------------------------

function open(envelope: Buffer, privateKeyB64: string): Buffer {
  const privateKey = createPrivateKey({
    key: Buffer.from(privateKeyB64, "base64"),
    format: "der",
    type: "pkcs8",
  });

  const ephPubDer = envelope.subarray(0, EPH_KEY_BYTES);
  const nonce = envelope.subarray(EPH_KEY_BYTES, EPH_KEY_BYTES + NONCE_BYTES);
  const tag = envelope.subarray(EPH_KEY_BYTES + NONCE_BYTES, HEADER_BYTES);
  const body = envelope.subarray(HEADER_BYTES);

  const ephPub = createPublicKey({ key: ephPubDer, format: "der", type: "spki" });
  const shared = diffieHellman({ privateKey, publicKey: ephPub });

  const recipientPub = createPublicKey(privateKey).export({
    format: "der",
    type: "spki",
  }) as Buffer;

  const salt = Buffer.concat([ephPubDer, recipientPub]);
  const key = Buffer.from(
    hkdfSync("sha256", shared, salt, "garibaldi-prescription-sync-v1", 32),
  );

  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

function keypair() {
  const { publicKey, privateKey } = generateKeyPairSync("x25519");
  return {
    publicB64: (publicKey.export({ format: "der", type: "spki" }) as Buffer).toString("base64"),
    privateB64: (privateKey.export({ format: "der", type: "pkcs8" }) as Buffer).toString("base64"),
  };
}

afterEach(() => {
  delete process.env.SYNC_PUBLIC_KEY;
  resetSyncKeyCache();
});

describe("wire format", () => {
  it("is a 72-byte header followed by ciphertext", () => {
    expect(EPH_KEY_BYTES).toBe(44);
    expect(NONCE_BYTES).toBe(12);
    expect(TAG_BYTES).toBe(16);
    expect(HEADER_BYTES).toBe(72);
  });

  it("produces an envelope exactly header + plaintext long", () => {
    const { publicB64 } = keypair();
    const plaintext = Buffer.from("Ramipril 10mg capsules");
    const envelope = seal(plaintext, publicKeyFromBase64(publicB64));
    // AES-GCM is a stream cipher, so the ciphertext matches the plaintext length.
    expect(envelope.length).toBe(HEADER_BYTES + plaintext.length);
  });
});

describe("seal and open", () => {
  it("round-trips a prescription payload", () => {
    const { publicB64, privateB64 } = keypair();
    const submission = {
      reference: "A3F91C2D",
      kind: "refill",
      payload: {
        patient: { firstName: "Testy", lastName: "McFixture", phn: "9123456789" },
        medications: "Ramipril 10mg capsules",
      },
    };

    const envelope = sealJson(submission, publicKeyFromBase64(publicB64));
    expect(JSON.parse(open(envelope, privateB64).toString("utf8"))).toEqual(submission);
  });

  it("round-trips binary, so attachments survive intact", () => {
    const { publicB64, privateB64 } = keypair();
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0xfe, 0x7f]);
    const envelope = seal(bytes, publicKeyFromBase64(publicB64));
    expect(open(envelope, privateB64).equals(bytes)).toBe(true);
  });

  it("handles an empty payload", () => {
    const { publicB64, privateB64 } = keypair();
    const envelope = seal(Buffer.alloc(0), publicKeyFromBase64(publicB64));
    expect(open(envelope, privateB64).length).toBe(0);
  });

  it("handles a payload larger than one AES block", () => {
    const { publicB64, privateB64 } = keypair();
    const big = Buffer.alloc(100_000, 0xab);
    const envelope = seal(big, publicKeyFromBase64(publicB64));
    expect(open(envelope, privateB64).equals(big)).toBe(true);
  });
});

describe("the security properties that matter", () => {
  it("never leaves plaintext in the envelope", () => {
    const { publicB64 } = keypair();
    const envelope = seal(Buffer.from("PHN 9123456789"), publicKeyFromBase64(publicB64));
    expect(envelope.includes(Buffer.from("9123456789"))).toBe(false);
  });

  it("uses a fresh ephemeral key each time, so identical input differs", () => {
    const { publicB64 } = keypair();
    const key = publicKeyFromBase64(publicB64);
    const a = seal(Buffer.from("same"), key);
    const b = seal(Buffer.from("same"), key);
    expect(a.equals(b)).toBe(false);
    expect(a.subarray(0, EPH_KEY_BYTES).equals(b.subarray(0, EPH_KEY_BYTES))).toBe(false);
  });

  it("cannot be opened by a different private key", () => {
    // The whole point: a stolen envelope is useless without the pharmacy's key.
    const alice = keypair();
    const mallory = keypair();
    const envelope = seal(Buffer.from("secret"), publicKeyFromBase64(alice.publicB64));
    expect(() => open(envelope, mallory.privateB64)).toThrow();
  });

  it("rejects a tampered ciphertext", () => {
    const { publicB64, privateB64 } = keypair();
    const envelope = seal(Buffer.from("Ramipril 10mg"), publicKeyFromBase64(publicB64));
    envelope[envelope.length - 1] ^= 0xff;
    expect(() => open(envelope, privateB64)).toThrow();
  });

  it("rejects a tampered authentication tag", () => {
    const { publicB64, privateB64 } = keypair();
    const envelope = seal(Buffer.from("Ramipril 10mg"), publicKeyFromBase64(publicB64));
    envelope[EPH_KEY_BYTES + NONCE_BYTES] ^= 0xff;
    expect(() => open(envelope, privateB64)).toThrow();
  });

  it("rejects a swapped ephemeral key", () => {
    // Binding both public keys into the HKDF salt is what stops an envelope
    // being replayed with a substituted ephemeral key.
    const { publicB64, privateB64 } = keypair();
    const key = publicKeyFromBase64(publicB64);
    const a = seal(Buffer.from("one"), key);
    const b = seal(Buffer.from("two"), key);
    b.subarray(0, EPH_KEY_BYTES).copy(a, 0);
    expect(() => open(a, privateB64)).toThrow();
  });
});

describe("configuration", () => {
  it("returns null when no public key is set, rather than throwing", () => {
    // A site with no dashboard attached must keep accepting prescriptions.
    delete process.env.SYNC_PUBLIC_KEY;
    resetSyncKeyCache();
    expect(syncPublicKey()).toBeNull();
  });

  it("loads a valid configured key", () => {
    const { publicB64 } = keypair();
    process.env.SYNC_PUBLIC_KEY = publicB64;
    resetSyncKeyCache();
    expect(syncPublicKey()).not.toBeNull();
  });

  it("tolerates surrounding whitespace from a pasted .env", () => {
    const { publicB64 } = keypair();
    process.env.SYNC_PUBLIC_KEY = `  ${publicB64}\n`;
    resetSyncKeyCache();
    expect(syncPublicKey()).not.toBeNull();
  });

  it("treats a malformed key as absent rather than crashing the server", () => {
    process.env.SYNC_PUBLIC_KEY = "not-a-key";
    resetSyncKeyCache();
    expect(syncPublicKey()).toBeNull();
  });

  it("rejects a key of the wrong length", () => {
    expect(() => publicKeyFromBase64(Buffer.alloc(32).toString("base64"))).toThrow(
      /44-byte/,
    );
  });
});
