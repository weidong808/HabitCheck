"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateHabitForm } from "@/components/today/CreateHabitForm";
import { HabitCard } from "@/components/today/HabitCard";
import {
  RecoverySheet,
  type RecoveryChoice,
} from "@/components/today/RecoverySheet";
import { ResumeBanner } from "@/components/today/ResumeBanner";
import {
  APP_NAME,
  APP_SERIES_LABEL,
  APP_TAGLINE,
  APP_TRUST_LINE,
  WELLNESS_DISCLAIMER,
} from "@/lib/brand";
import {
  clearTargetCountingForDate,
  listCheckIns,
  logCheckIn,
} from "@/lib/storage/checkInsRepo";
import {
  applyDuePendingTargets,
  archiveHabit,
  createHabit,
  listActiveOrPausedHabits,
  type CreateHabitInput,
} from "@/lib/storage/habitsRepo";
import { localToday } from "@/lib/storage/ids";
import { applyDueAutoResumes, pauseHabit, resumeHabit } from "@/lib/storage/pauseRepo";
import {
  completeMicroRecovery,
  dismissRecovery,
  listRecoveryEvents,
  startRecovery,
  syncRecoveryCompletions,
} from "@/lib/storage/recoveryRepo";
import {
  addDays,
  buildWeekSnapshot,
  canCreateHabit,
  countSuccessfulRecoveries,
  deriveWeekPauseMode,
  startOfWeekMonday,
} from "@/lib/tracking";
import type {
  CheckIn,
  Difficulty,
  Habit,
  PauseState,
  RecoveryEvent,
  WeekSnapshot,
} from "@/lib/tracking/types";

type HabitView = {
  habit: Habit;
  week: WeekSnapshot;
  priorWeek: WeekSnapshot;
};

type RecoveryModal = {
  habit: Habit;
  reason: "at_risk" | "missed";
  triggerWeekStart: string;
};

export function TodayBoard() {
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [recoveries, setRecoveries] = useState<RecoveryEvent[]>([]);
  const [today, setToday] = useState("2026-01-01");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resumeNames, setResumeNames] = useState<string[]>([]);
  const [recoveryModal, setRecoveryModal] = useState<RecoveryModal | null>(
    null,
  );

  const refresh = useCallback(async () => {
    const asOf = localToday();
    setToday(asOf);
    await applyDuePendingTargets(asOf);
    const auto = await applyDueAutoResumes(asOf);
    if (auto.resumed.length > 0) {
      setResumeNames(auto.resumed.map((h) => h.name));
    }
    await syncRecoveryCompletions();
    const [nextHabits, nextCheckIns, nextRecoveries] = await Promise.all([
      listActiveOrPausedHabits(),
      listCheckIns(),
      listRecoveryEvents(),
    ]);
    setHabits(nextHabits);
    setCheckIns(nextCheckIns);
    setRecoveries(nextRecoveries);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load local data.",
          );
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const views: HabitView[] = useMemo(() => {
    const weekStart = startOfWeekMonday(today);
    const priorStart = addDays(weekStart, -7);
    return habits.map((habit) => {
      const pauseMode = deriveWeekPauseMode({ habit, weekStart, asOf: today });
      const priorPause = deriveWeekPauseMode({
        habit,
        weekStart: priorStart,
        asOf: today,
      });
      return {
        habit,
        week: buildWeekSnapshot({
          habitId: habit.id,
          weekStart,
          target: habit.weeklyTarget,
          checkIns,
          asOf: today,
          pauseMode,
        }),
        priorWeek: buildWeekSnapshot({
          habitId: habit.id,
          weekStart: priorStart,
          target: habit.weeklyTarget,
          checkIns,
          asOf: today,
          pauseMode: priorPause,
        }),
      };
    });
  }, [habits, checkIns, today]);

  const canAdd = canCreateHabit(habits);

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(input: CreateHabitInput) {
    await withBusy(async () => {
      await createHabit(input);
      setShowCreate(false);
    });
  }

  async function handleRecoveryChoice(choice: RecoveryChoice) {
    if (!recoveryModal) return;
    const { habit, triggerWeekStart } = recoveryModal;
    await withBusy(async () => {
      if (choice.kind === "smaller_version") {
        await startRecovery({
          habitId: habit.id,
          triggerWeekStart,
          kind: "smaller_version",
          actionText: choice.actionText,
        });
      } else {
        await startRecovery({
          habitId: habit.id,
          triggerWeekStart,
          kind: choice.kind,
          scheduledFor: choice.scheduledFor,
        });
      }
      setRecoveryModal(null);
    });
  }

  if (!ready) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <p className="text-[var(--muted)]">Loading your local habits…</p>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {APP_SERIES_LABEL}
      </p>
      <h1
        className="mt-3 text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {APP_NAME}
      </h1>
      <p className="mt-3 text-lg text-[var(--muted)]">{APP_TAGLINE}</p>
      <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--muted)] uppercase">
        Today · {today}
      </p>

      {loadError ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="mt-6">
        <ResumeBanner
          names={resumeNames}
          onDismiss={() => setResumeNames([])}
        />
      </div>

      <section className="mt-4 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
              Facts
            </p>
            <h2
              className="mt-1 text-2xl text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              This week
            </h2>
          </div>
          {canAdd ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)]"
            >
              Add habit
            </button>
          ) : (
            <p className="text-xs text-[var(--muted)]">3-habit cap reached</p>
          )}
        </div>

        {showCreate ? (
          <CreateHabitForm
            disabled={busy}
            onCreate={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        ) : null}

        {views.length === 0 && !showCreate ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6">
            <p className="text-[var(--foreground)]">
              No habits yet. Add up to three with a weekly target.
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)]"
            >
              Create your first habit
            </button>
          </div>
        ) : null}

        {views.map(({ habit, week, priorWeek }) => {
          const openRecoveries = recoveries.filter(
            (e) => e.habitId === habit.id && e.status === "selected",
          );
          const recoveryCount = countSuccessfulRecoveries(
            recoveries.filter((e) => e.habitId === habit.id),
          );

          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              week={week}
              priorWeek={priorWeek}
              checkIns={checkIns}
              openRecoveries={openRecoveries}
              recoveryCount={recoveryCount}
              today={today}
              busy={busy}
              onDone={async (difficulty?: Difficulty) => {
                await withBusy(async () => {
                  await logCheckIn({
                    habitId: habit.id,
                    date: today,
                    status: "done",
                    difficulty,
                    countsTowardTarget: true,
                  });
                });
              }}
              onSkip={async () => {
                await withBusy(async () => {
                  await logCheckIn({
                    habitId: habit.id,
                    date: today,
                    status: "skipped",
                    countsTowardTarget: true,
                  });
                });
              }}
              onClearToday={async () => {
                await withBusy(async () => {
                  await clearTargetCountingForDate(habit.id, today);
                });
              }}
              onBackfill={async (date, status, difficulty) => {
                await withBusy(async () => {
                  await logCheckIn({
                    habitId: habit.id,
                    date,
                    status,
                    difficulty,
                    countsTowardTarget: true,
                  });
                });
              }}
              onArchive={async () => {
                await withBusy(async () => {
                  await archiveHabit(habit.id);
                });
              }}
              onPause={async (pause: Exclude<PauseState, null>) => {
                await withBusy(async () => {
                  await pauseHabit(habit.id, pause, today);
                });
              }}
              onResume={async () => {
                await withBusy(async () => {
                  await resumeHabit(habit.id, today);
                });
              }}
              onOpenRecovery={(reason) => {
                setRecoveryModal({
                  habit,
                  reason,
                  triggerWeekStart:
                    reason === "missed" ? priorWeek.weekStart : week.weekStart,
                });
              }}
              onCompleteMicroRecovery={async (eventId) => {
                await withBusy(async () => {
                  await completeMicroRecovery(eventId, today);
                });
              }}
              onDismissRecovery={async (eventId) => {
                await withBusy(async () => {
                  await dismissRecovery(eventId);
                });
              }}
            />
          );
        })}
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Recovery paths are live. AI Comeback Coach, Habit Starter, Weekly
          Review cards, and Plan Adjuster ship next — opt-in, summaries only.
        </p>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
        {APP_TRUST_LINE}
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">{WELLNESS_DISCLAIMER}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/privacy"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Privacy
        </Link>
        <Link
          href="/review"
          className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Weekly review
        </Link>
      </div>

      {recoveryModal ? (
        <RecoverySheet
          habit={recoveryModal.habit}
          today={today}
          triggerWeekStart={recoveryModal.triggerWeekStart}
          reason={recoveryModal.reason}
          busy={busy}
          onChoose={handleRecoveryChoice}
          onDismiss={() => setRecoveryModal(null)}
        />
      ) : null}
    </main>
  );
}
