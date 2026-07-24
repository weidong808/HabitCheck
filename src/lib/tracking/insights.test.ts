import { describe, expect, it } from "vitest";
import { computeMonthlyInsights } from "./insights";
import type { CheckIn, Habit } from "./types";

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Run",
    motivation: "",
    weeklyTarget: 3,
    smallerVersion: "",
    status: "active",
    pause: null,
    createdAt: "2026-01-01",
    ...overrides,
  };
}

let seq = 0;
function done(
  habitId: string,
  date: string,
  difficulty?: CheckIn["difficulty"],
): CheckIn {
  seq += 1;
  return {
    id: `c${seq}`,
    habitId,
    date,
    status: "done",
    difficulty,
    countsTowardTarget: true,
    loggedAt: `${date}T12:00:00`,
  };
}

describe("computeMonthlyInsights", () => {
  // asOf in the week of Mon 2026-01-26; 4-week window starts Mon 2026-01-05.
  const asOf = "2026-01-28";

  it("counts done check-ins within the window and computes averages", () => {
    const checkIns = [
      done("h1", "2026-01-06"),
      done("h1", "2026-01-07"),
      done("h1", "2026-01-13"),
      done("h1", "2026-01-20"),
    ];
    const result = computeMonthlyInsights({
      habits: [habit()],
      checkIns,
      asOf,
    });
    expect(result.weeks).toBe(4);
    const h = result.perHabit[0];
    expect(h.totalDone).toBe(4);
    expect(h.avgDonePerWeek).toBe(1);
    expect(result.overall.totalDone).toBe(4);
  });

  it("excludes check-ins outside the window and non-counting rows", () => {
    const checkIns = [
      done("h1", "2025-12-15"), // before window
      { ...done("h1", "2026-01-06"), countsTowardTarget: false },
      { ...done("h1", "2026-01-07"), status: "skipped" as const },
      done("h1", "2026-01-08"),
    ];
    const result = computeMonthlyInsights({
      habits: [habit()],
      checkIns,
      asOf,
    });
    expect(result.perHabit[0].totalDone).toBe(1);
  });

  it("counts weeks that met the target", () => {
    const checkIns = [
      // week of 01-05: 3 done -> meets target 3
      done("h1", "2026-01-05"),
      done("h1", "2026-01-06"),
      done("h1", "2026-01-07"),
      // week of 01-12: 2 done -> misses
      done("h1", "2026-01-12"),
      done("h1", "2026-01-13"),
    ];
    const result = computeMonthlyInsights({
      habits: [habit({ weeklyTarget: 3 })],
      checkIns,
      asOf,
    });
    expect(result.perHabit[0].weeksMetTarget).toBe(1);
  });

  it("detects an improving trend", () => {
    const checkIns = [
      // earlier weeks light, later weeks heavy
      done("h1", "2026-01-19"),
      done("h1", "2026-01-20"),
      done("h1", "2026-01-21"),
      done("h1", "2026-01-26"),
      done("h1", "2026-01-27"),
      done("h1", "2026-01-28"),
    ];
    const result = computeMonthlyInsights({
      habits: [habit()],
      checkIns,
      asOf,
    });
    expect(result.perHabit[0].trend).toBe("improving");
  });

  it("reports the best weekday and difficulty mix", () => {
    const checkIns = [
      done("h1", "2026-01-05", "hard"), // Monday
      done("h1", "2026-01-12", "manageable"), // Monday
      done("h1", "2026-01-13", "easy"), // Tuesday
    ];
    const result = computeMonthlyInsights({
      habits: [habit()],
      checkIns,
      asOf,
    });
    const h = result.perHabit[0];
    expect(h.bestWeekday).toBe("Mon");
    expect(h.difficultyCounts).toEqual({ easy: 1, manageable: 1, hard: 1 });
  });

  it("ignores archived habits", () => {
    const result = computeMonthlyInsights({
      habits: [habit({ status: "archived" })],
      checkIns: [done("h1", "2026-01-06")],
      asOf,
    });
    expect(result.perHabit).toHaveLength(0);
    expect(result.overall.activeHabits).toBe(0);
  });
});
