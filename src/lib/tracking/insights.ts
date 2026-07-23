// Pure monthly-insight aggregation over local check-ins. No storage/AI imports
// so it is fully unit-testable. Produces privacy-preserving aggregates only —
// never raw check-in rows — suitable for sending to the coach.

import { addDays, startOfWeekMonday, weekdayMonday0 } from "./dates";
import type { CheckIn, Difficulty, Habit } from "./types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type HabitInsight = {
  name: string;
  weeklyTarget: number;
  /** Closed weeks in the window that met the weekly target. */
  weeksMetTarget: number;
  weeksConsidered: number;
  totalDone: number;
  avgDonePerWeek: number;
  bestWeekday: string | null;
  difficultyCounts: Record<Difficulty, number>;
  trend: "improving" | "steady" | "slipping";
};

export type MonthlyInsights = {
  weeks: number;
  windowStart: string;
  perHabit: HabitInsight[];
  overall: {
    totalDone: number;
    activeHabits: number;
    bestWeekday: string | null;
  };
};

function emptyDifficulty(): Record<Difficulty, number> {
  return { easy: 0, manageable: 0, hard: 0 };
}

function bestWeekdayFrom(counts: number[]): string | null {
  let best = -1;
  let bestIdx = -1;
  counts.forEach((c, i) => {
    if (c > best) {
      best = c;
      bestIdx = i;
    }
  });
  return best > 0 && bestIdx >= 0 ? WEEKDAY_LABELS[bestIdx] : null;
}

/**
 * Aggregate the last `weeks` full weeks (default 4) ending at the week that
 * contains `asOf`. Only counts check-ins that count toward target.
 */
export function computeMonthlyInsights(input: {
  habits: Habit[];
  checkIns: CheckIn[];
  asOf: string;
  weeks?: number;
}): MonthlyInsights {
  const weeks = Math.max(1, input.weeks ?? 4);
  const thisWeekStart = startOfWeekMonday(input.asOf);
  const windowStart = addDays(thisWeekStart, -7 * (weeks - 1));
  const windowEnd = addDays(thisWeekStart, 6); // Sunday of current week

  const activeHabits = input.habits.filter((h) => h.status !== "archived");
  const overallWeekday = new Array(7).fill(0);
  let overallDone = 0;

  const perHabit: HabitInsight[] = activeHabits.map((habit) => {
    const rows = input.checkIns.filter(
      (c) =>
        c.habitId === habit.id &&
        c.status === "done" &&
        c.countsTowardTarget &&
        c.date >= windowStart &&
        c.date <= windowEnd,
    );

    const weekdayCounts = new Array(7).fill(0);
    const difficultyCounts = emptyDifficulty();
    const perWeekDone = new Array(weeks).fill(0);

    for (const row of rows) {
      const wd = weekdayMonday0(row.date);
      weekdayCounts[wd] += 1;
      overallWeekday[wd] += 1;
      if (row.difficulty) difficultyCounts[row.difficulty] += 1;
      const weekIndex = Math.floor(daysBetween(windowStart, row.date) / 7);
      if (weekIndex >= 0 && weekIndex < weeks) perWeekDone[weekIndex] += 1;
    }

    const totalDone = rows.length;
    overallDone += totalDone;
    const weeksMetTarget = perWeekDone.filter(
      (d) => d >= habit.weeklyTarget,
    ).length;

    return {
      name: habit.name,
      weeklyTarget: habit.weeklyTarget,
      weeksMetTarget,
      weeksConsidered: weeks,
      totalDone,
      avgDonePerWeek: round1(totalDone / weeks),
      bestWeekday: bestWeekdayFrom(weekdayCounts),
      difficultyCounts,
      trend: trendOf(perWeekDone),
    };
  });

  return {
    weeks,
    windowStart,
    perHabit,
    overall: {
      totalDone: overallDone,
      activeHabits: activeHabits.length,
      bestWeekday: bestWeekdayFrom(overallWeekday),
    },
  };
}

function daysBetween(from: string, to: string): number {
  // Both are YYYY-MM-DD local dates; compute whole-day difference.
  const a = Date.UTC(
    Number(from.slice(0, 4)),
    Number(from.slice(5, 7)) - 1,
    Number(from.slice(8, 10)),
  );
  const b = Date.UTC(
    Number(to.slice(0, 4)),
    Number(to.slice(5, 7)) - 1,
    Number(to.slice(8, 10)),
  );
  return Math.round((b - a) / 86_400_000);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Compare average done-rate of the earlier half vs the later half. */
function trendOf(perWeekDone: number[]): "improving" | "steady" | "slipping" {
  const n = perWeekDone.length;
  if (n < 2) return "steady";
  const mid = Math.floor(n / 2);
  const first = perWeekDone.slice(0, mid);
  const second = perWeekDone.slice(mid);
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
  const delta = avg(second) - avg(first);
  if (delta >= 0.75) return "improving";
  if (delta <= -0.75) return "slipping";
  return "steady";
}
