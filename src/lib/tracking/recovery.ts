import type { CheckIn, RecoveryEvent } from "./types";

export function countSuccessfulRecoveries(events: RecoveryEvent[]): number {
  return events.filter((e) => e.status === "completed").length;
}

/**
 * Whether a selected recovery path is satisfied by current check-ins.
 * Used by UI/storage layers when marking completed.
 */
export function recoverySatisfiedByCheckIns(
  event: RecoveryEvent,
  checkIns: CheckIn[],
): boolean {
  if (event.status === "dismissed" || event.status === "expired") {
    return false;
  }

  switch (event.kind) {
    case "smaller_version":
    case "ai_comeback": {
      const linked = event.linkedCheckInId
        ? checkIns.find((c) => c.id === event.linkedCheckInId)
        : undefined;
      if (linked) {
        return (
          linked.status === "done" &&
          !linked.countsTowardTarget &&
          linked.recoveryEventId === event.id
        );
      }
      return checkIns.some(
        (c) =>
          c.habitId === event.habitId &&
          c.status === "done" &&
          !c.countsTowardTarget &&
          c.recoveryEventId === event.id,
      );
    }
    case "reschedule_in_week":
    case "restart_next": {
      if (!event.scheduledFor) return false;
      const linked = event.linkedCheckInId
        ? checkIns.find((c) => c.id === event.linkedCheckInId)
        : checkIns.find(
            (c) =>
              c.habitId === event.habitId &&
              c.date === event.scheduledFor &&
              c.status === "done" &&
              c.countsTowardTarget,
          );
      return (
        linked != null &&
        linked.status === "done" &&
        linked.countsTowardTarget &&
        linked.date === event.scheduledFor
      );
    }
    default:
      return false;
  }
}

export function markRecoveryCompleted(
  event: RecoveryEvent,
  completedOn: string,
  linkedCheckInId?: string,
): RecoveryEvent {
  return {
    ...event,
    status: "completed",
    completedOn,
    linkedCheckInId: linkedCheckInId ?? event.linkedCheckInId,
  };
}

export function markRecoveryDismissed(event: RecoveryEvent): RecoveryEvent {
  return { ...event, status: "dismissed" };
}

export function markRecoveryExpired(event: RecoveryEvent): RecoveryEvent {
  return { ...event, status: "expired" };
}
