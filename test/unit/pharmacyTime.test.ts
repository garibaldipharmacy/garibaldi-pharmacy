import { describe, expect, it } from "vitest";
import { isoToPharmacyLocal, pharmacyLocalToIso } from "~~/shared/pharmacyTime";

describe("pharmacy time", () => {
  it("reads winter times as Pacific Standard Time (UTC-8)", () => {
    expect(pharmacyLocalToIso("2026-02-16T09:00")).toBe("2026-02-16T17:00:00.000Z");
  });

  it("reads summer times as Pacific Daylight Time (UTC-7)", () => {
    expect(pharmacyLocalToIso("2026-07-01T09:00")).toBe("2026-07-01T16:00:00.000Z");
  });

  it("gets the days daylight saving starts and ends right", () => {
    // 2026: starts March 8, ends November 1, both at 2 a.m.
    expect(pharmacyLocalToIso("2026-03-08T01:00")).toBe("2026-03-08T09:00:00.000Z");
    expect(pharmacyLocalToIso("2026-03-08T03:00")).toBe("2026-03-08T10:00:00.000Z");
    expect(pharmacyLocalToIso("2026-11-01T03:00")).toBe("2026-11-01T11:00:00.000Z");
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
