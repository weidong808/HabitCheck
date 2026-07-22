import Dexie, { type EntityTable } from "dexie";

/** IndexedDB schema stub — full fields land in P1/P2 per MVP v5. */
export type HabitRow = {
  id: string;
  name: string;
  motivation: string;
  weeklyTarget: number;
  smallerVersion: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
};

export type CheckInRow = {
  id: string;
  habitId: string;
  date: string;
  status: "done" | "skipped";
  countsTowardTarget: boolean;
  loggedAt: string;
};

export type SettingsRow = {
  id: "settings";
  theme: "system" | "light" | "dark";
  remindersEnabled: boolean;
  aiEnabled: boolean;
  onboardingCompleted: boolean;
};

export class HabitCheckDB extends Dexie {
  habits!: EntityTable<HabitRow, "id">;
  checkIns!: EntityTable<CheckInRow, "id">;
  settings!: EntityTable<SettingsRow, "id">;

  constructor() {
    super("habitcheck");
    this.version(1).stores({
      habits: "id, status, createdAt",
      checkIns: "id, habitId, date, [habitId+date]",
      settings: "id",
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
