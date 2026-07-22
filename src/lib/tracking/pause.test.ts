import { describe, expect, it } from "vitest";
import { deriveWeekPauseMode, shouldAutoResume } from "./pause";
import type { Habit } from "./types";

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

const WEEK = "2026-07-20";

describe("deriveWeekPauseMode", () => {
  it("returns full when paused since before the week", () => {
    expect(
      deriveWeekPauseMode({
        habit: habit({
          status: "paused",
          pause: { kind: "indefinite" },
          pauseStartedOn: "2026-07-15",
        }),
        weekStart: WEEK,
        asOf: "2026-07-22",
      }),
    ).toBe("full");
  });

  it("returns partial when pause starts mid-week", () => {
    expect(
      deriveWeekPauseMode({
        habit: habit({
          status: "paused",
          pause: { kind: "indefinite" },
          pauseStartedOn: "2026-07-22",
        }),
        weekStart: WEEK,
        asOf: "2026-07-23",
      }),
    ).toBe("partial");
  });

  it("returns partial when resumed mid-week", () => {
    expect(
      deriveWeekPauseMode({
        habit: habit({
          status: "active",
          pause: null,
          lastResumeOn: "2026-07-23",
          pauseStartedOn: "2026-07-21",
        }),
        weekStart: WEEK,
        asOf: "2026-07-24",
      }),
    ).toBe("partial");
  });
});

describe("shouldAutoResume", () => {
  it("resumes on/after until date", () => {
    const paused = habit({
      status: "paused",
      pause: { kind: "until", untilDate: "2026-07-25" },
    });
    expect(shouldAutoResume(paused, "2026-07-24")).toBe(false);
    expect(shouldAutoResume(paused, "2026-07-25")).toBe(true);
  });
});
