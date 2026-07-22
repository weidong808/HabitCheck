import { formatDateParts } from "@/lib/tracking/dates";

/** Local calendar YYYY-MM-DD for the user's timezone. */
export function localToday(now = new Date()): string {
  return formatDateParts(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
