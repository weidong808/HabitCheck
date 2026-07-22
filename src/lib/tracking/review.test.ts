import { describe, expect, it } from "vitest";
import {
  buildHabitReviewFacts,
  listClosedWeekStarts,
  planAdjustPairKey,
} from "./review";
import type { CheckIn, Habit, RecoveryEvent } from "./types";

function habit(partial: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Walk",
    motivation: "",
    weeklyTarget: 4,
    smallerVersion: "step outside",
    status: "active",
    pause: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    ...partial,
  };
}

function done(date: string, difficulty?: CheckIn["difficulty"]): CheckIn {
  return {
    id: `c-${date}`,
    habitId: "h1",
    date,
    status: "done",
    countsTowardTarget: true,
    difficulty,
    loggedAt: `${date}T12:00:00.000Z`,
  };
}

describe("listClosedWeekStarts", () => {
  it("lists closed weeks only", () => {
    // asOf Monday Jul 27 → week of Jul 20 is closed
    const weeks = listClosedWeekStarts("2026-07-01T00:00:00.000Z", "2026-07-27");
    expect(weeks).toContain("2026-07-20");
    expect(weeks).toContain("2026-07-13");
    expect(weeks).not.toContain("2026-07-27");
  });
});

describe("buildHabitReviewFacts plan adjust", () => {
  it("suggests down after two missed weeks", () => {
    // Weeks Jul 6 and Jul 13 missed (0 dones), asOf Jul 20 Monday after Jul 13 week
    const checkIns: CheckIn[] = [];
    const facts = buildHabitReviewFacts({
      habit: habit({ createdAt: "2026-07-06T00:00:00.000Z", weeklyTarget: 4 }),
      checkIns,
      recoveries: [] as RecoveryEvent[],
      asOf: "2026-07-20",
    });
    expect(facts.planAdjust?.kind).toBe("down");
    expect(facts.planAdjust?.proposedTarget).toBe(3);
  });

  it("respects dismissed pair key", () => {
    const facts = buildHabitReviewFacts({
      habit: habit({
        createdAt: "2026-07-06T00:00:00.000Z",
        weeklyTarget: 4,
        targetPromptDismissedKey: planAdjustPairKey([
          "2026-07-06",
          "2026-07-13",
        ]),
      }),
      checkIns: [],
      recoveries: [],
      asOf: "2026-07-20",
    });
    expect(facts.planAdjust).toBeNull();
  });

  it("suggests up after two easy met weeks", () => {
    const checkIns: CheckIn[] = [
      done("2026-07-06", "easy"),
      done("2026-07-07", "easy"),
      done("2026-07-08", "easy"),
      done("2026-07-09", "easy"),
      done("2026-07-13", "easy"),
      done("2026-07-14", "easy"),
      done("2026-07-15", "easy"),
      done("2026-07-16", "easy"),
    ];
    const facts = buildHabitReviewFacts({
      habit: habit({ createdAt: "2026-07-06T00:00:00.000Z", weeklyTarget: 4 }),
      checkIns,
      recoveries: [],
      asOf: "2026-07-20",
    });
    expect(facts.planAdjust?.kind).toBe("up");
    expect(facts.planAdjust?.proposedTarget).toBe(5);
  });
});
