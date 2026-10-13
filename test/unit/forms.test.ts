import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  envelopeSchema,
  fieldErrors,
  formatPhone,
  LIMITS,
  requestBodySchema,
} from "~~/shared/forms";

const patient = {
  firstName: "Test",
  lastName: "Patient",
  dateOfBirth: "1980-05-02",
  phone: "(604) 555-0100",
  email: "test.patient@example.com",
};

const patientWithHealthInfo = { ...patient, sex: "female", phn: "9123-456-789" };

describe("phone handling", () => {
  it("strips formatting down to digits", () => {
    expect(digitsOnly("(604) 555-0100")).toBe("6045550100");
  });

  it("formats ten digits for display", () => {
    expect(formatPhone("6045550100")).toBe("(604) 555-0100");
  });

  it("leaves anything that is not ten digits alone", () => {
    expect(formatPhone("604555")).toBe("604555");
  });

  it("accepts a masked phone number and normalises it", () => {
    const parsed = requestBodySchema.parse({
      kind: "refill",
      patient,
      medications: "Ramipril 10mg",
      retrievalMethod: "pickup",
    });
    expect(parsed.patient.phone).toBe("6045550100");
  });

  it("rejects a phone number that is too short", () => {
    const result = requestBodySchema.safeParse({
      kind: "refill",
      patient: { ...patient, phone: "604555" },
      medications: "Ramipril 10mg",
      retrievalMethod: "pickup",
    });
    expect(result.success).toBe(false);
  });
});

describe("date of birth", () => {
  const base = { kind: "refill", medications: "x", retrievalMethod: "pickup" };

  it("rejects an empty value", () => {
    // Previously the form showed a required asterisk with no `required`
    // attribute, so a submission with no date of birth was accepted.
    const result = requestBodySchema.safeParse({
      ...base,
      patient: { ...patient, dateOfBirth: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a date in the future", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      patient: { ...patient, dateOfBirth: "2099-01-01" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an implausible year", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      patient: { ...patient, dateOfBirth: "1823-01-01" },
    });
    expect(result.success).toBe(false);
  });
});

describe("refill", () => {
  it("requires a medication list", () => {
    // The old form let someone submit a refill request listing nothing at all.
    const result = requestBodySchema.safeParse({
      kind: "refill",
      patient,
      medications: "   ",
      retrievalMethod: "pickup",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toHaveProperty("medications");
    }
  });

  it("stores a stable retrieval method rather than a UI sentence", () => {
    const parsed = requestBodySchema.parse({
      kind: "refill",
      patient,
      medications: "Ramipril 10mg capsules",
      retrievalMethod: "delivery",
    });
    expect(parsed).toMatchObject({ retrievalMethod: "delivery" });
  });

  it("rejects the old English-sentence value", () => {
    const result = requestBodySchema.safeParse({
      kind: "refill",
      patient,
      medications: "Ramipril 10mg",
      retrievalMethod: "I will pickup my prescription",
    });
    expect(result.success).toBe(false);
  });
});

describe("transfer", () => {
  const base = {
    kind: "transfer",
    patient: patientWithHealthInfo,
    fromPharmacyName: "ABC Pharmacy",
    fromPharmacyPhone: "(604) 555-0199",
  };

  it("does not need a medication list when transferring everything", () => {
    const result = requestBodySchema.safeParse({ ...base, transferAll: true });
    expect(result.success).toBe(true);
  });

  it("requires a medication list when not transferring everything", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      transferAll: false,
      medications: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toHaveProperty("medications");
    }
  });

  it("accepts a partial transfer with a list", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      transferAll: false,
      medications: "Ramipril 10mg capsules",
    });
    expect(result.success).toBe(true);
  });

  it("normalises the personal health number to digits", () => {
    const parsed = requestBodySchema.parse({ ...base, transferAll: true });
    expect(parsed.patient).toMatchObject({ phn: "9123456789" });
  });

  it("rejects a personal health number of the wrong length", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      transferAll: true,
      patient: { ...patientWithHealthInfo, phn: "912" },
    });
    expect(result.success).toBe(false);
  });

  it("allows an omitted personal health number", () => {
    const { phn, ...withoutPhn } = patientWithHealthInfo;
    const result = requestBodySchema.safeParse({
      ...base,
      transferAll: true,
      patient: withoutPhn,
    });
    expect(result.success).toBe(true);
  });
});

describe("send", () => {
  const base = { kind: "send", patient: patientWithHealthInfo };

  it("requires at least one prescription", () => {
    const result = requestBodySchema.safeParse({ ...base, prescriptions: [] });
    expect(result.success).toBe(false);
  });

  it("accepts the maximum number of prescriptions", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: Array.from({ length: LIMITS.maxPrescriptions }, (_, i) => ({
        key: `rx_${i}`,
      })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects more prescriptions than the limit", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: Array.from({ length: LIMITS.maxPrescriptions + 1 }, (_, i) => ({
        key: `rx_${i}`,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("accepts an insurance card with a front and no back", () => {
    // Some insurance cards have nothing on the back. Never demand one.
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: [{ key: "rx_0" }],
      insurance: [{ front: { key: "ins_0_front" } }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts three insurance cards with fronts and backs", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: [{ key: "rx_0" }],
      insurance: Array.from({ length: LIMITS.maxInsuranceCards }, (_, i) => ({
        front: { key: `ins_${i}_front` },
        back: { key: `ins_${i}_back` },
      })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects more insurance cards than the limit", () => {
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: [{ key: "rx_0" }],
      insurance: Array.from({ length: LIMITS.maxInsuranceCards + 1 }, (_, i) => ({
        front: { key: `ins_${i}_front` },
      })),
    });
    expect(result.success).toBe(false);
  });

  it("defaults insurance to an empty list", () => {
    const parsed = requestBodySchema.parse({ ...base, prescriptions: [{ key: "rx_0" }] });
    expect(parsed).toMatchObject({ insurance: [] });
  });

  it("rejects an upload key that looks like a path", () => {
    // Part names become lookup keys, never paths.
    const result = requestBodySchema.safeParse({
      ...base,
      prescriptions: [{ key: "../../etc/passwd" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("envelope", () => {
  const valid = {
    idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
    renderedAt: new Date().toISOString(),
  };

  it("accepts a minimal envelope and defaults the optional fields", () => {
    const parsed = envelopeSchema.parse(valid);
    expect(parsed.botField).toBe("");
    expect(parsed.turnstileToken).toBe("");
  });

  it("rejects an idempotency key that is not a uuid", () => {
    expect(envelopeSchema.safeParse({ ...valid, idempotencyKey: "nope" }).success).toBe(
      false,
    );
  });
});

describe("fieldErrors", () => {
  it("flattens nested paths for the UI", () => {
    const result = requestBodySchema.safeParse({
      kind: "refill",
      patient: { ...patient, email: "not-an-email" },
      medications: "x",
      retrievalMethod: "pickup",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)["patient.email"]).toBeTruthy();
    }
  });
});
