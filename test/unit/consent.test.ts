import { describe, expect, it } from "vitest";

import {
  CONSENT_VACCINES,
  DOSE_CHOICES,
  MAX_ITEMS,
  consentPayloadSchema,
  parseConsent,
  type ConsentPayload,
} from "~~/shared/consent";
import { validChildConsent, validConsent, validMaleConsent } from "./consentFixtures";

// The contract the dashboard opens consents with. These run the same valid and
// invalid cases the dashboard's own copy must agree on, so a rule that drifts in
// the zod 3 port fails here.

/** The paths of every issue, e.g. ["screening.pregnant"]. Empty when valid. */
function issues(payload: unknown): string[] {
  const r = consentPayloadSchema.safeParse(payload);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
}

function edit(change: (p: ConsentPayload) => void): ConsentPayload {
  const p = validConsent();
  change(p);
  return p;
}

describe("consent contract: valid payloads", () => {
  it("accepts a female patient with three vaccines", () => {
    expect(issues(validConsent())).toEqual([]);
  });

  it("accepts a male patient whose pregnancy answer is na", () => {
    expect(issues(validMaleConsent())).toEqual([]);
  });

  it("accepts a form for someone in care, with weight and relationship", () => {
    expect(issues(validChildConsent())).toEqual([]);
    const rep = validChildConsent();
    rep.acknowledgement.relationship = "rep";
    expect(issues(rep)).toEqual([]);
  });

  it("accepts an empty email, as email is optional", () => {
    expect(issues(edit((p) => (p.patient.email = "")))).toEqual([]);
  });

  it("knows the 11 vaccine types, with flu and B12 the only ones that never ask a dose", () => {
    expect(CONSENT_VACCINES.map((v) => v.id)).toEqual([
      "flu", "covid", "shingles", "pneumo", "rsv", "tdap", "hepa", "hepb", "hpv", "b12", "other",
    ]);
    expect(CONSENT_VACCINES.filter((v) => !v.asksDose).map((v) => v.id)).toEqual(["flu", "b12"]);
  });
});

describe("consent contract: pregnancy follows sex at birth", () => {
  it("rejects a female patient sent as na", () => {
    expect(issues(edit((p) => (p.screening.pregnant = "na")))).toEqual(["screening.pregnant"]);
  });

  it("accepts yes or no for a female patient", () => {
    expect(issues(edit((p) => (p.screening.pregnant = "yes")))).toEqual([]);
    expect(issues(edit((p) => (p.screening.pregnant = "no")))).toEqual([]);
  });

  it("rejects yes or no for a male patient, who is never asked", () => {
    for (const answer of ["yes", "no"] as const) {
      const p = validMaleConsent();
      p.screening.pregnant = answer;
      expect(issues(p)).toEqual(["screening.pregnant"]);
    }
  });

  it("rejects a missing or unknown sex", () => {
    expect(issues(edit((p) => ((p.patient as { sex?: string }).sex = "")))).toContain("patient.sex");
    expect(issues(edit((p) => delete (p.patient as { sex?: string }).sex))).toContain("patient.sex");
  });
});

describe("consent contract: Personal Health Number", () => {
  it.each([
    ["9 digits", "912345678"],
    ["11 digits", "91234567870"],
    ["spaces", "9123 456 787"],
    ["letters", "912345678a"],
    ["empty", ""],
  ])("rejects %s", (_, phn) => {
    expect(issues(edit((p) => (p.patient.phn = phn)))).toEqual(["patient.phn"]);
  });

  it("accepts exactly 10 digits", () => {
    expect(issues(edit((p) => (p.patient.phn = "0000000000")))).toEqual([]);
  });
});

describe("consent contract: a detail is required when its answer is yes", () => {
  for (const key of ["allergy", "reaction", "bleeding"] as const) {
    it(`${key}: yes with no detail, or only spaces, is rejected`, () => {
      expect(issues(edit((p) => {
        p.screening[key] = "yes";
        delete p.screening[`${key}Detail`];
      }))).toEqual([`screening.${key}Detail`]);
      expect(issues(edit((p) => {
        p.screening[key] = "yes";
        p.screening[`${key}Detail`] = "   ";
      }))).toEqual([`screening.${key}Detail`]);
    });

    it(`${key}: no with no detail is fine`, () => {
      expect(issues(edit((p) => {
        p.screening[key] = "no";
        delete p.screening[`${key}Detail`];
      }))).toEqual([]);
    });
  }

  it("caps a detail at 200 characters", () => {
    expect(issues(edit((p) => (p.screening.allergyDetail = "x".repeat(200))))).toEqual([]);
    expect(issues(edit((p) => (p.screening.allergyDetail = "x".repeat(201))))).toEqual([
      "screening.allergyDetail",
    ]);
  });

  it("only takes yes or no for the other answers", () => {
    expect(issues(edit((p) => ((p.screening as { sick: string }).sick = "na")))).toEqual([
      "screening.sick",
    ]);
  });
});

describe("consent contract: emergency contact", () => {
  it("requires a name and a phone", () => {
    expect(issues(edit((p) => (p.emergencyContact.name = "  ")))).toEqual(["emergencyContact.name"]);
    expect(issues(edit((p) => (p.emergencyContact.phone = "")))).toEqual(["emergencyContact.phone"]);
    expect(issues(edit((p) => delete (p as Partial<ConsentPayload>).emergencyContact))).toEqual([
      "emergencyContact",
    ]);
  });
});

describe("consent contract: doses", () => {
  it("rejects a dose for flu and for B12", () => {
    for (const vaccine of ["flu", "b12"] as const) {
      expect(issues(edit((p) => (p.items = [{ vaccine, reason: "", dose: "unsure" }])))).toEqual([
        "items.0.dose",
      ]);
    }
  });

  it("requires a dose for every other vaccine", () => {
    for (const v of CONSENT_VACCINES.filter((v) => v.asksDose)) {
      const item = { vaccine: v.id, reason: v.reason, ...(v.id === "other" ? { otherText: "Typhoid" } : {}) };
      expect(issues(edit((p) => (p.items = [item])))).toEqual(["items.0.dose"]);
      for (const dose of DOSE_CHOICES) {
        expect(issues(edit((p) => (p.items = [{ ...item, dose }])))).toEqual([]);
      }
    }
  });

  it("rejects a dose outside the choices", () => {
    expect(issues(edit((p) => ((p.items[1] as { dose: string }).dose = "5")))).toEqual(["items.1.dose"]);
  });
});

describe("consent contract: last dose date", () => {
  it("goes with dose 2, 3, 4 or booster", () => {
    for (const dose of ["2", "3", "4", "booster"] as const) {
      expect(issues(edit((p) => (p.items = [{ vaccine: "hepb", reason: "", dose, lastDoseDate: "2026-05-14" }])))).toEqual([]);
    }
  });

  it("is rejected with not sure, dose 1, or no dose at all", () => {
    for (const dose of ["unsure", "1"] as const) {
      expect(issues(edit((p) => (p.items = [{ vaccine: "hepb", reason: "", dose, lastDoseDate: "2026-05-14" }])))).toEqual([
        "items.0.lastDoseDate",
      ]);
    }
    expect(issues(edit((p) => (p.items = [{ vaccine: "flu", reason: "", lastDoseDate: "2026-05-14" }])))).toEqual([
      "items.0.lastDoseDate",
    ]);
  });

  it("must be a real YYYY-MM-DD date", () => {
    for (const lastDoseDate of ["2026-02-30", "2026/05/14", "14-05-2026", "2026-5-14", "2026-05-14T00:00:00Z"]) {
      expect(issues(edit((p) => (p.items[2].lastDoseDate = lastDoseDate)))).toContain("items.2.lastDoseDate");
    }
    expect(issues(edit((p) => (p.items[2].lastDoseDate = "2024-02-29")))).toEqual([]);
  });
});

describe("consent contract: vaccines list", () => {
  it("takes 1 to 4 vaccines", () => {
    expect(issues(edit((p) => (p.items = [])))).toEqual(["items"]);
    const four = Array.from({ length: MAX_ITEMS }, () => ({ vaccine: "flu" as const, reason: "" }));
    expect(issues(edit((p) => (p.items = four)))).toEqual([]);
    expect(issues(edit((p) => (p.items = [...four, four[0]])))).toEqual(["items"]);
  });

  it("requires otherText for something else, and only for it", () => {
    expect(issues(edit((p) => (p.items = [{ vaccine: "other", reason: "", dose: "unsure" }])))).toEqual([
      "items.0.otherText",
    ]);
    expect(issues(edit((p) => (p.items = [{ vaccine: "other", reason: "", dose: "unsure", otherText: "Typhoid" }])))).toEqual([]);
    expect(issues(edit((p) => (p.items[0].otherText = "Typhoid")))).toEqual(["items.0.otherText"]);
    expect(issues(edit((p) => (p.items = [{ vaccine: "other", reason: "", dose: "unsure", otherText: "x".repeat(61) }])))).toEqual([
      "items.0.otherText",
    ]);
  });

  it("caps the reason at 200 characters", () => {
    expect(issues(edit((p) => (p.items[0].reason = "x".repeat(201))))).toEqual(["items.0.reason"]);
  });

  it("rejects an unknown vaccine", () => {
    expect(issues(edit((p) => ((p.items[0] as { vaccine: string }).vaccine = "measles")))).toEqual([
      "items.0.vaccine",
    ]);
  });
});

describe("consent contract: relationship and weight follow forWhom", () => {
  it("rejects a weight on a form for me", () => {
    expect(issues(edit((p) => (p.patient.weight = "70 kg")))).toEqual(["patient.weight"]);
  });

  it("rejects parent or rep on a form for me", () => {
    for (const relationship of ["parent", "rep"] as const) {
      expect(issues(edit((p) => (p.acknowledgement.relationship = relationship)))).toEqual([
        "acknowledgement.relationship",
      ]);
    }
  });

  it("rejects self on a form for someone in care", () => {
    const p = validChildConsent();
    p.acknowledgement.relationship = "self";
    expect(issues(p)).toEqual(["acknowledgement.relationship"]);
  });

  it("does not require a weight for someone in care", () => {
    const p = validChildConsent();
    delete p.patient.weight;
    expect(issues(p)).toEqual([]);
  });
});

describe("consent contract: acknowledgement and dates", () => {
  it("requires agreement", () => {
    expect(issues(edit((p) => ((p.acknowledgement as { agreed: boolean }).agreed = false)))).toEqual([
      "acknowledgement.agreed",
    ]);
  });

  it("requires the signer's name", () => {
    expect(issues(edit((p) => (p.acknowledgement.signerName = " ")))).toEqual([
      "acknowledgement.signerName",
    ]);
  });

  it("takes signedAt as ISO UTC only", () => {
    expect(issues(edit((p) => (p.acknowledgement.signedAt = "2026-11-22T19:30:00Z")))).toEqual([]);
    for (const signedAt of ["2026-11-22T11:30:00-08:00", "2026-11-22", "Nov 22 2026"]) {
      expect(issues(edit((p) => (p.acknowledgement.signedAt = signedAt)))).toEqual([
        "acknowledgement.signedAt",
      ]);
    }
  });

  it("takes the date of birth as YYYY-MM-DD", () => {
    for (const dateOfBirth of ["1958-4-12", "12/04/1958", "1958-13-01"]) {
      expect(issues(edit((p) => (p.patient.dateOfBirth = dateOfBirth)))).toEqual(["patient.dateOfBirth"]);
    }
  });

  it("requires kind consent", () => {
    expect(issues(edit((p) => ((p as { kind: string }).kind = "refill")))).toEqual(["kind"]);
  });
});

describe("parseConsent", () => {
  it("returns the data when valid", () => {
    const r = parseConsent(validConsent());
    expect(r.ok).toBe(true);
  });

  it("never throws, and names each problem by path", () => {
    expect(parseConsent(null)).toEqual({ ok: false, issues: [expect.stringMatching(/^payload: /)] });
    const r = parseConsent(edit((p) => (p.patient.phn = "123")));
    expect(r).toEqual({ ok: false, issues: ["patient.phn: PHN must be exactly 10 digits"] });
  });
});
