import { addDays, dateInWeek, isWeekClosed, startOfWeekMonday } from "./dates";
import {
  averageConsistency,
  buildWeekSnapshot,
  classifyWeek,
  shouldAskProgress,
  shouldSuggestTargetDown,
  weeklyConsistency,
} from "./week";
import { deriveWeekPauseMode } from "./pause";
import { suggestedTargetDown, suggestedTargetUp } from "./targets";
import type {
  CheckIn,
  Habit,
  RecoveryEvent,
  WeekClassification,
  WeekSnapshot,
} from "./types";

export type PlanAdjustSuggestion =
  | {
      kind: "down";
      proposedTarget: number;
      weekStarts: [string, string];
      classifications: [WeekClassification, WeekClassification];
    }
  | {
      kind: "up";
      proposedTarget: number;
      weekStarts: [string, string];
      classifications: [WeekClassification, WeekClassification];
    };

export type HabitWeekFacts = {
  week: WeekSnapshot;
  classification: WeekClassification;
  consistency: number;
  recoveriesCompleted: number;
};

export type HabitReviewFacts = {
  habit: Habit;
  closedWeeks: HabitWeekFacts[];
  averageConsistency: number | null;
  planAdjust: PlanAdjustSuggestion | null;
};

/** Mondays of weeks that are closed as of `asOf`, from habit creation week onward. */
export function listClosedWeekStarts(
  habitCreatedAt: string,
  asOf: string,
): string[] {
  const createdDay = habitCreatedAt.slice(0, 10);
  let cursor = startOfWeekMonday(createdDay);
  const out: string[] = [];
  for (let i = 0; i < 110; i += 1) {
    if (!isWeekClosed(cursor, asOf)) break;
    out.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return out;
}

export function recoveriesInWeek(
  events: RecoveryEvent[],
  habitId: string,
  weekStart: string,
): number {
  return events.filter((e) => {
    if (e.habitId !== habitId || e.status !== "completed") return false;
    if (e.completedOn && dateInWeek(e.completedOn, weekStart)) return true;
    return e.triggerWeekStart === weekStart;
  }).length;
}

export function buildHabitReviewFacts(args: {
  habit: Habit;
  checkIns: CheckIn[];
  recoveries: RecoveryEvent[];
  asOf: string;
}): HabitReviewFacts {
  const { habit, checkIns, recoveries, asOf } = args;
  const weekStarts = listClosedWeekStarts(habit.createdAt, asOf);
  const closedWeeks: HabitWeekFacts[] = weekStarts.map((weekStart) => {
    const pauseMode = deriveWeekPauseMode({ habit, weekStart, asOf });
    const week = buildWeekSnapshot({
      habitId: habit.id,
      weekStart,
      target: habit.weeklyTarget,
      checkIns,
      asOf,
      pauseMode,
    });
    return {
      week,
      classification: classifyWeek(week),
      consistency: weeklyConsistency(week.doneCount, week.target),
      recoveriesCompleted: recoveriesInWeek(recoveries, habit.id, weekStart),
    };
  });

  const scored = closedWeeks.filter(
    (w) => w.week.status === "met" || w.week.status === "missed",
  );

  const planAdjust = resolvePlanAdjust(
    habit,
    scored.map((w) => w.classification),
    scored.map((w) => w.week.weekStart),
  );

  return {
    habit,
    closedWeeks,
    averageConsistency: averageConsistency(scored.map((w) => w.week)),
    planAdjust,
  };
}

function resolvePlanAdjust(
  habit: Habit,
  classifications: WeekClassification[],
  weekStarts: string[],
): PlanAdjustSuggestion | null {
  if (classifications.length < 2 || weekStarts.length < 2) return null;

  const w1 = weekStarts[weekStarts.length - 2]!;
  const w2 = weekStarts[weekStarts.length - 1]!;
  const c1 = classifications[classifications.length - 2]!;
  const c2 = classifications[classifications.length - 1]!;
  const pairKey = `${w1}|${w2}`;

  if (habit.targetPromptDismissedKey === pairKey) return null;
  if (habit.pendingWeeklyTarget != null) return null;

  if (shouldSuggestTargetDown([c1, c2])) {
    return {
      kind: "down",
      proposedTarget: suggestedTargetDown(habit.weeklyTarget),
      weekStarts: [w1, w2],
      classifications: [c1, c2],
    };
  }
  if (shouldAskProgress([c1, c2])) {
    return {
      kind: "up",
      proposedTarget: suggestedTargetUp(habit.weeklyTarget),
      weekStarts: [w1, w2],
      classifications: [c1, c2],
    };
  }
  return null;
}

export function planAdjustPairKey(weekStarts: [string, string]): string {
  return `${weekStarts[0]}|${weekStarts[1]}`;
}
