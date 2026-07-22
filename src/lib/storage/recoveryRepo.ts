import { getDb } from "@/lib/storage/db";
import { newId } from "@/lib/storage/ids";
import {
  markRecoveryCompleted,
  markRecoveryDismissed,
  recoverySatisfiedByCheckIns,
} from "@/lib/tracking";
import type { RecoveryEvent, RecoveryKind } from "@/lib/tracking/types";
import { logCheckIn } from "@/lib/storage/checkInsRepo";

export async function listRecoveryEvents(): Promise<RecoveryEvent[]> {
  const db = getDb();
  return db.recoveryEvents.toArray();
}

export async function listOpenRecoveriesForHabit(
  habitId: string,
): Promise<RecoveryEvent[]> {
  const all = await listRecoveryEvents();
  return all.filter((e) => e.habitId === habitId && e.status === "selected");
}

export type StartRecoveryInput = {
  habitId: string;
  triggerWeekStart: string;
  kind: RecoveryKind;
  actionText?: string;
  scheduledFor?: string;
};

export async function startRecovery(
  input: StartRecoveryInput,
): Promise<RecoveryEvent> {
  const db = getDb();

  if (
    (input.kind === "reschedule_in_week" || input.kind === "restart_next") &&
    !input.scheduledFor
  ) {
    throw new Error("Pick a restart or reschedule date.");
  }

  // Dismiss other open recoveries for this habit (one active path).
  const open = await listOpenRecoveriesForHabit(input.habitId);
  for (const event of open) {
    await db.recoveryEvents.put(markRecoveryDismissed(event));
  }

  const event: RecoveryEvent = {
    id: newId(),
    habitId: input.habitId,
    triggerWeekStart: input.triggerWeekStart,
    kind: input.kind,
    status: "selected",
    actionText: input.actionText,
    scheduledFor: input.scheduledFor,
    createdAt: new Date().toISOString(),
  };
  await db.recoveryEvents.put(event);
  return event;
}

export async function dismissRecovery(eventId: string): Promise<void> {
  const db = getDb();
  const event = await db.recoveryEvents.get(eventId);
  if (!event) return;
  await db.recoveryEvents.put(markRecoveryDismissed(event));
}

/** Complete smaller_version / ai_comeback by logging a recovery-only done. */
export async function completeMicroRecovery(
  eventId: string,
  date: string,
): Promise<RecoveryEvent> {
  const db = getDb();
  const event = await db.recoveryEvents.get(eventId);
  if (!event) throw new Error("Recovery not found.");
  if (event.kind !== "smaller_version" && event.kind !== "ai_comeback") {
    throw new Error("This recovery waits for a scheduled full completion.");
  }

  const checkIn = await logCheckIn({
    habitId: event.habitId,
    date,
    status: "done",
    countsTowardTarget: false,
    recoveryEventId: event.id,
  });

  const completed = markRecoveryCompleted(event, date, checkIn.id);
  await db.recoveryEvents.put(completed);
  return completed;
}

/**
 * Mark scheduled recoveries completed when a matching full check-in exists.
 */
export async function syncRecoveryCompletions(): Promise<void> {
  const db = getDb();
  const [events, checkIns] = await Promise.all([
    db.recoveryEvents.toArray(),
    db.checkIns.toArray(),
  ]);

  for (const event of events) {
    if (event.status !== "selected") continue;
    if (!recoverySatisfiedByCheckIns(event, checkIns)) continue;
    const linked = checkIns.find(
      (c) =>
        c.habitId === event.habitId &&
        (event.kind === "smaller_version" || event.kind === "ai_comeback"
          ? !c.countsTowardTarget && c.recoveryEventId === event.id
          : c.countsTowardTarget &&
            c.status === "done" &&
            c.date === event.scheduledFor),
    );
    const completed = markRecoveryCompleted(
      event,
      linked?.date ?? event.scheduledFor ?? event.createdAt.slice(0, 10),
      linked?.id,
    );
    await db.recoveryEvents.put(completed);
  }
}

export async function countCompletedRecoveries(habitId: string): Promise<number> {
  const events = await listRecoveryEvents();
  return events.filter((e) => e.habitId === habitId && e.status === "completed")
    .length;
}
