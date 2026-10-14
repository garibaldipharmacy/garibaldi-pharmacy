import { describe, expect, it } from "vitest";
import { bcStatutoryHolidays, holidayOn } from "~~/shared/holidays";

const on = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
};

const datesIn = (year: number) =>
  Object.fromEntries(
    bcStatutoryHolidays(year).map((h) => [
      h.name,
      `${h.year}-${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`,
    ])
  );

describe("bcStatutoryHolidays", () => {
  it("lists all eleven BC statutory holidays for 2026", () => {
    expect(datesIn(2026)).toEqual({
      "New Year's Day": "2026-01-01",
      "Family Day": "2026-02-16",
      "Good Friday": "2026-04-03",
      "Victoria Day": "2026-05-18",
      "Canada Day": "2026-07-01",
      "B.C. Day": "2026-08-03",
      "Labour Day": "2026-09-07",
      "National Day for Truth and Reconciliation": "2026-09-30",
      Thanksgiving: "2026-10-12",
      "Remembrance Day": "2026-11-11",
      "Christmas Day": "2026-12-25",
    });
  });

  it("follows Easter for Good Friday", () => {
    expect(datesIn(2024)["Good Friday"]).toBe("2024-03-29");
    expect(datesIn(2025)["Good Friday"]).toBe("2025-04-18");
  });

  it("puts Victoria Day on May 24 when that is a Monday", () => {
    expect(datesIn(2027)["Victoria Day"]).toBe("2027-05-24");
  });

  it("moves Canada Day to July 2 when July 1 is a Sunday", () => {
    expect(datesIn(2018)["Canada Day"]).toBe("2018-07-02");
  });
});

describe("holidayOn", () => {
  it("names the holiday on a stat holiday", () => {
    expect(holidayOn(on("2026-10-12"))?.name).toBe("Thanksgiving");
  });

  it("returns null on an ordinary day", () => {
    expect(holidayOn(on("2026-10-13"))).toBeNull();
  });

  it("leaves the Monday after a weekend holiday open by default", () => {
    // New Year's Day 2022 was a Saturday
    expect(holidayOn(on("2022-01-03"))).toBeNull();
  });

  it("can close the Monday after a weekend holiday", () => {
    const options = { closeMondayAfterWeekendHoliday: true };
    // Saturday holiday, two days back
    expect(holidayOn(on("2022-01-03"), options)?.name).toBe(
      "New Year's Day (observed)"
    );
    // Sunday holiday, one day back
    expect(holidayOn(on("2023-01-02"), options)?.name).toBe(
      "New Year's Day (observed)"
    );
    // An ordinary Monday stays open
    expect(holidayOn(on("2026-10-19"), options)).toBeNull();
  });

  it("includes one-off closures", () => {
    const options = {
      extraClosures: [{ date: "2026-12-26", name: "Boxing Day" }],
    };
    expect(holidayOn(on("2026-12-26"), options)?.name).toBe("Boxing Day");
  });
});
