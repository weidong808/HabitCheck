import type { Habit, CheckIn, RecoveryEvent } from "@/lib/tracking/types";
import type { SettingsRow } from "@/lib/storage/db";

export const EXPORT_VERSION = "habitcheck-export@2" as const;

export type HabitCheckExport = {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  habits: Habit[];
  checkIns: CheckIn[];
  recoveryEvents: RecoveryEvent[];
  settings: SettingsRow | null;
};

export function buildExportDocument(args: {
  habits: Habit[];
  checkIns: CheckIn[];
  recoveryEvents: RecoveryEvent[];
  settings: SettingsRow | null;
}): HabitCheckExport {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    habits: args.habits,
    checkIns: args.checkIns,
    recoveryEvents: args.recoveryEvents,
    settings: args.settings,
  };
}

export function parseExportDocument(raw: unknown): HabitCheckExport {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid export file.");
  }
  const doc = raw as Partial<HabitCheckExport>;
  if (doc.version !== EXPORT_VERSION) {
    throw new Error(
      `Unsupported export version: ${String(doc.version)}. Expected ${EXPORT_VERSION}.`,
    );
  }
  if (!Array.isArray(doc.habits) || !Array.isArray(doc.checkIns)) {
    throw new Error("Export missing habits or check-ins.");
  }
  return {
    version: EXPORT_VERSION,
    exportedAt: typeof doc.exportedAt === "string" ? doc.exportedAt : new Date().toISOString(),
    habits: doc.habits as Habit[],
    checkIns: doc.checkIns as CheckIn[],
    recoveryEvents: Array.isArray(doc.recoveryEvents)
      ? (doc.recoveryEvents as RecoveryEvent[])
      : [],
    settings: (doc.settings as SettingsRow | null) ?? null,
  };
}
