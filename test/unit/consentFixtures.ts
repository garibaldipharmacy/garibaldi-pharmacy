// Consent payloads for the tests. Every name and number is fake.
import type { ConsentPayload } from "~~/shared/consent";

/** A valid consent from a female patient, for herself, with the three vaccines from the mockups. */
export function validConsent(): ConsentPayload {
  return {
    kind: "consent",
    forWhom: "me",
    patient: {
      firstName: "Avery",
      lastName: "Sample",
      dateOfBirth: "1958-04-12",
      phn: "9123456787",
      sex: "female",
      phone: "6045550142",
      email: "not-a-real-patient@example.invalid",
    },
    emergencyContact: { name: "Morgan Sample", phone: "6045550187" },
    screening: {
      sick: "no",
      allergy: "yes",
      allergyDetail: "Penicillin (hives)",
      pregnant: "no",
      reaction: "no",
      neuro: "no",
      bleeding: "yes",
      bleedingDetail: "Aspirin 81 mg daily",
    },
    items: [
      { vaccine: "flu", reason: "Seasonal influenza prevention" },
      { vaccine: "covid", reason: "COVID-19 prevention", dose: "booster" },
      { vaccine: "shingles", reason: "Shingles prevention", dose: "2", lastDoseDate: "2026-05-14" },
    ],
    acknowledgement: {
      agreed: true,
      signerName: "Avery Sample",
      relationship: "self",
      signedAt: "2026-11-22T19:30:00.000Z",
    },
  };
}

/** The same consent from a male patient: never asked if pregnant, so "na". */
export function validMaleConsent(): ConsentPayload {
  const p = validConsent();
  p.patient.sex = "male";
  p.screening.pregnant = "na";
  return p;
}

/** A consent signed by a parent for someone in their care. */
export function validChildConsent(): ConsentPayload {
  const p = validConsent();
  p.forWhom = "child";
  p.patient.weight = "24 kg";
  p.acknowledgement.relationship = "parent";
  return p;
}

/** The smallest real PNG: 1x1, transparent. */
export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
