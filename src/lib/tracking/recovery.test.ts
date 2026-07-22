import { describe, expect, it } from "vitest";
import {
  countSuccessfulRecoveries,
  markRecoveryCompleted,
  recoverySatisfiedByCheckIns,
} from "./recovery";
import type { CheckIn, RecoveryEvent } from "./types";

function recovery(
  partial: Partial<RecoveryEvent> & Pick<RecoveryEvent, "id" | "kind">,
): RecoveryEvent {
  return {
    habitId: "h1",
    triggerWeekStart: "2026-07-20",
    status: "selected",
    createdAt: "2026-07-27T12:00:00.000Z",
    ...partial,
  };
}

describe("recovery", () => {
  it("counts only completed recoveries", () => {
    const events = [
      recovery({ id: "1", kind: "smaller_version", status: "completed" }),
      recovery({ id: "2", kind: "ai_comeback", status: "dismissed" }),
      recovery({ id: "3", kind: "restart_next", status: "expired" }),
    ];
    expect(countSuccessfulRecoveries(events)).toBe(1);
  });

  it("satisfies smaller_version via recovery-only check-in", () => {
    const event = recovery({ id: "r1", kind: "smaller_version" });
    const checkIns: CheckIn[] = [
      {
        id: "c1",
        habitId: "h1",
        date: "2026-07-27",
        status: "done",
        countsTowardTarget: false,
        recoveryEventId: "r1",
        loggedAt: "2026-07-27T12:00:00.000Z",
      },
    ];
    expect(recoverySatisfiedByCheckIns(event, checkIns)).toBe(true);
  });

  it("satisfies restart_next on scheduled date with full completion", () => {
    const event = recovery({
      id: "r2",
      kind: "restart_next",
      scheduledFor: "2026-07-29",
    });
    const early: CheckIn[] = [
      {
        id: "c-early",
        habitId: "h1",
        date: "2026-07-28",
        status: "done",
        countsTowardTarget: true,
        loggedAt: "2026-07-28T12:00:00.000Z",
      },
    ];
    expect(recoverySatisfiedByCheckIns(event, early)).toBe(false);

    const onTime: CheckIn[] = [
      {
        id: "c-on",
        habitId: "h1",
        date: "2026-07-29",
        status: "done",
        countsTowardTarget: true,
        loggedAt: "2026-07-29T12:00:00.000Z",
      },
    ];
    expect(recoverySatisfiedByCheckIns(event, onTime)).toBe(true);
  });

  it("marks completed with linked check-in", () => {
    const event = recovery({ id: "r3", kind: "smaller_version" });
    const done = markRecoveryCompleted(event, "2026-07-27", "c9");
    expect(done.status).toBe("completed");
    expect(done.completedOn).toBe("2026-07-27");
    expect(done.linkedCheckInId).toBe("c9");
  });
});
