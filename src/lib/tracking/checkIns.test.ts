import { describe, expect, it } from "vitest";
import { upsertCheckIn, hasTargetCountingDone } from "./checkIns";
import type { CheckIn } from "./types";

function checkIn(partial: Partial<CheckIn> & Pick<CheckIn, "id" | "date">): CheckIn {
  return {
    habitId: "h1",
    status: "done",
    countsTowardTarget: true,
    loggedAt: "2026-07-20T12:00:00.000Z",
    ...partial,
  };
}

describe("upsertCheckIn", () => {
  it("allows only one target-counting done per habit/day", () => {
    const first = checkIn({ id: "a", date: "2026-07-21", difficulty: "easy" });
    const second = checkIn({
      id: "b",
      date: "2026-07-21",
      difficulty: "hard",
    });
    const result = upsertCheckIn(upsertCheckIn([], first), second);
    const targets = result.filter((c) => c.countsTowardTarget);
    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe("b");
    expect(targets[0].difficulty).toBe("hard");
  });

  it("lets recovery-only coexist with full completion same day", () => {
    const full = checkIn({ id: "full", date: "2026-07-21" });
    const mini = checkIn({
      id: "mini",
      date: "2026-07-21",
      countsTowardTarget: false,
      recoveryEventId: "r1",
    });
    const result = upsertCheckIn(upsertCheckIn([], full), mini);
    expect(result).toHaveLength(2);
    expect(hasTargetCountingDone(result, "h1", "2026-07-21")).toBe(true);
    expect(result.some((c) => !c.countsTowardTarget)).toBe(true);
  });

  it("replacing target-counting keeps recovery-only", () => {
    const full = checkIn({ id: "full", date: "2026-07-21" });
    const mini = checkIn({
      id: "mini",
      date: "2026-07-21",
      countsTowardTarget: false,
      recoveryEventId: "r1",
    });
    const edited = checkIn({
      id: "full2",
      date: "2026-07-21",
      difficulty: "manageable",
    });
    const result = upsertCheckIn(upsertCheckIn(upsertCheckIn([], full), mini), edited);
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.countsTowardTarget)?.id).toBe("full2");
    expect(result.find((c) => !c.countsTowardTarget)?.id).toBe("mini");
  });
});
