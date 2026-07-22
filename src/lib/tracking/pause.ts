import {
  dateInWeek,
  isOnOrBefore,
  startOfWeekMonday,
} from "./dates";
import type { Habit, WeekPauseMode } from "./types";

/**
 * Derive how a pause intersects a Mon–Sun week.
 * - full: paused since on/before Monday and still paused
 * - partial: pause started or resumed mid-week
 * - none: no pause intersection
 */
export function deriveWeekPauseMode(args: {
  habit: Habit;
  weekStart: string;
  asOf: string;
}): WeekPauseMode {
  const weekStart = startOfWeekMonday(args.weekStart);
  const { habit, asOf } = args;

  if (habit.lastResumeOn && dateInWeek(habit.lastResumeOn, weekStart)) {
    return "partial";
  }

  if (habit.status === "paused" && habit.pause) {
    const started = habit.pauseStartedOn ?? asOf;
    if (isOnOrBefore(started, weekStart)) return "full";
    if (dateInWeek(started, weekStart)) return "partial";
  }

  if (
    habit.pauseStartedOn &&
    dateInWeek(habit.pauseStartedOn, weekStart) &&
    habit.status === "active"
  ) {
    return "partial";
  }

  return "none";
}

/** True when a dated pause should end on asOf (resume day). */
export function shouldAutoResume(habit: Habit, asOf: string): boolean {
  if (habit.status !== "paused" || !habit.pause) return false;
  if (habit.pause.kind !== "until") return false;
  return isOnOrBefore(habit.pause.untilDate, asOf);
}
