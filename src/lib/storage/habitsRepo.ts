import { getDb } from "@/lib/storage/db";
import { newId } from "@/lib/storage/ids";
import {
  applyPendingTargetIfDue,
  canCreateHabit,
  clampWeeklyTarget,
  queueWeeklyTarget,
} from "@/lib/tracking";
import type { Habit } from "@/lib/tracking/types";

export type CreateHabitInput = {
  name: string;
  motivation: string;
  weeklyTarget: number;
  smallerVersion: string;
};

export async function listHabits(): Promise<Habit[]> {
  const db = getDb();
  const rows = await db.habits.toArray();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listActiveOrPausedHabits(): Promise<Habit[]> {
  const all = await listHabits();
  return all.filter((h) => h.status === "active" || h.status === "paused");
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const db = getDb();
  const existing = await listHabits();
  if (!canCreateHabit(existing)) {
    throw new Error(
      "You already have 3 active or paused habits. Archive one to add another.",
    );
  }

  const habit: Habit = {
    id: newId(),
    name: input.name.trim(),
    motivation: input.motivation.trim(),
    weeklyTarget: clampWeeklyTarget(input.weeklyTarget),
    smallerVersion: input.smallerVersion.trim(),
    status: "active",
    pause: null,
    createdAt: new Date().toISOString(),
  };

  if (!habit.name) throw new Error("Name is required.");
  if (!habit.smallerVersion) throw new Error("Smaller version is required.");

  await db.habits.put(habit);
  return habit;
}

export async function archiveHabit(habitId: string): Promise<void> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) return;
  await db.habits.put({
    ...habit,
    status: "archived",
    archivedAt: new Date().toISOString(),
    pause: null,
  });
}

/** Apply any Monday pending targets for all habits. */
export async function applyDuePendingTargets(asOf: string): Promise<void> {
  const db = getDb();
  const habits = await db.habits.toArray();
  for (const habit of habits) {
    const next = applyPendingTargetIfDue(habit, asOf);
    if (next !== habit) {
      await db.habits.put(next);
    }
  }
}

/** Queue a weekly target change effective next Monday. */
export async function acceptTargetChange(
  habitId: string,
  nextTarget: number,
): Promise<Habit> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) throw new Error("Habit not found.");
  const next = {
    ...queueWeeklyTarget(habit, nextTarget),
    targetPromptDismissedKey: undefined,
  };
  await db.habits.put(next);
  return next;
}

export async function dismissTargetPrompt(
  habitId: string,
  pairKey: string,
): Promise<Habit> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) throw new Error("Habit not found.");
  const next: Habit = {
    ...habit,
    targetPromptDismissedKey: pairKey,
  };
  await db.habits.put(next);
  return next;
}

export async function clearPendingTarget(habitId: string): Promise<Habit> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) throw new Error("Habit not found.");
  const next: Habit = { ...habit, pendingWeeklyTarget: undefined };
  await db.habits.put(next);
  return next;
}
