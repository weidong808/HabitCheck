/** Domain types for HabitCheck tracking (MVP v5). Pure — no Dexie. */

export type Difficulty = "easy" | "manageable" | "hard";

export type HabitStatus = "active" | "paused" | "archived";

export type PauseState =
  | null
  | { kind: "indefinite" }
  | { kind: "until"; untilDate: string };

export type Habit = {
  id: string;
  name: string;
  motivation: string;
  weeklyTarget: number;
  smallerVersion: string;
  firstTwoWeeksRamp?: string[];
  color?: string;
  icon?: string;
  status: HabitStatus;
  pause: PauseState;
  /** Local YYYY-MM-DD when the current pause began */
  pauseStartedOn?: string;
  /** Local YYYY-MM-DD when the habit last resumed from pause */
  lastResumeOn?: string;
  reminder?: { enabled: boolean; timeLocal: string };
  pendingWeeklyTarget?: number;
  createdAt: string;
  archivedAt?: string;
};

export type CheckInStatus = "done" | "skipped";

export type CheckIn = {
  id: string;
  habitId: string;
  date: string;
  status: CheckInStatus;
  difficulty?: Difficulty;
  countsTowardTarget: boolean;
  recoveryEventId?: string;
  loggedAt: string;
};

export type RecoveryKind =
  | "smaller_version"
  | "reschedule_in_week"
  | "restart_next"
  | "ai_comeback";

export type RecoveryStatus =
  | "selected"
  | "completed"
  | "dismissed"
  | "expired";

export type RecoveryEvent = {
  id: string;
  habitId: string;
  triggerWeekStart: string;
  kind: RecoveryKind;
  status: RecoveryStatus;
  actionText?: string;
  aiOptions?: string[];
  scheduledFor?: string;
  completedOn?: string;
  linkedCheckInId?: string;
  createdAt: string;
};

export type WeekStatus =
  | "in_progress"
  | "met"
  | "missed"
  | "paused"
  | "partially_paused";

export type WeekSnapshot = {
  habitId: string;
  weekStart: string;
  target: number;
  doneCount: number;
  skippedCount: number;
  status: WeekStatus;
  difficultyCounts: { easy: number; manageable: number; hard: number };
  atRiskFired: boolean;
};

/** How pause intersects a given Mon–Sun week (derived by callers / tests). */
export type WeekPauseMode = "none" | "full" | "partial";

export type WeekClassification = "easy" | "difficult" | "neutral";
