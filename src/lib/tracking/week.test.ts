import { describe, expect, it } from "vitest";
import {
  averageConsistency,
  buildWeekSnapshot,
  classifyWeek,
  shouldAskProgress,
  shouldSuggestTargetDown,
  weeklyConsistency,
} from "./week";
import type { CheckIn, WeekSnapshot } from "./types";

const WEEK = "2026-07-20"; // Mon

function done(
  date: string,
  opts: Partial<CheckIn> = {},
): CheckIn {
  return {
    id: `c-${date}-${opts.countsTowardTarget === false ? "r" : "t"}`,
    habitId: "h1",
    date,
    status: "done",
    countsTowardTarget: opts.countsTowardTarget ?? true,
    difficulty: opts.difficulty,
    recoveryEventId: opts.recoveryEventId,
    loggedAt: `${date}T12:00:00.000Z`,
  };
}

describe("buildWeekSnapshot", () => {
  it("stays in_progress through Sunday", () => {
    const week = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 4,
      checkIns: [done("2026-07-21"), done("2026-07-22")],
      asOf: "2026-07-26",
    });
    expect(week.status).toBe("in_progress");
    expect(week.doneCount).toBe(2);
  });

  it("marks met/missed only after Sunday", () => {
    const met = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 3,
      checkIns: [
        done("2026-07-20"),
        done("2026-07-21"),
        done("2026-07-22"),
      ],
      asOf: "2026-07-27",
    });
    expect(met.status).toBe("met");

    const missed = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 4,
      checkIns: [done("2026-07-20")],
      asOf: "2026-07-27",
    });
    expect(missed.status).toBe("missed");
  });

  it("does not count recovery-only toward doneCount", () => {
    const week = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 2,
      checkIns: [
        done("2026-07-20"),
        done("2026-07-21", {
          countsTowardTarget: false,
          recoveryEventId: "r1",
        }),
      ],
      asOf: "2026-07-27",
    });
    expect(week.doneCount).toBe(1);
    expect(week.status).toBe("missed");
  });

  it("flags at-risk when remaining days cannot meet target", () => {
    // Friday with 0 dones, target 4 → remaining Fri+Sat+Sun = 3 < 4
    const week = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 4,
      checkIns: [],
      asOf: "2026-07-24",
    });
    expect(week.status).toBe("in_progress");
    expect(week.atRiskFired).toBe(true);
  });

  it("is not at-risk when today can still finish the target", () => {
    // Thursday, 2 done, target 4 → today + Fri + Sat + Sun = 4 possible
    const week = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 4,
      checkIns: [done("2026-07-20"), done("2026-07-21")],
      asOf: "2026-07-23",
    });
    expect(week.atRiskFired).toBe(false);
  });

  it("marks full pause and partial pause", () => {
    const full = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 3,
      checkIns: [done("2026-07-20")],
      asOf: "2026-07-27",
      pauseMode: "full",
    });
    expect(full.status).toBe("paused");

    const partial = buildWeekSnapshot({
      habitId: "h1",
      weekStart: WEEK,
      target: 3,
      checkIns: [done("2026-07-20")],
      asOf: "2026-07-27",
      pauseMode: "partial",
    });
    expect(partial.status).toBe("partially_paused");
  });
});

describe("classifyWeek", () => {
  const base: WeekSnapshot = {
    habitId: "h1",
    weekStart: WEEK,
    target: 3,
    doneCount: 3,
    skippedCount: 0,
    status: "met",
    difficultyCounts: { easy: 0, manageable: 0, hard: 0 },
    atRiskFired: false,
  };

  it("missed → difficult even without ratings", () => {
    expect(
      classifyWeek({
        ...base,
        status: "missed",
        doneCount: 1,
      }),
    ).toBe("difficult");
  });

  it("met with no ratings → neutral", () => {
    expect(classifyWeek(base)).toBe("neutral");
  });

  it("met and mostly easy → easy", () => {
    expect(
      classifyWeek({
        ...base,
        difficultyCounts: { easy: 2, manageable: 1, hard: 0 },
      }),
    ).toBe("easy");
  });

  it("hard ≥ 2 and hard ≥ easy → difficult", () => {
    expect(
      classifyWeek({
        ...base,
        difficultyCounts: { easy: 1, manageable: 0, hard: 2 },
      }),
    ).toBe("difficult");
  });

  it("excludes paused weeks as neutral for triggers", () => {
    expect(classifyWeek({ ...base, status: "paused" })).toBe("neutral");
    expect(classifyWeek({ ...base, status: "partially_paused" })).toBe(
      "neutral",
    );
  });
});

describe("consistency and plan triggers", () => {
  it("computes consistency and averages excluding paused", () => {
    expect(weeklyConsistency(2, 4)).toBe(0.5);
    const avg = averageConsistency([
      {
        habitId: "h1",
        weekStart: WEEK,
        target: 4,
        doneCount: 4,
        skippedCount: 0,
        status: "met",
        difficultyCounts: { easy: 0, manageable: 0, hard: 0 },
        atRiskFired: false,
      },
      {
        habitId: "h1",
        weekStart: "2026-07-13",
        target: 4,
        doneCount: 2,
        skippedCount: 0,
        status: "missed",
        difficultyCounts: { easy: 0, manageable: 0, hard: 0 },
        atRiskFired: false,
      },
      {
        habitId: "h1",
        weekStart: "2026-07-06",
        target: 4,
        doneCount: 4,
        skippedCount: 0,
        status: "paused",
        difficultyCounts: { easy: 0, manageable: 0, hard: 0 },
        atRiskFired: false,
      },
    ]);
    expect(avg).toBeCloseTo(0.75);
  });

  it("suggests down after two consecutive difficult weeks", () => {
    expect(shouldSuggestTargetDown(["difficult", "difficult"])).toBe(true);
    expect(shouldSuggestTargetDown(["difficult", "neutral"])).toBe(false);
  });

  it("asks progress after two consecutive easy weeks", () => {
    expect(shouldAskProgress(["easy", "easy"])).toBe(true);
    expect(shouldAskProgress(["easy", "difficult"])).toBe(false);
  });
});
