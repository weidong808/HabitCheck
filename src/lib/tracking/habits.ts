import { clampWeeklyTarget } from "./targets";
import { weekdayMonday0 } from "./dates";
import type { Habit } from "./types";

export {
  clampWeeklyTarget,
  suggestedTargetDown,
  suggestedTargetUp,
} from "./targets";

export const MAX_ACTIVE_OR_PAUSED = 3;

export function countActiveOrPaused(habits: Habit[]): number {
  return habits.filter((h) => h.status === "active" || h.status === "paused")
    .length;
}

export function canCreateHabit(habits: Habit[]): boolean {
  return countActiveOrPaused(habits) < MAX_ACTIVE_OR_PAUSED;
}

/**
 * On each local Monday, apply pendingWeeklyTarget → weeklyTarget.
 */
export function applyPendingTargetIfDue(habit: Habit, asOf: string): Habit {
  if (habit.pendingWeeklyTarget == null) return habit;
  if (weekdayMonday0(asOf) !== 0) return habit;
  return {
    ...habit,
    weeklyTarget: clampWeeklyTarget(habit.pendingWeeklyTarget),
    pendingWeeklyTarget: undefined,
  };
}

/** Queue a target change for next Monday (never mutates current week target). */
export function queueWeeklyTarget(habit: Habit, nextTarget: number): Habit {
  return {
    ...habit,
    pendingWeeklyTarget: clampWeeklyTarget(nextTarget),
  };
}

/** Snapshot target for a week: pending does not affect the open week. */
export function snapshotTargetForWeek(habit: Habit): number {
  return clampWeeklyTarget(habit.weeklyTarget);
}
