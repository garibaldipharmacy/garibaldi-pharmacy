import { describe, expect, it } from "vitest";
import type { SubmissionRow } from "~~/server/utils/db";
import { submissionMatches } from "~~/server/utils/submissions";

const row = (payload: unknown): SubmissionRow => ({
  id: "s_1",
  reference: "GP-7KQ2",
  kind: "refill",
  received_at: "2026-10-15T17:00:00.000Z",
  status: "received",
  flags: "[]",
  acknowledged_at: null,
  acknowledged_by: null,
  idempotency_key: "k",
  payload: JSON.stringify(payload),
});

const refill = row({
  kind: "refill",
  patient: {
    firstName: "Jane",
    lastName: "Doe",
    phone: "604-848-7059",
    email: "jane@example.com",
  },
  medications: "Atorvastatin 20 mg",
  prescriptions: [{ key: "rx_0" }],
});

describe("submissionMatches", () => {
  it("finds a submission by its reference, in any case", () => {
    expect(submissionMatches(refill, "gp-7kq2")).toBe(true);
  });

  it("finds a submission by anything the patient entered", () => {
    expect(submissionMatches(refill, "atorvastatin")).toBe(true);
    expect(submissionMatches(refill, "jane@example")).toBe(true);
  });

  it("requires every word to match somewhere", () => {
    expect(submissionMatches(refill, "jane doe")).toBe(true);
    expect(submissionMatches(refill, "jane smith")).toBe(false);
  });

  it("matches phone numbers however they're punctuated", () => {
    expect(submissionMatches(refill, "6048487059")).toBe(true);
    expect(submissionMatches(refill, "(604) 848")).toBe(true);
  });

  it("ignores the internal file references", () => {
    expect(submissionMatches(refill, "rx_0")).toBe(false);
  });

  it("still searches a row whose payload can't be read", () => {
    const broken = { ...refill, payload: "{not json" };
    expect(submissionMatches(broken, "GP-7KQ2")).toBe(true);
  });
});
