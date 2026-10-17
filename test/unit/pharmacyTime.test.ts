import { describe, expect, it } from "vitest";
import { isoToPharmacyLocal, pharmacyLocalToIso } from "~~/shared/pharmacyTime";

describe("pharmacy time", () => {
  it("reads winter times as Pacific Standard Time (UTC-8)", () => {
    expect(pharmacyLocalToIso("2026-02-16T09:00")).toBe("2026-02-16T17:00:00.000Z");
  });

  it("reads summer times as Pacific Daylight Time (UTC-7)", () => {
    expect(pharmacyLocalToIso("2026-07-01T09:00")).toBe("2026-07-01T16:00:00.000Z");
  });

  it("gets the days the clocks change right", () => {
    // 2025: forward March 9, back November 2, both at 2 a.m. Past changes,
    // on purpose: B.C. stays on daylight time from November 2026, and only
    // newer time zone data (2026c on) knows it. The code asks the runtime,
    // so it follows whichever rules that has; the test mustn't hard-code a
    // future that depends on the data version
    expect(pharmacyLocalToIso("2025-03-09T01:00")).toBe("2025-03-09T09:00:00.000Z");
    expect(pharmacyLocalToIso("2025-03-09T03:00")).toBe("2025-03-09T10:00:00.000Z");
    expect(pharmacyLocalToIso("2025-11-02T03:00")).toBe("2025-11-02T11:00:00.000Z");
  });

  it("round-trips back to what was typed", () => {
    for (const local of ["2026-02-16T09:00", "2026-07-01T23:30", "2026-12-31T00:00"]) {
      expect(isoToPharmacyLocal(pharmacyLocalToIso(local)!)).toBe(local);
    }
  });

  it("rejects dates that don't exist", () => {
    expect(pharmacyLocalToIso("2026-02-30T09:00")).toBeNull();
    expect(pharmacyLocalToIso("not a date")).toBeNull();
  });
});
