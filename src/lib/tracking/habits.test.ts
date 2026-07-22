import { describe, expect, it } from "vitest";
import {
  applyPendingTargetIfDue,
  canCreateHabit,
  queueWeeklyTarget,
  snapshotTargetForWeek,
} from "./habits";
import type { Habit } from "./types";

function habit(partial: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Walk",
    motivation: "health",
    weeklyTarget: 4,
    smallerVersion: "5-minute walk",
    status: "active",
    pause: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    ...partial,
  };
}

describe("habits", () => {
  it("enforces active+paused cap of 3", () => {
    const habits = [
      habit({ id: "1", status: "active" }),
      habit({ id: "2", status: "paused" }),
      habit({ id: "3", status: "active" }),
      habit({ id: "4", status: "archived" }),
    ];
    expect(canCreateHabit(habits)).toBe(false);
    expect(canCreateHabit(habits.slice(0, 2))).toBe(true);
  });

  it("queues target for next Monday without changing snapshot", () => {
    const h = queueWeeklyTarget(habit({ weeklyTarget: 4 }), 3);
    expect(h.weeklyTarget).toBe(4);
    expect(h.pendingWeeklyTarget).toBe(3);
    expect(snapshotTargetForWeek(h)).toBe(4);
  });

  it("applies pending target only on Monday", () => {
    const pending = habit({ weeklyTarget: 4, pendingWeeklyTarget: 2 });
    expect(applyPendingTargetIfDue(pending, "2026-07-22").weeklyTarget).toBe(4);
    const applied = applyPendingTargetIfDue(pending, "2026-07-27"); // Monday
    expect(applied.weeklyTarget).toBe(2);
    expect(applied.pendingWeeklyTarget).toBeUndefined();
  });
});
