// Wall-clock times at the pharmacy. Announcement windows are entered as
// "Feb 16, 9:00 am" meaning Squamish time, whatever time zone the computer
// doing the typing is set to, and are stored as UTC. Daylight saving is
// worked out by Intl, so nothing here needs updating when the rules change.

export const PHARMACY_TIME_ZONE = "America/Vancouver";

const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: PHARMACY_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

// How far the pharmacy's clock is from UTC at an instant, in ms (negative)
function offsetAt(utcMs: number): number {
  const parts = offsetFormat.formatToParts(new Date(utcMs));
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wall - Math.floor(utcMs / 1000) * 1000;
}

/**
 * A `datetime-local` value ("2026-02-16T09:00"), read as pharmacy time, as a
 * UTC ISO string. Null when the value isn't a real date and time
 */
export function pharmacyLocalToIso(local: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // Date.UTC rolls Feb 30 into March, so a rollover means it wasn't real
  if (new Date(wall).toISOString().slice(0, 16) !== local) return null;

  // The offset depends on the instant, which depends on the offset. Twice
  // settles it, including across a daylight saving change
  let utc = wall - offsetAt(wall);
  utc = wall - offsetAt(utc);
  return new Date(utc).toISOString();
}

/** A UTC ISO string as a `datetime-local` value in pharmacy time */
export function isoToPharmacyLocal(iso: string): string {
  const ms = Date.parse(iso);
  return new Date(ms + offsetAt(ms)).toISOString().slice(0, 16);
}

/** e.g. "February 16, 2026" */
export function formatPharmacyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: PHARMACY_TIME_ZONE,
    dateStyle: "long",
  });
}

/** e.g. "Feb 16, 2026, 9:00 a.m." */
export function formatPharmacyDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: PHARMACY_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}
