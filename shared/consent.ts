// Vaccine consent forms from garibaldipharmacy.com/consent: THE CONTRACT between the website and
// the dashboard (design-handoff/2026-11-consent-forms/DESIGN-SPEC.md §1). The website copies this
// file word for word, so it depends on nothing but zod.
//
// WEBSITE COPY. Ported from the dashboard's shared/consent.ts (zod 4) to this repo's zod 3. The
// only changes are the two date checks, z.iso.date() and z.iso.datetime(), which become
// z.string().date() and z.string().datetime(). Those accept exactly the same strings: YYYY-MM-DD
// with a real day of the month, and ISO UTC with no offset. Every other rule, limit and message is
// identical. If the dashboard's file changes, change this one to match: the dashboard's is the
// source of truth.
//
// The website sends a request with kind "consent" through the existing sealed sync; this is the
// decrypted payload. One attached file, role "signature", holds the patient's drawn signature (PNG).
//
// Rules (§1):
//   - All dates YYYY-MM-DD; acknowledgement.signedAt is ISO UTC.
//   - patient.phn: required, exactly 10 digits, digits only. patient.sex: male | female.
//   - screening answers yes | no. pregnant: yes | no for female; a male patient is never asked
//     and the website sends "na". A *Detail (≤ 200) is present when its answer is yes.
//   - emergencyContact: name and phone required.
//   - forWhom me | child. weight only for a child. relationship: self for me, else parent | rep.
//   - items: 1–4. `other` adds otherText. reason ≤ 200.
//   - items[].dose: unsure | 1 | 2 | 3 | 4 | booster. Absent for flu and b12, required otherwise.
//   - items[].lastDoseDate: optional, only when dose is 2–4 or booster.
import { z } from 'zod';

/** Vaccine ids, labels and default reasons: types, not brands (the pharmacist picks the product). */
export const CONSENT_VACCINES = [
  { id: 'flu', label: 'Influenza (flu) vaccine', reason: 'Seasonal influenza prevention', asksDose: false },
  { id: 'covid', label: 'COVID-19 vaccine', reason: 'COVID-19 prevention', asksDose: true },
  { id: 'shingles', label: 'Shingles vaccine', reason: 'Shingles prevention', asksDose: true },
  { id: 'pneumo', label: 'Pneumococcal vaccine', reason: 'Pneumococcal disease prevention', asksDose: true },
  { id: 'rsv', label: 'RSV vaccine', reason: 'RSV prevention', asksDose: true },
  { id: 'tdap', label: 'Tetanus, diphtheria & pertussis (Tdap)', reason: 'Tetanus, diphtheria and pertussis prevention', asksDose: true },
  { id: 'hepa', label: 'Hepatitis A vaccine', reason: 'Hepatitis A prevention', asksDose: true },
  { id: 'hepb', label: 'Hepatitis B vaccine', reason: 'Hepatitis B prevention', asksDose: true },
  { id: 'hpv', label: 'HPV vaccine', reason: 'HPV prevention', asksDose: true },
  { id: 'typhoid', label: 'Typhoid vaccine', reason: 'Typhoid prevention', asksDose: true },
  { id: 'b12', label: 'Vitamin B12 injection', reason: 'Vitamin B12 replacement', asksDose: false },
  { id: 'other', label: 'Something else (type it in)', reason: '', asksDose: true },
] as const;

export type ConsentVaccineId = (typeof CONSENT_VACCINES)[number]['id'];
export const CONSENT_VACCINE_IDS = CONSENT_VACCINES.map((v) => v.id) as [ConsentVaccineId, ...ConsentVaccineId[]];

export const DOSE_CHOICES = ['unsure', '1', '2', '3', '4', 'booster'] as const;
export type DoseChoice = (typeof DOSE_CHOICES)[number];

/** The vaccines whose form never asks which dose. */
export const NO_DOSE_VACCINES: readonly ConsentVaccineId[] = ['flu', 'b12'];
/** The doses that may carry a lastDoseDate. */
export const LAST_DOSE_DOSES: readonly DoseChoice[] = ['2', '3', '4', 'booster'];

export const MAX_DETAIL = 200;
export const MAX_REASON = 200;
export const MAX_ITEMS = 4;

const date = z.string().date();
const yesNo = z.enum(['yes', 'no']);
const detail = z.string().max(MAX_DETAIL).optional();
const required = (max: number) => z.string().trim().min(1).max(max);

export const consentItemSchema = z.object({
  vaccine: z.enum(CONSENT_VACCINE_IDS),
  otherText: z.string().trim().max(60).optional(),
  reason: z.string().max(MAX_REASON),
  dose: z.enum(DOSE_CHOICES).optional(),
  lastDoseDate: date.optional(),
});

export const consentPayloadSchema = z
  .object({
    kind: z.literal('consent'),
    forWhom: z.enum(['me', 'child']),
    patient: z.object({
      firstName: required(100),
      lastName: required(100),
      dateOfBirth: date,
      phn: z.string().regex(/^\d{10}$/, 'PHN must be exactly 10 digits'),
      sex: z.enum(['male', 'female']),
      phone: required(30),
      email: z.string().max(200),
      weight: z.string().max(40).optional(),
    }),
    emergencyContact: z.object({ name: required(100), phone: required(30) }),
    screening: z.object({
      sick: yesNo,
      allergy: yesNo,
      allergyDetail: detail,
      pregnant: z.enum(['yes', 'no', 'na']),
      reaction: yesNo,
      reactionDetail: detail,
      neuro: yesNo,
      bleeding: yesNo,
      bleedingDetail: detail,
    }),
    items: z.array(consentItemSchema).min(1).max(MAX_ITEMS),
    acknowledgement: z.object({
      agreed: z.literal(true),
      signerName: required(100),
      relationship: z.enum(['self', 'parent', 'rep']),
      signedAt: z.string().datetime(),
    }),
  })
  .superRefine((p, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    // Pregnant: yes | no for female; "na" for male (the question isn't shown).
    if (p.patient.sex === 'male' && p.screening.pregnant !== 'na') issue(['screening', 'pregnant'], 'Pregnant must be "na" for a male patient');
    if (p.patient.sex === 'female' && p.screening.pregnant === 'na') issue(['screening', 'pregnant'], 'Pregnant must be yes or no for a female patient');
    // A detail is present when its answer is yes.
    for (const k of ['allergy', 'reaction', 'bleeding'] as const) {
      if (p.screening[k] === 'yes' && !p.screening[`${k}Detail`]?.trim()) issue(['screening', `${k}Detail`], `${k}Detail is required when ${k} is yes`);
    }
    // weight only for a child; relationship self for me, else parent | rep.
    if (p.forWhom === 'me' && p.patient.weight) issue(['patient', 'weight'], 'weight is only sent for a child');
    if (p.forWhom === 'me' && p.acknowledgement.relationship !== 'self') issue(['acknowledgement', 'relationship'], 'relationship is self when the form is for me');
    if (p.forWhom === 'child' && p.acknowledgement.relationship === 'self') issue(['acknowledgement', 'relationship'], 'relationship is parent or rep for a child');
    p.items.forEach((it, i) => {
      const asksDose = !NO_DOSE_VACCINES.includes(it.vaccine);
      if (asksDose && !it.dose) issue(['items', i, 'dose'], `dose is required for ${it.vaccine}`);
      if (!asksDose && it.dose !== undefined) issue(['items', i, 'dose'], `dose is never sent for ${it.vaccine}`);
      if (it.lastDoseDate && !(it.dose && LAST_DOSE_DOSES.includes(it.dose))) issue(['items', i, 'lastDoseDate'], 'lastDoseDate only goes with dose 2–4 or booster');
      if (it.vaccine === 'other' && !it.otherText) issue(['items', i, 'otherText'], 'otherText is required for other');
      if (it.vaccine !== 'other' && it.otherText) issue(['items', i, 'otherText'], 'otherText only goes with other');
    });
  });

export type ConsentPayload = z.infer<typeof consentPayloadSchema>;
export type ConsentItem = z.infer<typeof consentItemSchema>;

/** Checks a payload. Never throws: a payload that fails is still stored and shown, flagged (§1). */
export function parseConsent(payload: unknown): { ok: true; data: ConsentPayload } | { ok: false; issues: string[] } {
  const r = consentPayloadSchema.safeParse(payload);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, issues: r.error.issues.map((i) => `${i.path.join('.') || 'payload'}: ${i.message}`) };
}
