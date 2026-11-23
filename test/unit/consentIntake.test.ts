import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomUUID,
} from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  checkSignature,
  consentFreeText,
  consentReceiptRecipient,
  validateConsentBody,
} from "~~/server/utils/consentIntake";
import { buildReceiptEmail } from "~~/server/utils/receiptEmail";
import { closeDb, getDb, persistSubmission } from "~~/server/utils/db";
import { resetKeyCache, storeEncrypted } from "~~/server/utils/files";
import { EPH_KEY_BYTES, HEADER_BYTES, NONCE_BYTES, resetSyncKeyCache } from "~~/server/utils/sealedBox";
import { acknowledgeDelivery, hashToken, pendingOutbox, sealedFile } from "~~/server/utils/sync";
import { getSubmissionDetail } from "~~/server/utils/submissions";
import { FILE_ROLE_LABELS, KIND_LABELS } from "~~/shared/submissions";
import { PNG_1X1, validConsent, validMaleConsent } from "./consentFixtures";

describe("validateConsentBody", () => {
  it("accepts a valid consent and drops the envelope fields", () => {
    const raw = { ...validConsent(), idempotencyKey: randomUUID(), botField: "", turnstileToken: "" };
    const result = validateConsentBody(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(validConsent());
  });

  it("returns each problem in the patient's words, keyed by field", () => {
    const raw = validMaleConsent();
    raw.patient.phn = "912345678";
    raw.screening.pregnant = "no";
    delete raw.items[1].dose;
    const result = validateConsentBody(raw);
    expect(result).toEqual({
      ok: false,
      errors: {
        "patient.phn": "Enter all 10 digits of your Personal Health Number",
        "screening.pregnant": "Answer yes or no",
        "items.1.dose": "Choose which dose this is",
      },
    });
  });

  it("treats a payload with nothing in it as invalid, never as a crash", () => {
    const result = validateConsentBody({ kind: "consent" });
    expect(result.ok).toBe(false);
  });
});

describe("checkSignature", () => {
  it("accepts a PNG", () => {
    expect(checkSignature(PNG_1X1)).toEqual({ ok: true, mime: "image/png" });
  });

  it("refuses a missing or empty signature", () => {
    expect(checkSignature(undefined).ok).toBe(false);
    expect(checkSignature(Buffer.alloc(0)).ok).toBe(false);
  });

  it("refuses anything that isn't a PNG by its bytes, whatever it's called", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(checkSignature(jpeg).ok).toBe(false);
    expect(checkSignature(Buffer.from("%PDF-1.7 not a signature")).ok).toBe(false);
    expect(checkSignature(Buffer.from("MZ this is not an image at all")).ok).toBe(false);
  });

  it("refuses a PNG over 300 KB", () => {
    const big = Buffer.concat([PNG_1X1, Buffer.alloc(300 * 1024 - PNG_1X1.length + 1)]);
    expect(checkSignature(big).ok).toBe(false);
    const fits = Buffer.concat([PNG_1X1, Buffer.alloc(300 * 1024 - PNG_1X1.length)]);
    expect(checkSignature(fits).ok).toBe(true);
  });
});

describe("consent receipt and review", () => {
  it("sends a receipt only to an email that looks like one", () => {
    expect(consentReceiptRecipient(validConsent())).toBe("not-a-real-patient@example.invalid");
    for (const email of ["", "  ", "jane@", "not an email"]) {
      const c = validConsent();
      c.patient.email = email;
      expect(consentReceiptRecipient(c)).toBeNull();
    }
  });

  it("gives the spam heuristics what the patient wrote themselves", () => {
    const text = consentFreeText(validConsent());
    expect(text).toContain("Penicillin (hives)");
    expect(text).toContain("Aspirin 81 mg daily");
    expect(text).toContain("Shingles prevention");
  });

  it("labels the kind and the signature for staff", () => {
    expect(KIND_LABELS.consent).toBe("Consent form");
    expect(FILE_ROLE_LABELS.signature).toBe("Patient signature");
  });
});

/** Every string the patient typed or chose, from anywhere in the payload. */
function leaves(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object") Object.values(value).forEach((v) => leaves(v, out));
  return out;
}

describe("consent receipt email", () => {
  const payload = validConsent();
  const receipt = buildReceiptEmail({
    kind: "consent",
    reference: "1A2B3C4D",
    receivedAt: new Date("2026-11-22T19:30:00Z"),
    payload,
  });
  const everything = [receipt.subject, receipt.preheader, receipt.text, receipt.html].join("\n");

  it("says the consent form arrived, with its reference", () => {
    expect(receipt.subject).toBe("Vaccine consent form received · 1A2B3C4D");
    expect(receipt.preheader).toBe("We have your vaccine consent form. Your reference is 1A2B3C4D.");
    expect(receipt.text).toContain("We have your vaccine consent form. Your reference is 1A2B3C4D.");
    expect(receipt.text).toContain("Request: Vaccine consent form");
    expect(receipt.html).toContain("We have your vaccine consent form. Your reference is 1A2B3C4D.");
  });

  it("does not promise a reply within a business day", () => {
    expect(everything).not.toMatch(/within one business day/);
    expect(receipt.text).toContain("Your pharmacist will go over it with you in person");
  });

  it("contains nothing the patient typed or chose", () => {
    const typed = leaves(payload).filter((v) => v.length >= 3 && v !== "consent");
    expect(typed.length).toBeGreaterThan(15);
    for (const value of typed) {
      expect(everything.toLowerCase(), value).not.toContain(value.toLowerCase());
    }
    // Nor the vaccines, by their names on the form
    for (const word of ["influenza", "covid", "shingles", "penicillin", "aspirin", "pregnan"]) {
      expect(everything.toLowerCase()).not.toContain(word);
    }
  });
});

// ---------------------------------------------------------------------------
// Storage and sync. The receiving half is the same standalone implementation
// of the dashboard's side as sealedBox.test.ts, written from the wire format.
// ---------------------------------------------------------------------------

function open(envelope: Buffer, privateKeyB64: string): Buffer {
  const privateKey = createPrivateKey({ key: Buffer.from(privateKeyB64, "base64"), format: "der", type: "pkcs8" });
  const ephPubDer = envelope.subarray(0, EPH_KEY_BYTES);
  const nonce = envelope.subarray(EPH_KEY_BYTES, EPH_KEY_BYTES + NONCE_BYTES);
  const tag = envelope.subarray(EPH_KEY_BYTES + NONCE_BYTES, HEADER_BYTES);
  const body = envelope.subarray(HEADER_BYTES);
  const ephPub = createPublicKey({ key: ephPubDer, format: "der", type: "spki" });
  const shared = diffieHellman({ privateKey, publicKey: ephPub });
  const recipientPub = createPublicKey(privateKey).export({ format: "der", type: "spki" }) as Buffer;
  const key = Buffer.from(hkdfSync("sha256", shared, Buffer.concat([ephPubDer, recipientPub]), "garibaldi-prescription-sync-v1", 32));
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

describe("a consent through storage and the sealed sync", () => {
  let dir: string;
  let privateB64: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "gp-consent-"));
    process.env.DATA_DIR = dir;
    process.env.DATABASE_PATH = join(dir, "test.db");
    const { publicKey, privateKey } = generateKeyPairSync("x25519");
    process.env.SYNC_PUBLIC_KEY = (publicKey.export({ format: "der", type: "spki" }) as Buffer).toString("base64");
    privateB64 = (privateKey.export({ format: "der", type: "pkcs8" }) as Buffer).toString("base64");
    process.env.SYNC_TOKEN_HASH = hashToken("test-token");
    resetSyncKeyCache();
    resetKeyCache();
    closeDb();
  });

  afterEach(() => {
    closeDb();
    rmSync(dir, { recursive: true, force: true });
    delete process.env.SYNC_PUBLIC_KEY;
    delete process.env.SYNC_TOKEN_HASH;
    resetSyncKeyCache();
    resetKeyCache();
  });

  /** What requests.post.ts stores for a valid consent and its signature. */
  function storeConsent(payload = validConsent(), reference = "1A2B3C4D") {
    const checked = validateConsentBody(payload);
    if (!checked.ok) throw new Error("fixture should be valid");
    expect(checkSignature(PNG_1X1).ok).toBe(true);
    const file = storeEncrypted(PNG_1X1);
    const id = randomUUID();
    const recipient = consentReceiptRecipient(checked.data);
    persistSubmission({
      id,
      reference,
      kind: "consent",
      receivedAt: new Date().toISOString(),
      flags: [],
      idempotencyKey: randomUUID(),
      payload: checked.data,
      files: [{
        id: file.id,
        role: "signature",
        position: 0,
        original_name: "signature.png",
        mime: "image/png",
        bytes: file.bytes,
        sha256: file.sha256,
        path: file.path,
      }],
      notifications: recipient ? [{ kind: "patient_confirmation", recipient }] : [],
    });
    return { id, file };
  }

  it("is stored with its signature and sealed in the outbox, as the dashboard expects", () => {
    const { id, file } = storeConsent();
    const [item] = pendingOutbox();

    expect(item).toMatchObject({ id, kind: "consent", reference: "1A2B3C4D", files: [{ id: file.id, bytes: PNG_1X1.length }] });
    // Nothing about the patient in the clear
    const sealed = Buffer.from(item.sealed, "base64");
    for (const secret of ["9123456787", "Sample", "Penicillin", "shingles"]) {
      expect(sealed.includes(Buffer.from(secret))).toBe(false);
    }

    const opened = JSON.parse(open(sealed, privateB64).toString("utf8"));
    expect(opened).toMatchObject({ reference: "1A2B3C4D", kind: "consent", flags: [] });
    // The dashboard gets exactly the contract's payload, and one signature file
    expect(opened.payload).toEqual(validConsent());
    expect(opened.files).toEqual([{
      id: file.id,
      role: "signature",
      position: 0,
      originalName: "signature.png",
      mime: "image/png",
      bytes: PNG_1X1.length,
      sha256: file.sha256,
    }]);

    // The signature itself, resealed for the dashboard
    const sealedSig = sealedFile(file.id)!;
    const fileEnvelope = JSON.parse(open(sealedSig, privateB64).toString("utf8"));
    expect(Buffer.from(fileEnvelope.data, "base64").equals(PNG_1X1)).toBe(true);

    acknowledgeDelivery([id]);
    expect(pendingOutbox()).toHaveLength(0);
  });

  it("queues a receipt only when the patient gave an email", () => {
    storeConsent();
    const noEmail = validConsent();
    noEmail.patient.email = "";
    storeConsent(noEmail, "5E6F7A8B");
    const rows = getDb().prepare("SELECT recipient FROM outbox").all() as { recipient: string }[];
    expect(rows.map((r) => r.recipient)).toEqual(["not-a-real-patient@example.invalid"]);
  });

  it("reads back for /admin with the patient's name and the signature file", () => {
    const { id } = storeConsent();
    const detail = getSubmissionDetail(id)!;
    expect(detail).toMatchObject({ kind: "consent", patientName: "Avery Sample", fileCount: 1 });
    expect(detail.files[0]).toMatchObject({ role: "signature", mime: "image/png" });
  });
});
