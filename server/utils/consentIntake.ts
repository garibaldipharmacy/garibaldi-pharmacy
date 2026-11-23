// Vaccine consent intake: the checks requests.post.ts runs for kind "consent".
//
// Separate from the prescription forms' schema on purpose. The consent payload
// is the dashboard's contract (shared/consent.ts), and folding it into
// requestBodySchema's union would mean changing how refill, transfer and send
// are parsed. Here the handler branches on kind first and leaves those alone.
//
// Pure functions with explicit imports, so plain vitest can test them without
// the Nuxt runtime.

import { consentPayloadSchema, type ConsentPayload } from "~~/shared/consent";
import { SIGNATURE_MAX_BYTES, SIGNATURE_ERROR, consentFieldErrors } from "~~/shared/consentForm";
import { emailSchema } from "~~/shared/forms";
import { sniffMime } from "./files";

export type ConsentCheck =
  | { ok: true; data: ConsentPayload }
  | { ok: false; errors: Record<string, string> };

/** The contract, with any problems in the patient's words, keyed by field. */
export function validateConsentBody(raw: unknown): ConsentCheck {
  const result = consentPayloadSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, errors: consentFieldErrors(result.error) };
}

export type SignatureCheck = { ok: true; mime: "image/png" } | { ok: false; message: string };

/**
 * The drawn signature: a PNG by its bytes, whatever the browser called it, and
 * no bigger than a signature pad's export ever is.
 */
export function checkSignature(data: Buffer | undefined): SignatureCheck {
  if (!data || data.length === 0) return { ok: false, message: SIGNATURE_ERROR };
  if (data.length > SIGNATURE_MAX_BYTES) {
    return { ok: false, message: "Your signature didn't save properly. Please clear it and sign again." };
  }
  if (sniffMime(data) !== "image/png") {
    return { ok: false, message: "We couldn't read your signature. Please clear it and sign again." };
  }
  return { ok: true, mime: "image/png" };
}

/** What the patient wrote in their own words, for the spam heuristics. */
export function consentFreeText(c: ConsentPayload): string[] {
  return [
    c.screening.allergyDetail ?? "",
    c.screening.reactionDetail ?? "",
    c.screening.bleedingDetail ?? "",
    ...c.items.flatMap((item) => [item.reason, item.otherText ?? ""]),
  ];
}

/**
 * Where the receipt goes: the patient's email if they gave one that looks
 * like an address. Email is optional on this form, and a receipt to a typo
 * like "jane@" would only ever bounce.
 */
export function consentReceiptRecipient(c: ConsentPayload): string | null {
  const email = emailSchema.safeParse(c.patient.email);
  return email.success ? email.data : null;
}
