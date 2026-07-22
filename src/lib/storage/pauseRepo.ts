import { getDb } from "@/lib/storage/db";
import { shouldAutoResume } from "@/lib/tracking";
import type { Habit, PauseState } from "@/lib/tracking/types";

export async function pauseHabit(
  habitId: string,
  pause: Exclude<PauseState, null>,
  asOf: string,
): Promise<Habit> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) throw new Error("Habit not found.");
  if (habit.status === "archived") throw new Error("Archived habits cannot be paused.");

  const next: Habit = {
    ...habit,
    status: "paused",
    pause,
    pauseStartedOn: asOf,
  };
  await db.habits.put(next);
  return next;
}

export async function resumeHabit(
  habitId: string,
  asOf: string,
): Promise<Habit> {
  const db = getDb();
  const habit = await db.habits.get(habitId);
  if (!habit) throw new Error("Habit not found.");

  const next: Habit = {
    ...habit,
    status: "active",
    pause: null,
    lastResumeOn: asOf,
  };
  await db.habits.put(next);
  return next;
}

export type AutoResumeResult = {
  resumed: Habit[];
};

/** Resume dated pauses that have reached their until date. */
export async function applyDueAutoResumes(
  asOf: string,
): Promise<AutoResumeResult> {
  const db = getDb();
  const habits = await db.habits.toArray();
  const resumed: Habit[] = [];
  for (const habit of habits) {
    if (!shouldAutoResume(habit, asOf)) continue;
    resumed.push(await resumeHabit(habit.id, asOf));
  }
  return { resumed };
}
