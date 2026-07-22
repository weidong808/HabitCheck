/**
 * Calendar-date helpers using YYYY-MM-DD only (no Date timezone surprises).
 * Weeks are Monday–Sunday per MVP v5.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function assertDateString(value: string): void {
  if (!DATE_RE.test(value)) {
    throw new Error(`Invalid date string: ${value}`);
  }
}

export function parseDateParts(value: string): {
  y: number;
  m: number;
  d: number;
} {
  assertDateString(value);
  const [, ys, ms, ds] = value.match(DATE_RE)!;
  return { y: Number(ys), m: Number(ms), d: Number(ds) };
}

export function formatDateParts(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Civil day arithmetic via UTC noon to avoid DST edge cases. */
export function addDays(date: string, delta: number): string {
  const { y, m, d } = parseDateParts(date);
  const utc = Date.UTC(y, m - 1, d + delta, 12, 0, 0);
  const dt = new Date(utc);
  return formatDateParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function compareDates(a: string, b: string): number {
  assertDateString(a);
  assertDateString(b);
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isBefore(a: string, b: string): boolean {
  return compareDates(a, b) < 0;
}

export function isAfter(a: string, b: string): boolean {
  return compareDates(a, b) > 0;
}

export function isOnOrBefore(a: string, b: string): boolean {
  return compareDates(a, b) <= 0;
}

export function isOnOrAfter(a: string, b: string): boolean {
  return compareDates(a, b) >= 0;
}

/** 0 = Monday … 6 = Sunday (ISO-style for our Mon–Sun weeks). */
export function weekdayMonday0(date: string): number {
  const { y, m, d } = parseDateParts(date);
  const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
  const js = new Date(utc).getUTCDay(); // 0=Sun … 6=Sat
  return js === 0 ? 6 : js - 1;
}

export function startOfWeekMonday(date: string): string {
  const offset = weekdayMonday0(date);
  return addDays(date, -offset);
}

export function endOfWeekSunday(weekStart: string): string {
  assertMonday(weekStart);
  return addDays(weekStart, 6);
}

export function assertMonday(weekStart: string): void {
  if (weekdayMonday0(weekStart) !== 0) {
    throw new Error(`weekStart must be a Monday: ${weekStart}`);
  }
}

/** Week is closed when asOf is strictly after that week's Sunday. */
export function isWeekClosed(weekStart: string, asOf: string): boolean {
  const sunday = endOfWeekSunday(weekStart);
  return isAfter(asOf, sunday);
}

export function eachDayOfWeek(weekStart: string): string[] {
  assertMonday(weekStart);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** Days strictly after `today` through Sunday inclusive. */
export function daysAfterThroughSunday(today: string, weekStart: string): number {
  assertMonday(weekStart);
  const sunday = endOfWeekSunday(weekStart);
  if (isAfter(today, sunday)) return 0;
  if (isOnOrAfter(today, sunday)) return 0;
  let count = 0;
  let cursor = addDays(today, 1);
  while (isOnOrBefore(cursor, sunday)) {
    count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}

export function dateInWeek(date: string, weekStart: string): boolean {
  const sunday = endOfWeekSunday(weekStart);
  return isOnOrAfter(date, weekStart) && isOnOrBefore(date, sunday);
}
