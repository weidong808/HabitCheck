"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateHabitForm } from "@/components/today/CreateHabitForm";
import { HabitCard } from "@/components/today/HabitCard";
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
import {
  buildWeekSnapshot,
  canCreateHabit,
  startOfWeekMonday,
} from "@/lib/tracking";
import type { CheckIn, Difficulty, Habit, WeekSnapshot } from "@/lib/tracking/types";

type HabitView = {
  habit: Habit;
  week: WeekSnapshot;
};

export function TodayBoard() {
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [today, setToday] = useState("2026-01-01");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const asOf = localToday();
    setToday(asOf);
    await applyDuePendingTargets(asOf);
    const [nextHabits, nextCheckIns] = await Promise.all([
      listActiveOrPausedHabits(),
      listCheckIns(),
    ]);
    setHabits(nextHabits);
    setCheckIns(nextCheckIns);
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
    return habits.map((habit) => ({
      habit,
      week: buildWeekSnapshot({
        habitId: habit.id,
        weekStart,
        target: habit.weeklyTarget,
        checkIns,
        asOf: today,
        pauseMode: habit.status === "paused" ? "full" : "none",
      }),
    }));
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

      <section className="mt-10 space-y-4">
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

        {views.map(({ habit, week }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            week={week}
            checkIns={checkIns}
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
          />
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Habit Starter, Comeback Coach, Weekly Review cards, and Plan Adjuster
          ship next — opt-in, summaries only. Facts above stay honest either
          way.
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
    </main>
  );
}
