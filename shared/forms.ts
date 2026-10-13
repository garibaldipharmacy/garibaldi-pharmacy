// Single source of truth for prescription form validation.
//
// Imported by both the Vue pages and the Nitro handler, so the browser and the
// server can never disagree about what a valid submission looks like.
//
// See garibaldi-form-api-contract.md for the full contract.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

export const LIMITS = {
  maxPrescriptions: 5,
  maxInsuranceCards: 3,
  maxBytesPerFile: 10 * 1024 * 1024, // 10 MB
  maxTotalBytes: 25 * 1024 * 1024, // 25 MB
} as const;

/**
 * Types we accept. Detection is by content sniffing on the server; this list and
 * the `accept` attribute below are UI conveniences only, never a security control.
 *
 * HEIC is here because iPhones produce it by default and patients will absolutely
 * photograph a prescription label with one.
 */
export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

export const ACCEPT_ATTRIBUTE =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf";

export const MAX_FILES_PER_SUBMISSION =
  LIMITS.maxPrescriptions + LIMITS.maxInsuranceCards * 2;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formats 10 digits as (604) 848-7059. Returns the input unchanged otherwise. */
export function formatPhone(value: string): string {
  const d = digitsOnly(value);
  if (d.length !== 10) return value;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const optionalText = (max: number) =>
  z.string().trim().max(max, "That is too long").optional().default("");

export const phoneSchema = z
  .string()
  .transform(digitsOnly)
  .refine((v) => v.length === 10, {
    message: "Enter a 10-digit phone number",
  });

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254)
  .email("Enter a valid email address");

export const dateOfBirthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date of birth")
  .refine((v) => new Date(v) <= new Date(), "Date of birth cannot be in the future")
  .refine((v) => Number(v.slice(0, 4)) >= 1900, "Enter a valid date of birth");

/**
 * BC Personal Health Number. Optional on every form, matching the current UI.
 * Validated for shape only when something was typed.
 */
export const phnSchema = z
  .string()
  .transform(digitsOnly)
  .refine((v) => v.length === 0 || v.length === 10, {
    message: "A Personal Health Number is 10 digits",
  })
  .optional()
  .default("");

// `sex` keeps the current male/female options deliberately. Widening it is parked
// pending sign-off, so do not add values here without asking.
export const sexSchema = z.enum(["male", "female"]).optional();

// ---------------------------------------------------------------------------
// Patient
// ---------------------------------------------------------------------------

export const patientSchema = z.object({
  firstName: text(100, "Legal first name"),
  lastName: text(100, "Legal last name"),
  dateOfBirth: dateOfBirthSchema,
  phone: phoneSchema,
  email: emailSchema,
});

/** Transfer and send additionally collect sex and PHN. */
export const patientWithHealthInfoSchema = patientSchema.extend({
  sex: sexSchema,
  phn: phnSchema,
});

// ---------------------------------------------------------------------------
// Per-form bodies
// ---------------------------------------------------------------------------

export const RETRIEVAL_METHODS = {
  pickup: "I will pickup my prescription",
  delivery:
    "I would like my prescription delivered (may be a reasonable delivery charge)",
} as const;

export type RetrievalMethod = keyof typeof RETRIEVAL_METHODS;

const refillBody = z.object({
  kind: z.literal("refill"),
  patient: patientSchema,
  // Was `pharmacist-notes`. Now required: a refill request listing nothing is not
  // actionable, and the old form allowed exactly that.
  medications: text(5000, "Medications"),
  // Was `options`, which stored a full English sentence from the UI label.
  retrievalMethod: z.enum(["pickup", "delivery"]),
  specialInstructions: optionalText(2000),
});

const transferBody = z.object({
  kind: z.literal("transfer"),
  patient: patientWithHealthInfoSchema,
  fromPharmacyName: text(200, "Pharmacy name"),
  fromPharmacyPhone: phoneSchema,
  // Was `options` storing the strings "Yes" / "No".
  transferAll: z.boolean(),
  // Was `prescription-list`. Required only when not transferring everything.
  medications: optionalText(5000),
  // Was `pharmacist-notes`, which means something completely different on refill.
  notes: optionalText(2000),
});

/** One uploaded file, referenced by the key of its multipart part. */
const fileRef = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(64)
    // Part names become lookup keys, never paths. Keep them boring.
    .regex(/^[a-z0-9_]+$/, "Malformed upload reference"),
});

const sendBody = z.object({
  kind: z.literal("send"),
  patient: patientWithHealthInfoSchema,
  prescriptions: z
    .array(fileRef)
    .min(1, "Attach at least one prescription")
    .max(
      LIMITS.maxPrescriptions,
      `You can attach up to ${LIMITS.maxPrescriptions} prescriptions`,
    ),
  insurance: z
    .array(
      z.object({
        front: fileRef,
        // Some insurance cards have nothing on the back. Never demand it.
        back: fileRef.optional(),
      }),
    )
    .max(
      LIMITS.maxInsuranceCards,
      `You can attach up to ${LIMITS.maxInsuranceCards} insurance cards`,
    )
    .optional()
    .default([]),
});

export const requestBodySchema = z
  .discriminatedUnion("kind", [refillBody, transferBody, sendBody])
  .superRefine((data, ctx) => {
    if (data.kind === "transfer" && !data.transferAll && !data.medications) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["medications"],
        message: "List the medications you would like transferred",
      });
    }
  });

export type RequestBody = z.infer<typeof requestBodySchema>;
export type RefillBody = z.infer<typeof refillBody>;
export type TransferBody = z.infer<typeof transferBody>;
export type SendBody = z.infer<typeof sendBody>;
export type FormKind = RequestBody["kind"];

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export const envelopeSchema = z.object({
  /** Client-generated, backed by a unique index. A double-tap is a no-op. */
  idempotencyKey: z.string().uuid(),
  /** When the form was rendered, for the "submitted suspiciously fast" heuristic. */
  renderedAt: z.string().datetime(),
  /** Honeypot. A human cannot fill a hidden field, so non-empty is certainly a bot. */
  botField: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(4096).optional().default(""),
});

export type Envelope = z.infer<typeof envelopeSchema>;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export interface SubmitSuccess {
  ok: true;
  reference: string;
}

export interface SubmitFailure {
  ok: false;
  error?: string;
  errors?: Record<string, string>;
}

export type SubmitResponse = SubmitSuccess | SubmitFailure;

/** Flattens a ZodError into `{ "patient.email": "message" }` for the UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}
