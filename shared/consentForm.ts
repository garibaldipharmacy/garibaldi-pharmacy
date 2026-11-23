// The vaccine consent form's own logic: its state, the payload it sends, and
// the words a patient sees when something needs fixing.
//
// The payload's shape and rules are the contract in ./consent.ts, which the
// dashboard holds a copy of. Everything here sits on top of that contract and
// never loosens it: the page checks with friendlier, sometimes stricter rules
// (a real phone number, a date of birth not in the future) before it sends,
// and the server checks the contract itself. Both use the messages below.

import type { z } from "zod";
import {
  CONSENT_VACCINES,
  LAST_DOSE_DOSES,
  MAX_DETAIL,
  MAX_REASON,
  NO_DOSE_VACCINES,
  consentPayloadSchema,
  type ConsentPayload,
  type ConsentVaccineId,
  type DoseChoice,
} from "./consent";
import { dateOfBirthSchema, digitsOnly, emailSchema, nationalPhoneDigits, phoneSchema } from "./forms";

// ---------------------------------------------------------------------------
// The signature file
// ---------------------------------------------------------------------------

/** The multipart part, and the file role, that carries the drawn signature. */
export const SIGNATURE_PART = "signature";
export const SIGNATURE_MAX_BYTES = 300 * 1024;

// ---------------------------------------------------------------------------
// Choices
// ---------------------------------------------------------------------------

/**
 * The HealthLinkBC File for each vaccine, for reference only: nothing on the
 * form depends on opening it. Checked 22 Nov 2026; recheck each fall. A wrong
 * slug on healthlinkbc.ca redirects to a search page rather than a 404, so
 * open each one after changing it. B12 and "something else" have none.
 */
export const HEALTHLINK_URLS: Partial<Record<ConsentVaccineId, string>> = {
  // File 12d
  flu: "https://www.healthlinkbc.ca/healthlinkbc-files/inactivated-influenza-flu-vaccine",
  // File 124a
  covid: "https://www.healthlinkbc.ca/healthlinkbc-files/covid-19-mrna-vaccines",
  // File 111
  shingles: "https://www.healthlinkbc.ca/healthlinkbc-files/shingles-vaccine",
  // File 62c. The polysaccharide file (62b) is no longer published.
  pneumo: "https://www.healthlinkbc.ca/healthlinkbc-files/pneumococcal-conjugate-pcv-20-vaccine",
  // File 127
  rsv: "https://www.healthlinkbc.ca/healthlinkbc-files/respiratory-syncytial-virus-rsv-vaccine",
  // File 18c
  tdap: "https://www.healthlinkbc.ca/healthlinkbc-files/tetanus-diphtheria-pertussis-tdap-vaccine",
  // File 33. Really "hepatitis-vaccine", with no "a".
  hepa: "https://www.healthlinkbc.ca/healthlinkbc-files/hepatitis-vaccine",
  // File 25a
  hepb: "https://www.healthlinkbc.ca/healthlinkbc-files/hepatitis-b-vaccine",
  // File 101b
  hpv: "https://www.healthlinkbc.ca/healthlinkbc-files/human-papillomavirus-hpv-vaccine",
};

export const DOSE_LABELS: Record<DoseChoice, string> = {
  unsure: "Not sure",
  "1": "1st dose",
  "2": "2nd dose",
  "3": "3rd dose",
  "4": "4th dose",
  booster: "Booster",
};

export function vaccineFor(id: string) {
  return CONSENT_VACCINES.find((v) => v.id === id);
}

/** Flu and B12 never ask which dose; nor does a card with no vaccine chosen yet. */
export function asksDose(vaccine: string): boolean {
  return Boolean(vaccineFor(vaccine)) && !NO_DOSE_VACCINES.includes(vaccine as ConsentVaccineId);
}

/** The last dose's date is asked only for a 2nd to 4th dose or a booster. */
export function asksLastDose(dose: string): boolean {
  return LAST_DOSE_DOSES.includes(dose as DoseChoice);
}

/** A male patient is never asked if they are pregnant; the payload says "na". */
export function asksPregnancy(sex: string): boolean {
  return sex !== "male";
}

/** Digits only. Never shortened, so a pasted "9123 456 789" keeps every digit. */
export function cleanPhn(value: string): string {
  return digitsOnly(value);
}

// ---------------------------------------------------------------------------
// The form's state
// ---------------------------------------------------------------------------

type YesNo = "" | "yes" | "no";

export interface ConsentItemState {
  vaccine: ConsentVaccineId | "";
  reason: string;
  otherText: string;
  dose: DoseChoice;
  lastDoseDate: string;
}

export interface ConsentFormState {
  forWhom: "me" | "child";
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phn: string;
    sex: "" | "male" | "female";
    weight: string;
    phone: string;
    email: string;
  };
  emergencyContact: { name: string; phone: string };
  screening: {
    sick: YesNo;
    allergy: YesNo;
    allergyDetail: string;
    pregnant: YesNo;
    reaction: YesNo;
    reactionDetail: string;
    neuro: YesNo;
    bleeding: YesNo;
    bleedingDetail: string;
  };
  items: ConsentItemState[];
  agreed: boolean;
  relationship: "" | "parent" | "rep";
  signerName: string;
}

export function emptyConsentItem(): ConsentItemState {
  return { vaccine: "", reason: "", otherText: "", dose: "unsure", lastDoseDate: "" };
}

export function emptyConsentForm(): ConsentFormState {
  return {
    forWhom: "me",
    patient: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phn: "",
      sex: "",
      weight: "",
      phone: "",
      email: "",
    },
    emergencyContact: { name: "", phone: "" },
    screening: {
      sick: "",
      allergy: "",
      allergyDetail: "",
      pregnant: "",
      reaction: "",
      reactionDetail: "",
      neuro: "",
      bleeding: "",
      bleedingDetail: "",
    },
    items: [emptyConsentItem()],
    agreed: false,
    relationship: "",
    signerName: "",
  };
}

/** The questions with a "tell us more" box when answered yes. */
export const DETAIL_QUESTIONS = ["allergy", "reaction", "bleeding"] as const;

// ---------------------------------------------------------------------------
// The payload
// ---------------------------------------------------------------------------

/**
 * What the page sends: the contract's payload, built from the form. Questions
 * the patient was never shown are left out (or "na", for pregnancy), and
 * phones go as digits, as the other forms store them. Built as-is: an
 * unfinished form gives a payload the contract rejects, never a guessed one.
 */
export function buildConsentPayload(s: ConsentFormState, signedAt: Date): ConsentPayload {
  const forChild = s.forWhom === "child";
  const weight = s.patient.weight.trim();
  const screening: Record<string, string> = {
    sick: s.screening.sick,
    allergy: s.screening.allergy,
    pregnant: asksPregnancy(s.patient.sex) ? s.screening.pregnant : "na",
    reaction: s.screening.reaction,
    neuro: s.screening.neuro,
    bleeding: s.screening.bleeding,
  };
  for (const key of DETAIL_QUESTIONS) {
    if (s.screening[key] === "yes") screening[`${key}Detail`] = s.screening[`${key}Detail`].trim();
  }

  return {
    kind: "consent",
    forWhom: s.forWhom,
    patient: {
      firstName: s.patient.firstName.trim(),
      lastName: s.patient.lastName.trim(),
      dateOfBirth: s.patient.dateOfBirth.trim(),
      phn: cleanPhn(s.patient.phn),
      sex: s.patient.sex,
      phone: nationalPhoneDigits(s.patient.phone),
      email: s.patient.email.trim(),
      ...(forChild && weight ? { weight } : {}),
    },
    emergencyContact: {
      name: s.emergencyContact.name.trim(),
      phone: nationalPhoneDigits(s.emergencyContact.phone),
    },
    screening,
    items: s.items.map((item) => {
      const lastDoseDate = item.lastDoseDate.trim();
      const dose = asksDose(item.vaccine) ? item.dose : undefined;
      return {
        vaccine: item.vaccine,
        ...(item.vaccine === "other" ? { otherText: item.otherText.trim() } : {}),
        reason: item.reason.trim(),
        ...(dose ? { dose } : {}),
        ...(dose && asksLastDose(dose) && lastDoseDate ? { lastDoseDate } : {}),
      };
    }),
    acknowledgement: {
      agreed: s.agreed,
      signerName: s.signerName.trim(),
      relationship: forChild ? s.relationship : "self",
      signedAt: signedAt.toISOString(),
    },
    // The form's loose state types ("" for unanswered) are what the contract is
    // there to catch, so they are not narrowed here
  } as unknown as ConsentPayload;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export const PHN_ERROR = "Enter all 10 digits of your Personal Health Number";
export const SIGNATURE_ERROR = "Sign in the box, with your finger or your mouse";
const PHONE_ERROR = "Enter a valid phone number, like (604) 123-4567";
const ANSWER_ERROR = "Answer yes or no";
const DETAIL_ERROR = `Tell us a little more, in up to ${MAX_DETAIL} characters`;
const DATE_ERROR = "Enter the date as YYYY-MM-DD, or leave it blank";

const MESSAGES: Record<string, string> = {
  forWhom: "Choose who is getting the vaccine",
  "patient.firstName": "Legal first name is required",
  "patient.lastName": "Legal last name is required",
  "patient.dateOfBirth": "Enter the date of birth as YYYY-MM-DD",
  "patient.phn": PHN_ERROR,
  "patient.sex": "Choose sex at birth",
  "patient.weight": "Enter their weight, like 24 kg",
  "patient.phone": PHONE_ERROR,
  "patient.email": "Enter a valid email address, or leave it blank",
  "emergencyContact.name": "Emergency contact name is required",
  "emergencyContact.phone": PHONE_ERROR,
  "screening.sick": ANSWER_ERROR,
  "screening.allergy": ANSWER_ERROR,
  "screening.pregnant": ANSWER_ERROR,
  "screening.reaction": ANSWER_ERROR,
  "screening.neuro": ANSWER_ERROR,
  "screening.bleeding": ANSWER_ERROR,
  "screening.allergyDetail": DETAIL_ERROR,
  "screening.reactionDetail": DETAIL_ERROR,
  "screening.bleedingDetail": DETAIL_ERROR,
  items: "Choose at least one vaccine",
  "items.vaccine": "Choose a vaccine or injection",
  "items.otherText": "Tell us which vaccine or injection, in up to 60 characters",
  "items.reason": `Keep the reason to ${MAX_REASON} characters`,
  "items.dose": "Choose which dose this is",
  "items.lastDoseDate": DATE_ERROR,
  "acknowledgement.agreed": "Tick the box to say you want the vaccine(s)",
  "acknowledgement.relationship": "Choose how you are related to them",
  "acknowledgement.signerName": "Type your full name as you sign",
  "acknowledgement.signedAt": "Something went wrong. Please try again.",
  signature: SIGNATURE_ERROR,
};

/** The patient's words for a problem at a payload path, e.g. "items.2.dose". */
export function consentMessage(path: string): string {
  return MESSAGES[path.replace(/^items\.\d+\./, "items.")] ?? "Check this answer";
}

/** Contract errors as `{ "patient.phn": message }`, first problem per field. */
export function consentFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "payload";
    if (!(path in out)) out[path] = consentMessage(path);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Checking the form before it is sent
// ---------------------------------------------------------------------------

const realDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) &&
  new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);

/**
 * Every problem with the form, in the order it appears on the page, keyed by
 * payload path. Empty when it can be sent. Stricter than the contract where
 * a patient would want to be told (a phone number with too few digits, a last
 * dose in the future), and always at least as strict: the contract runs last.
 */
export function validateConsentForm(
  s: ConsentFormState,
  opts: { hasSignature: boolean; now?: Date },
): Record<string, string> {
  const now = opts.now ?? new Date();
  const errors: Record<string, string> = {};
  const flag = (path: string, when: boolean) => {
    if (when && !(path in errors)) errors[path] = consentMessage(path);
  };
  const blank = (v: string) => v.trim() === "";
  const tooLong = (v: string, max: number) => v.trim().length > max;

  const p = s.patient;
  flag("patient.firstName", blank(p.firstName) || tooLong(p.firstName, 100));
  flag("patient.lastName", blank(p.lastName) || tooLong(p.lastName, 100));
  flag("patient.dateOfBirth", !realDate(p.dateOfBirth.trim()) || !dateOfBirthSchema.safeParse(p.dateOfBirth).success);
  flag("patient.phn", cleanPhn(p.phn).length !== 10);
  flag("patient.sex", p.sex !== "male" && p.sex !== "female");
  if (s.forWhom === "child") flag("patient.weight", blank(p.weight) || tooLong(p.weight, 40));
  flag("patient.phone", !phoneSchema.safeParse(p.phone).success);
  flag("patient.email", !blank(p.email) && (!emailSchema.safeParse(p.email).success || tooLong(p.email, 200)));

  flag("emergencyContact.name", blank(s.emergencyContact.name) || tooLong(s.emergencyContact.name, 100));
  flag("emergencyContact.phone", !phoneSchema.safeParse(s.emergencyContact.phone).success);

  const q = s.screening;
  flag("screening.sick", !q.sick);
  flag("screening.allergy", !q.allergy);
  flag("screening.allergyDetail", q.allergy === "yes" && (blank(q.allergyDetail) || q.allergyDetail.length > MAX_DETAIL));
  if (asksPregnancy(p.sex)) flag("screening.pregnant", !q.pregnant);
  flag("screening.reaction", !q.reaction);
  flag("screening.reactionDetail", q.reaction === "yes" && (blank(q.reactionDetail) || q.reactionDetail.length > MAX_DETAIL));
  flag("screening.neuro", !q.neuro);
  flag("screening.bleeding", !q.bleeding);
  flag("screening.bleedingDetail", q.bleeding === "yes" && (blank(q.bleedingDetail) || q.bleedingDetail.length > MAX_DETAIL));

  flag("items", s.items.length === 0);
  const today = now.toISOString().slice(0, 10);
  s.items.forEach((item, i) => {
    flag(`items.${i}.vaccine`, !vaccineFor(item.vaccine));
    if (item.vaccine === "other") flag(`items.${i}.otherText`, blank(item.otherText) || tooLong(item.otherText, 60));
    flag(`items.${i}.reason`, item.reason.trim().length > MAX_REASON);
    if (asksDose(item.vaccine) && asksLastDose(item.dose) && !blank(item.lastDoseDate)) {
      const d = item.lastDoseDate.trim();
      flag(`items.${i}.lastDoseDate`, !realDate(d) || d > today);
    }
  });

  flag("acknowledgement.agreed", !s.agreed);
  if (s.forWhom === "child") flag("acknowledgement.relationship", !s.relationship);
  flag("acknowledgement.signerName", blank(s.signerName) || tooLong(s.signerName, 100));
  flag("signature", !opts.hasSignature);

  // The contract has the last word, so nothing the server would refuse is sent
  if (Object.keys(errors).length === 0) {
    const result = consentPayloadSchema.safeParse(buildConsentPayload(s, now));
    if (!result.success) Object.assign(errors, consentFieldErrors(result.error));
  }
  return errors;
}
