import { getDb } from "@/lib/storage/db";
import { newId } from "@/lib/storage/ids";
import { upsertCheckIn } from "@/lib/tracking";
import type { CheckIn, CheckInStatus, Difficulty } from "@/lib/tracking/types";

export async function listCheckIns(): Promise<CheckIn[]> {
  const db = getDb();
  return db.checkIns.toArray();
}

export async function listCheckInsForHabit(habitId: string): Promise<CheckIn[]> {
  const db = getDb();
  return db.checkIns.where("habitId").equals(habitId).toArray();
}

export type LogCheckInInput = {
  habitId: string;
  date: string;
  status: CheckInStatus;
  difficulty?: Difficulty;
  countsTowardTarget?: boolean;
  recoveryEventId?: string;
};

/**
 * Writes a check-in using tracking upsert rules, then persists the
 * affected same-day rows for that habit.
 */
export async function logCheckIn(input: LogCheckInInput): Promise<CheckIn> {
  const db = getDb();
  const all = await db.checkIns.toArray();
  const next: CheckIn = {
    id: newId(),
    habitId: input.habitId,
    date: input.date,
    status: input.status,
    difficulty: input.status === "done" ? input.difficulty : undefined,
    countsTowardTarget: input.countsTowardTarget ?? true,
    recoveryEventId: input.recoveryEventId,
    loggedAt: new Date().toISOString(),
  };

  const merged = upsertCheckIn(all, next);
  const sameDay = merged.filter(
    (c) => c.habitId === input.habitId && c.date === input.date,
  );
  const stale = all.filter(
    (c) => c.habitId === input.habitId && c.date === input.date,
  );

  await db.transaction("rw", db.checkIns, async () => {
    for (const row of stale) {
      if (!sameDay.some((c) => c.id === row.id)) {
        await db.checkIns.delete(row.id);
      }
    }
    for (const row of sameDay) {
      await db.checkIns.put(row);
    }
  });

  return next;
}

export async function clearTargetCountingForDate(
  habitId: string,
  date: string,
): Promise<void> {
  const db = getDb();
  const rows = await db.checkIns
    .where("[habitId+date]")
    .equals([habitId, date])
    .toArray();
  for (const row of rows) {
    if (row.countsTowardTarget) {
      await db.checkIns.delete(row.id);
    }
  }
}
