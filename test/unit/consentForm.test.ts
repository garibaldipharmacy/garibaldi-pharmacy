import { describe, expect, it } from "vitest";

import { CONSENT_VACCINES, consentPayloadSchema } from "~~/shared/consent";
import {
  HEALTHLINK_URLS,
  PHN_ERROR,
  asksDose,
  asksLastDose,
  asksPregnancy,
  buildConsentPayload,
  cleanPhn,
  consentMessage,
  emptyConsentForm,
  isUnder18,
  pharmacyToday,
  validateConsentForm,
  asksWeight,
  type ConsentFormState,
} from "~~/shared/consentForm";
import { validConsent } from "./consentFixtures";

const signedAt = new Date("2026-11-22T19:30:00.000Z");
const now = signedAt;

/** The form as the female patient in the mockups fills it in. */
function filled(): ConsentFormState {
  const s = emptyConsentForm();
  Object.assign(s.patient, {
    firstName: " Avery ",
    lastName: "Sample",
    dateOfBirth: "1958-04-12",
    phn: "9123456787",
    sex: "female",
    phone: "(604) 555-0142",
    email: "not-a-real-patient@example.invalid",
  });
  Object.assign(s.emergencyContact, { name: "Morgan Sample", phone: "+1 (604) 555-0187" });
  Object.assign(s.screening, {
    sick: "no",
    allergy: "yes",
    allergyDetail: "Penicillin (hives)",
    pregnant: "no",
    reaction: "no",
    reactionDetail: "typed, then answered no",
    neuro: "no",
    bleeding: "yes",
    bleedingDetail: "Aspirin 81 mg daily",
  });
  s.items = [
    { vaccine: "flu", reason: "Seasonal influenza prevention", otherText: "", dose: "unsure", lastDoseDate: "" },
    { vaccine: "covid", reason: "COVID-19 prevention", otherText: "", dose: "booster", lastDoseDate: "" },
    { vaccine: "shingles", reason: "Shingles prevention", otherText: "", dose: "2", lastDoseDate: "2026-05-14" },
  ];
  s.agreed = true;
  s.signerName = "Avery Sample";
  return s;
}

const ok = { hasSignature: true, now };

describe("PHN cleaning", () => {
  it("keeps digits only, and never shortens", () => {
    expect(cleanPhn("9123 456 787")).toBe("9123456787");
    expect(cleanPhn("9123-456-787x")).toBe("9123456787");
    expect(cleanPhn("91234567870")).toBe("91234567870");
  });

  it("reports anything but 10 digits with the form's wording", () => {
    for (const phn of ["912345678", "91234567870", ""]) {
      const s = filled();
      s.patient.phn = phn;
      expect(validateConsentForm(s, ok)).toEqual({ "patient.phn": PHN_ERROR });
    }
    expect(PHN_ERROR).toBe("Enter all 10 digits of your Personal Health Number");
  });
});

describe("the payload builder", () => {
  it("builds exactly the contract's payload from the filled form", () => {
    const payload = buildConsentPayload(filled(), signedAt);
    expect(payload).toEqual(validConsent());
    expect(consentPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("sends phones as digits, without the country code", () => {
    const payload = buildConsentPayload(filled(), signedAt);
    expect(payload.patient.phone).toBe("6045550142");
    expect(payload.emergencyContact.phone).toBe("6045550187");
  });

  it("sends signedAt as ISO UTC and dates as YYYY-MM-DD", () => {
    const payload = buildConsentPayload(filled(), signedAt);
    expect(payload.acknowledgement.signedAt).toBe("2026-11-22T19:30:00.000Z");
    expect(payload.patient.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.items[2].lastDoseDate).toBe("2026-05-14");
  });

  it("sends a detail only when its answer is yes", () => {
    const payload = buildConsentPayload(filled(), signedAt);
    expect(payload.screening).not.toHaveProperty("reactionDetail");
    expect(payload.screening.allergyDetail).toBe("Penicillin (hives)");
  });

  it("sends pregnant as na for a male patient, whatever was answered before", () => {
    const s = filled();
    s.patient.sex = "male";
    s.screening.pregnant = "yes";
    const payload = buildConsentPayload(s, signedAt);
    expect(payload.screening.pregnant).toBe("na");
    expect(consentPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("leaves out the dose for flu and B12, and sends it for everything else", () => {
    for (const v of CONSENT_VACCINES) {
      const s = filled();
      s.items = [{ vaccine: v.id, reason: v.reason, otherText: "Typhoid", dose: "3", lastDoseDate: "" }];
      const [item] = buildConsentPayload(s, signedAt).items;
      if (v.asksDose) expect(item.dose).toBe("3");
      else expect(item).not.toHaveProperty("dose");
    }
  });

  it("sends a last dose date only with dose 2 to 4 or booster", () => {
    for (const dose of ["unsure", "1", "2", "3", "4", "booster"] as const) {
      const s = filled();
      s.items = [{ vaccine: "hepb", reason: "", otherText: "", dose, lastDoseDate: "2026-05-14" }];
      const [item] = buildConsentPayload(s, signedAt).items;
      expect(item.lastDoseDate !== undefined).toBe(["2", "3", "4", "booster"].includes(dose));
    }
    // Nor for flu, which has no dose to go with it
    const s = filled();
    s.items = [{ vaccine: "flu", reason: "", otherText: "", dose: "2", lastDoseDate: "2026-05-14" }];
    expect(buildConsentPayload(s, signedAt).items[0]).toEqual({ vaccine: "flu", reason: "" });
  });

  it("leaves out an empty last dose date", () => {
    const s = filled();
    s.items[2].lastDoseDate = "";
    expect(buildConsentPayload(s, signedAt).items[2]).not.toHaveProperty("lastDoseDate");
  });

  it("sends otherText only for something else", () => {
    const s = filled();
    s.items[0].otherText = "left over from before";
    s.items.push({ vaccine: "other", reason: "", otherText: " Typhoid ", dose: "unsure", lastDoseDate: "" });
    const items = buildConsentPayload(s, signedAt).items;
    expect(items[0]).not.toHaveProperty("otherText");
    expect(items[3]).toEqual({ vaccine: "other", otherText: "Typhoid", reason: "", dose: "unsure" });
  });

  it("follows forWhom: self and no weight for me; the chosen relationship and weight for a child", () => {
    const me = filled();
    me.patient.weight = "70 kg";
    me.relationship = "parent";
    const forMe = buildConsentPayload(me, signedAt);
    expect(forMe.acknowledgement.relationship).toBe("self");
    expect(forMe.patient).not.toHaveProperty("weight");

    const child = filled();
    child.forWhom = "child";
    child.patient.dateOfBirth = "2018-03-09";
    child.patient.weight = " 24 kg ";
    child.relationship = "rep";
    const forChild = buildConsentPayload(child, signedAt);
    expect(forChild.acknowledgement.relationship).toBe("rep");
    expect(forChild.patient.weight).toBe("24 kg");
    expect(consentPayloadSchema.safeParse(forChild).success).toBe(true);
  });
});

describe("checking the form before it is sent", () => {
  it("passes the filled form", () => {
    expect(validateConsentForm(filled(), ok)).toEqual({});
  });

  it("lists every missing answer on an empty form, in page order", () => {
    const errors = validateConsentForm(emptyConsentForm(), { hasSignature: false, now });
    expect(Object.keys(errors)).toEqual([
      "patient.firstName",
      "patient.lastName",
      "patient.dateOfBirth",
      "patient.phn",
      "patient.sex",
      "patient.phone",
      "emergencyContact.name",
      "emergencyContact.phone",
      "screening.sick",
      "screening.allergy",
      "screening.pregnant",
      "screening.reaction",
      "screening.neuro",
      "screening.bleeding",
      "items.0.vaccine",
      "acknowledgement.agreed",
      "acknowledgement.signerName",
      "signature",
    ]);
  });

  it("requires the emergency contact", () => {
    const s = filled();
    s.emergencyContact = { name: "", phone: "" };
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["emergencyContact.name", "emergencyContact.phone"]);
  });

  it("asks a female patient yes or no about pregnancy, and never a male one", () => {
    const female = filled();
    female.screening.pregnant = "";
    expect(validateConsentForm(female, ok)).toEqual({ "screening.pregnant": "Answer yes or no" });

    const male = filled();
    male.patient.sex = "male";
    male.screening.pregnant = "";
    expect(validateConsentForm(male, ok)).toEqual({});
    expect(asksPregnancy("male")).toBe(false);
    expect(asksPregnancy("female")).toBe(true);
  });

  it("requires a detail when an answer is yes", () => {
    const s = filled();
    s.screening.bleedingDetail = "  ";
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["screening.bleedingDetail"]);
  });

  it("takes email as optional, but checks one that is given", () => {
    const s = filled();
    s.patient.email = "";
    expect(validateConsentForm(s, ok)).toEqual({});
    s.patient.email = "jane@";
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["patient.email"]);
  });

  it("checks dates are real, and that the birth and last dose are not in the future", () => {
    const s = filled();
    s.patient.dateOfBirth = "1958-02-30";
    s.items[2].lastDoseDate = "2027-01-01";
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["patient.dateOfBirth", "items.2.lastDoseDate"]);
    s.patient.dateOfBirth = "2030-01-01";
    s.items[2].lastDoseDate = "2026-5-14";
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["patient.dateOfBirth", "items.2.lastDoseDate"]);
  });

  it("asks how the signer is related to someone in care", () => {
    const s = filled();
    s.forWhom = "child";
    expect(Object.keys(validateConsentForm(s, ok))).toContain("acknowledgement.relationship");
  });

  it("asks, and requires, a weight for someone in care who is under 18", () => {
    const s = filled();
    s.forWhom = "child";
    s.relationship = "parent";
    s.patient.dateOfBirth = "2018-03-09";
    expect(asksWeight(s, now)).toBe(true);
    expect(validateConsentForm(s, ok)).toEqual({ "patient.weight": "Enter their weight, like 24 kg" });
    s.patient.weight = "24 kg";
    expect(validateConsentForm(s, ok)).toEqual({});
    expect(buildConsentPayload(s, signedAt).patient.weight).toBe("24 kg");
  });

  it("doesn't ask a weight for someone in care who is 18 or over, nor send one typed earlier", () => {
    const s = filled();
    s.forWhom = "child";
    s.relationship = "rep";
    s.patient.weight = "70 kg";
    expect(asksWeight(s, now)).toBe(false);
    expect(validateConsentForm(s, ok)).toEqual({});
    expect(buildConsentPayload(s, signedAt).patient).not.toHaveProperty("weight");
  });

  it("doesn't ask a weight until the date of birth shows they're under 18", () => {
    const s = filled();
    s.forWhom = "child";
    for (const dob of ["", "2018", "2018-03"]) {
      s.patient.dateOfBirth = dob;
      expect(asksWeight(s, now)).toBe(false);
    }
  });

  it("never asks weight on a form for me, whatever the age", () => {
    const s = filled();
    s.patient.dateOfBirth = "2012-01-01";
    s.patient.weight = "40 kg";
    expect(asksWeight(s, now)).toBe(false);
    expect(validateConsentForm(s, ok)).toEqual({});
    expect(buildConsentPayload(s, signedAt).patient).not.toHaveProperty("weight");
  });

  it("asks which vaccine for something else", () => {
    const s = filled();
    s.items[0] = { vaccine: "other", reason: "", otherText: "", dose: "unsure", lastDoseDate: "" };
    expect(Object.keys(validateConsentForm(s, ok))).toEqual(["items.0.otherText"]);
  });

  it("requires agreement and a signature", () => {
    const s = filled();
    s.agreed = false;
    expect(Object.keys(validateConsentForm(s, { hasSignature: false, now }))).toEqual([
      "acknowledgement.agreed",
      "signature",
    ]);
  });

  it("puts each problem in the patient's words, whatever the card", () => {
    expect(consentMessage("items.3.dose")).toBe("Choose which dose this is");
    expect(consentMessage("patient.phn")).toBe(PHN_ERROR);
    expect(consentMessage("something.unexpected")).toBe("Check this answer");
  });
});

describe("age", () => {
  // 22 Nov 2026, 7:30 p.m. UTC: 11:30 a.m. in Squamish
  it("is under 18 until the 18th birthday, in Squamish", () => {
    expect(isUnder18("2008-11-23", now)).toBe(true);
    expect(isUnder18("2008-11-22", now)).toBe(false);
    expect(isUnder18("1958-04-12", now)).toBe(false);
    expect(isUnder18("2018-03-09", now)).toBe(true);
  });

  it("uses the date in Squamish, not UTC", () => {
    // 23 Nov 2026 at 3 a.m. UTC is still the evening of the 22nd in Squamish
    const lateEvening = new Date("2026-11-23T03:00:00Z");
    expect(pharmacyToday(lateEvening)).toBe("2026-11-22");
    expect(isUnder18("2008-11-23", lateEvening)).toBe(true);
  });

  it("is not known until the date of birth is a real date", () => {
    for (const dob of ["", "2008-11", "2008-02-30"]) expect(isUnder18(dob, now)).toBeNull();
  });

  it("turns 18 on 1 March for someone born on 29 February", () => {
    expect(isUnder18("2008-02-29", new Date("2026-02-28T20:00:00Z"))).toBe(true);
    expect(isUnder18("2008-02-29", new Date("2026-03-01T20:00:00Z"))).toBe(false);
  });

  it("checks a last dose isn't in the future by the date in Squamish", () => {
    const s = filled();
    s.items[2].lastDoseDate = "2026-11-23";
    expect(Object.keys(validateConsentForm(s, { hasSignature: true, now: new Date("2026-11-23T03:00:00Z") }))).toEqual([
      "items.2.lastDoseDate",
    ]);
  });
});

describe("which questions each vaccine asks", () => {
  it("asks the dose for every vaccine except flu and B12, and not before one is chosen", () => {
    expect(CONSENT_VACCINES.filter((v) => asksDose(v.id)).map((v) => v.id)).toEqual(
      CONSENT_VACCINES.filter((v) => v.asksDose).map((v) => v.id),
    );
    expect(asksDose("")).toBe(false);
  });

  it("asks the last dose's date only for dose 2 to 4 or booster", () => {
    expect(["unsure", "1", "2", "3", "4", "booster"].filter(asksLastDose)).toEqual(["2", "3", "4", "booster"]);
  });

  it("links every vaccine but B12 and something else to HealthLinkBC, for reference", () => {
    for (const v of CONSENT_VACCINES) {
      const url = HEALTHLINK_URLS[v.id];
      if (v.id === "b12" || v.id === "other") expect(url).toBeUndefined();
      else expect(url).toMatch(/^https:\/\/www\.healthlinkbc\.ca\/healthlinkbc-files\/[a-z0-9-]+$/);
    }
  });
});
