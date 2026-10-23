// BC statutory holidays, worked out from their rules so nothing needs updating
// each year. Dates are plain { year, month, day } in the pharmacy's local
// calendar (month is 1-12), so time zones never come into it.

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface Holiday extends CalendarDate {
  name: string;
}

// Day of the week, 0 = Sunday
function weekday({ year, month, day }: CalendarDate) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addDays({ year, month, day }: CalendarDate, days: number): CalendarDate {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

// The nth Monday of a month, e.g. the 3rd Monday of February
function nthMonday(year: number, month: number, n: number): CalendarDate {
  const first = { year, month, day: 1 };
  const toMonday = (8 - weekday(first)) % 7;
  return addDays(first, toMonday + (n - 1) * 7);
}

// Easter Sunday, by the anonymous Gregorian algorithm
function easterSunday(year: number): CalendarDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

// The Monday before May 25
function victoriaDay(year: number): CalendarDate {
  const may24 = { year, month: 5, day: 24 };
  return addDays(may24, -((weekday(may24) + 6) % 7));
}

// Canada Day moves to July 2 when July 1 is a Sunday
function canadaDay(year: number): CalendarDate {
  const july1 = { year, month: 7, day: 1 };
  return weekday(july1) === 0 ? { year, month: 7, day: 2 } : july1;
}

export function bcStatutoryHolidays(year: number): Holiday[] {
  return [
    { name: "New Year's Day", year, month: 1, day: 1 },
    { name: "Family Day", ...nthMonday(year, 2, 3) },
    { name: "Good Friday", ...addDays(easterSunday(year), -2) },
    { name: "Victoria Day", ...victoriaDay(year) },
    { name: "Canada Day", ...canadaDay(year) },
    { name: "B.C. Day", ...nthMonday(year, 8, 1) },
    { name: "Labour Day", ...nthMonday(year, 9, 1) },
    {
      name: "National Day for Truth and Reconciliation",
      year,
      month: 9,
      day: 30,
    },
    { name: "Thanksgiving", ...nthMonday(year, 10, 2) },
    { name: "Remembrance Day", year, month: 11, day: 11 },
    { name: "Christmas Day", year, month: 12, day: 25 },
  ];
}

const sameDay = (a: CalendarDate, b: CalendarDate) =>
  a.year === b.year && a.month === b.month && a.day === b.day;

export interface HolidayOptions {
  // Also close the Monday after a holiday that falls on a weekend
  closeMondayAfterWeekendHoliday?: boolean;
  // One-off closures as "YYYY-MM-DD", e.g. Boxing Day if the pharmacy takes it
  extraClosures?: { date: string; name: string }[];
}

// The holiday the pharmacy is closed for on this date, if any
export function holidayOn(
  date: CalendarDate,
  options: HolidayOptions = {}
): Holiday | null {
  const holidays = bcStatutoryHolidays(date.year);

  const holiday = holidays.find((h) => sameDay(h, date));
  if (holiday) return holiday;

  if (options.closeMondayAfterWeekendHoliday && weekday(date) === 1) {
    // A Sunday holiday is one day back, a Saturday one is two
    for (const back of [1, 2]) {
      const earlier = addDays(date, -back);
      const weekend = bcStatutoryHolidays(earlier.year).find((h) =>
        sameDay(h, earlier)
      );
      if (weekend) return { ...date, name: `${weekend.name} (observed)` };
    }
  }

  const iso = [
    date.year,
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("-");
  const extra = options.extraClosures?.find((c) => c.date === iso);
  return extra ? { ...date, name: extra.name } : null;
}
