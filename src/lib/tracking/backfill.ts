import { addDays } from "@/lib/tracking/dates";

/** Inclusive window of the last `days` local dates ending at `asOf` (default 7). */
export function backfillDateWindow(asOf: string, days = 7): string[] {
  const n = Math.max(1, Math.floor(days));
  return Array.from({ length: n }, (_, i) => addDays(asOf, -(n - 1 - i)));
}
