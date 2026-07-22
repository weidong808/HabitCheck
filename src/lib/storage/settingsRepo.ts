import { getDb } from "@/lib/storage/db";
import {
  buildExportDocument,
  parseExportDocument,
  type HabitCheckExport,
} from "@/lib/storage/exportImport";

export async function exportAllData(): Promise<HabitCheckExport> {
  const db = getDb();
  const [habits, checkIns, recoveryEvents, settings] = await Promise.all([
    db.habits.toArray(),
    db.checkIns.toArray(),
    db.recoveryEvents.toArray(),
    db.settings.get("settings"),
  ]);
  return buildExportDocument({
    habits,
    checkIns,
    recoveryEvents,
    settings: settings ?? null,
  });
}

/** Replace-with-confirm import. */
export async function importAllData(raw: unknown): Promise<void> {
  const doc = parseExportDocument(raw);
  const db = getDb();
  await db.transaction(
    "rw",
    db.habits,
    db.checkIns,
    db.recoveryEvents,
    db.settings,
    async () => {
      await db.habits.clear();
      await db.checkIns.clear();
      await db.recoveryEvents.clear();
      await db.settings.clear();
      await db.habits.bulkPut(doc.habits);
      await db.checkIns.bulkPut(doc.checkIns);
      await db.recoveryEvents.bulkPut(doc.recoveryEvents);
      if (doc.settings) await db.settings.put(doc.settings);
    },
  );
}

export async function getOrCreateSettings() {
  const db = getDb();
  const existing = await db.settings.get("settings");
  if (existing) return existing;
  const defaults = {
    id: "settings" as const,
    theme: "system" as const,
    remindersEnabled: false,
    aiEnabled: true,
    onboardingCompleted: false,
  };
  await db.settings.put(defaults);
  return defaults;
}

export async function setAiEnabled(enabled: boolean) {
  const db = getDb();
  const settings = await getOrCreateSettings();
  await db.settings.put({ ...settings, aiEnabled: enabled });
}
