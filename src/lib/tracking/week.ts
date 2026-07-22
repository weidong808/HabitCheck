import {
  dateInWeek,
  daysAfterThroughSunday,
  endOfWeekSunday,
  isWeekClosed,
  startOfWeekMonday,
} from "./dates";
import { hasTargetCountingDone } from "./checkIns";
import type {
  CheckIn,
  Difficulty,
  WeekClassification,
  WeekPauseMode,
  WeekSnapshot,
  WeekStatus,
} from "./types";

export type BuildWeekInput = {
  habitId: string;
  weekStart: string;
  target: number;
  checkIns: CheckIn[];
  /** Local "today" for open-week evaluation and at-risk. */
  asOf: string;
  pauseMode?: WeekPauseMode;
};

function emptyDifficulty(): WeekSnapshot["difficultyCounts"] {
  return { easy: 0, manageable: 0, hard: 0 };
}

function tallyDifficulty(checkIns: CheckIn[]): WeekSnapshot["difficultyCounts"] {
  const counts = emptyDifficulty();
  for (const c of checkIns) {
    if (c.status !== "done" || !c.difficulty) continue;
    counts[c.difficulty] += 1;
  }
  return counts;
}

function habitCheckInsInWeek(
  checkIns: CheckIn[],
  habitId: string,
  weekStart: string,
): CheckIn[] {
  return checkIns.filter(
    (c) => c.habitId === habitId && dateInWeek(c.date, weekStart),
  );
}

export function countDoneTowardTarget(checkIns: CheckIn[]): number {
  return checkIns.filter(
    (c) => c.status === "done" && c.countsTowardTarget,
  ).length;
}

export function countSkipped(checkIns: CheckIn[]): number {
  return checkIns.filter((c) => c.status === "skipped").length;
}

export function resolveWeekStatus(args: {
  pauseMode: WeekPauseMode;
  closed: boolean;
  doneCount: number;
  target: number;
}): WeekStatus {
  const { pauseMode, closed, doneCount, target } = args;
  if (pauseMode === "full") return "paused";
  if (pauseMode === "partial") return "partially_paused";
  if (!closed) return "in_progress";
  return doneCount >= target ? "met" : "missed";
}

/**
 * Mid-week at-risk: remaining possible target-counting days cannot reach target.
 * Assumes ≤1 target-counting done per habit per local day.
 */
export function isAtRisk(args: {
  status: WeekStatus;
  doneCount: number;
  target: number;
  weekStart: string;
  asOf: string;
  habitId: string;
  checkIns: CheckIn[];
}): boolean {
  const { status, doneCount, target, weekStart, asOf, habitId, checkIns } =
    args;
  if (status !== "in_progress") return false;
  if (!dateInWeek(asOf, weekStart)) return false;

  const todayUnset = !hasTargetCountingDone(checkIns, habitId, asOf);
  const after = daysAfterThroughSunday(asOf, weekStart);
  const possible = doneCount + (todayUnset ? 1 : 0) + after;
  return possible < target;
}

export function weeklyConsistency(
  doneCount: number,
  target: number,
): number {
  if (target <= 0) return 0;
  return doneCount / target;
}

/** Mean consistency for closed weeks that are neither paused nor partially_paused. */
export function averageConsistency(weeks: WeekSnapshot[]): number | null {
  const eligible = weeks.filter(
    (w) => w.status === "met" || w.status === "missed",
  );
  if (eligible.length === 0) return null;
  const sum = eligible.reduce(
    (acc, w) => acc + Math.min(1, weeklyConsistency(w.doneCount, w.target)),
    0,
  );
  return sum / eligible.length;
}

export function classifyWeek(week: WeekSnapshot): WeekClassification {
  if (week.status === "paused" || week.status === "partially_paused") {
    return "neutral";
  }
  if (week.status === "in_progress") {
    return "neutral";
  }

  const { easy, manageable, hard } = week.difficultyCounts;
  const ratedCount = easy + manageable + hard;

  if (week.status === "missed") return "difficult";
  if (ratedCount === 0) return "neutral";
  if (week.status === "met" && easy >= manageable + hard) return "easy";
  if (hard >= 2 && hard >= easy) return "difficult";
  return "neutral";
}

export function buildWeekSnapshot(input: BuildWeekInput): WeekSnapshot {
  const weekStart = startOfWeekMonday(input.weekStart);
  const pauseMode = input.pauseMode ?? "none";
  const inWeek = habitCheckInsInWeek(
    input.checkIns,
    input.habitId,
    weekStart,
  );
  const doneCount = countDoneTowardTarget(inWeek);
  const skippedCount = countSkipped(inWeek);
  const closed = isWeekClosed(weekStart, input.asOf);
  const status = resolveWeekStatus({
    pauseMode,
    closed,
    doneCount,
    target: input.target,
  });
  const difficultyCounts = tallyDifficulty(
    inWeek.filter((c) => c.status === "done"),
  );

  const atRiskFired = isAtRisk({
    status,
    doneCount,
    target: input.target,
    weekStart,
    asOf: input.asOf,
    habitId: input.habitId,
    checkIns: input.checkIns,
  });

  return {
    habitId: input.habitId,
    weekStart,
    target: input.target,
    doneCount,
    skippedCount,
    status,
    difficultyCounts,
    atRiskFired,
  };
}

export function shouldSuggestTargetDown(
  recentClosed: WeekClassification[],
): boolean {
  if (recentClosed.length < 2) return false;
  const a = recentClosed[recentClosed.length - 2];
  const b = recentClosed[recentClosed.length - 1];
  return a === "difficult" && b === "difficult";
}

export function shouldAskProgress(
  recentClosed: WeekClassification[],
): boolean {
  if (recentClosed.length < 2) return false;
  const a = recentClosed[recentClosed.length - 2];
  const b = recentClosed[recentClosed.length - 1];
  return a === "easy" && b === "easy";
}

export function weekSunday(weekStart: string): string {
  return endOfWeekSunday(weekStart);
}

export type { Difficulty };
