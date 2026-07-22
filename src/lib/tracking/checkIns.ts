import type { CheckIn } from "./types";

/**
 * Upsert check-in with same-day rules:
 * - At most one target-counting completion per habit per local date.
 * - Editing replaces that day's target-counting state.
 * - A recovery-only action may coexist with a target-counting done.
 */
export function upsertCheckIn(
  existing: CheckIn[],
  next: CheckIn,
): CheckIn[] {
  const sameDay = existing.filter(
    (c) => c.habitId === next.habitId && c.date === next.date,
  );
  const others = existing.filter(
    (c) => !(c.habitId === next.habitId && c.date === next.date),
  );

  if (next.countsTowardTarget) {
    const recoveryOnly = sameDay.filter((c) => !c.countsTowardTarget);
    return [...others, ...recoveryOnly, next];
  }

  const targetCounting = sameDay.filter((c) => c.countsTowardTarget);
  const otherRecovery = sameDay.filter(
    (c) => !c.countsTowardTarget && c.id !== next.id,
  );
  return [...others, ...targetCounting, ...otherRecovery, next];
}

export function targetCountingDoneOnDate(
  checkIns: CheckIn[],
  habitId: string,
  date: string,
): CheckIn | undefined {
  return checkIns.find(
    (c) =>
      c.habitId === habitId &&
      c.date === date &&
      c.status === "done" &&
      c.countsTowardTarget,
  );
}

export function hasTargetCountingDone(
  checkIns: CheckIn[],
  habitId: string,
  date: string,
): boolean {
  return targetCountingDoneOnDate(checkIns, habitId, date) != null;
}
