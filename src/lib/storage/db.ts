import Dexie, { type EntityTable } from "dexie";
import type {
  CheckIn,
  Habit,
  RecoveryEvent,
} from "@/lib/tracking/types";

export type HabitRow = Habit;
export type CheckInRow = CheckIn;
export type RecoveryEventRow = RecoveryEvent;

export type SettingsRow = {
  id: "settings";
  theme: "system" | "light" | "dark";
  remindersEnabled: boolean;
  aiEnabled: boolean;
  onboardingCompleted: boolean;
};

export type AiInvocationLogRow = {
  id: string;
  feature:
    | "habit_starter"
    | "weekly_review"
    | "comeback"
    | "plan_adjuster"
    | "smaller_version";
  promptVersion: string;
  createdAt: string;
};

/**
 * IndexedDB schema aligned to MVP v5.
 * Version 2 adds recovery events + AI invocation log.
 */
export class HabitCheckDB extends Dexie {
  habits!: EntityTable<HabitRow, "id">;
  checkIns!: EntityTable<CheckInRow, "id">;
  recoveryEvents!: EntityTable<RecoveryEventRow, "id">;
  settings!: EntityTable<SettingsRow, "id">;
  aiInvocationLogs!: EntityTable<AiInvocationLogRow, "id">;

  constructor() {
    super("habitcheck");
    this.version(1).stores({
      habits: "id, status, createdAt",
      checkIns: "id, habitId, date, [habitId+date]",
      settings: "id",
    });
    this.version(2).stores({
      habits: "id, status, createdAt",
      checkIns: "id, habitId, date, [habitId+date]",
      recoveryEvents: "id, habitId, triggerWeekStart, status, kind",
      settings: "id",
      aiInvocationLogs: "id, feature, createdAt",
    });
  }
}

let dbSingleton: HabitCheckDB | null = null;

export function getDb() {
  if (typeof window === "undefined") {
    throw new Error("HabitCheckDB is browser-only");
  }
  if (!dbSingleton) {
    dbSingleton = new HabitCheckDB();
  }
  return dbSingleton;
}

/** Test helper — reset singleton between browser tests if added later. */
export function resetDbSingletonForTests() {
  dbSingleton = null;
}
