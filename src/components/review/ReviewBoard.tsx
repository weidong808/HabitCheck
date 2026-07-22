"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CoachReviewCards } from "@/components/review/CoachReviewCards";
import { TargetAdjustPrompt } from "@/components/review/TargetAdjustPrompt";
import { APP_NAME, APP_SERIES_LABEL } from "@/lib/brand";
import { listCheckIns } from "@/lib/storage/checkInsRepo";
import {
  acceptTargetChange,
  applyDuePendingTargets,
  dismissTargetPrompt,
  listActiveOrPausedHabits,
} from "@/lib/storage/habitsRepo";
import { localToday } from "@/lib/storage/ids";
import { listRecoveryEvents } from "@/lib/storage/recoveryRepo";
import { getOrCreateSettings } from "@/lib/storage/settingsRepo";
import {
  buildHabitReviewFacts,
  endOfWeekSunday,
  type HabitReviewFacts,
} from "@/lib/tracking";
import type { CheckIn, Habit, RecoveryEvent } from "@/lib/tracking/types";

export function ReviewBoard() {
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState("2026-01-01");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [recoveries, setRecoveries] = useState<RecoveryEvent[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedWeekByHabit, setSelectedWeekByHabit] = useState<
    Record<string, string>
  >({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const asOf = localToday();
    setToday(asOf);
    await applyDuePendingTargets(asOf);
    const [nextHabits, nextCheckIns, nextRecoveries, settings] =
      await Promise.all([
        listActiveOrPausedHabits(),
        listCheckIns(),
        listRecoveryEvents(),
        getOrCreateSettings(),
      ]);
    setHabits(nextHabits);
    setCheckIns(nextCheckIns);
    setRecoveries(nextRecoveries);
    setAiEnabled(settings.aiEnabled);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load review.",
          );
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const reviews: HabitReviewFacts[] = useMemo(
    () =>
      habits.map((habit) =>
        buildHabitReviewFacts({
          habit,
          checkIns,
          recoveries,
          asOf: today,
        }),
      ),
    [habits, checkIns, recoveries, today],
  );

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <p className="hc-fade text-[var(--muted)]">Loading review…</p>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="hc-rise">
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
          {APP_SERIES_LABEL} · Review
        </p>
        <h1
          className="mt-3 text-3xl leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Weekly review
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          Consistency, recoveries, and difficulty stay separate Facts. Optional
          Coach cards explain patterns without changing the numbers.
        </p>
        <p className="mt-3 font-mono text-[11px] tracking-[0.12em] text-[var(--muted)] uppercase">
          As of · {today}
        </p>
      </header>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="hc-rise-delay">
        <CoachReviewCards reviews={reviews} aiEnabled={aiEnabled} />
      </div>

      {reviews.length === 0 ? (
        <p className="mt-10 text-[var(--muted)]">
          No active habits yet.{" "}
          <Link
            href="/"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Add one on Today
          </Link>
          .
        </p>
      ) : null}

      <div className="mt-10 space-y-8">
        {reviews.map((review) => {
          const closed = review.closedWeeks.filter(
            (w) => w.week.status === "met" || w.week.status === "missed",
          );
          const selected =
            selectedWeekByHabit[review.habit.id] ??
            closed[closed.length - 1]?.week.weekStart;
          const selectedFacts =
            closed.find((w) => w.week.weekStart === selected) ??
            closed[closed.length - 1];

          return (
            <section
              key={review.habit.id}
              className="hc-interactive rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_0_color-mix(in_srgb,var(--foreground)_4%,transparent)]"
            >
              <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
                Facts · {review.habit.name}
              </p>
              <h2
                className="mt-1 text-2xl text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {review.habit.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Current target {review.habit.weeklyTarget}/week
                {review.habit.pendingWeeklyTarget != null
                  ? ` · pending ${review.habit.pendingWeeklyTarget} next Monday`
                  : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Average consistency:{" "}
                {review.averageConsistency == null
                  ? "—"
                  : `${Math.round(review.averageConsistency * 100)}%`}
              </p>

              {closed.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  No closed weeks yet. Come back after Sunday.
                </p>
              ) : (
                <>
                  <label className="mt-4 block text-sm">
                    <span className="text-[var(--muted)]">Closed week</span>
                    <select
                      value={selected}
                      onChange={(e) =>
                        setSelectedWeekByHabit((prev) => ({
                          ...prev,
                          [review.habit.id]: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                    >
                      {closed.map((w) => (
                        <option
                          key={w.week.weekStart}
                          value={w.week.weekStart}
                        >
                          {w.week.weekStart} →{" "}
                          {endOfWeekSunday(w.week.weekStart)} ({w.week.status})
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedFacts ? (
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[var(--background)]/80 p-3">
                        <dt className="text-xs text-[var(--muted)]">
                          Consistency
                        </dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
                          {Math.round(selectedFacts.consistency * 100)}%
                          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                            ({selectedFacts.week.doneCount}/
                            {selectedFacts.week.target})
                          </span>
                        </dd>
                      </div>
                      <div className="rounded-xl bg-[var(--background)]/80 p-3">
                        <dt className="text-xs text-[var(--muted)]">
                          Successful recoveries
                        </dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
                          {selectedFacts.recoveriesCompleted}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-[var(--background)]/80 p-3 sm:col-span-2">
                        <dt className="text-xs text-[var(--muted)]">
                          Difficulty pattern
                        </dt>
                        <dd className="mt-1 text-sm text-[var(--foreground)]">
                          easy {selectedFacts.week.difficultyCounts.easy} ·
                          manageable{" "}
                          {selectedFacts.week.difficultyCounts.manageable} ·
                          hard {selectedFacts.week.difficultyCounts.hard}
                          <span className="text-[var(--muted)]">
                            {" "}
                            · class {selectedFacts.classification}
                            {selectedFacts.week.atRiskFired
                              ? " · at-risk fired"
                              : ""}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                </>
              )}

              {review.planAdjust ? (
                <div className="mt-5">
                  <TargetAdjustPrompt
                    habit={review.habit}
                    suggestion={review.planAdjust}
                    busy={busy}
                    aiEnabled={aiEnabled}
                    onAccept={async (target) => {
                      await withBusy(async () => {
                        await acceptTargetChange(review.habit.id, target);
                      });
                    }}
                    onDismiss={async (pairKey) => {
                      await withBusy(async () => {
                        await dismissTargetPrompt(review.habit.id, pairKey);
                      });
                    }}
                  />
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Back to Today
        </Link>
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {APP_NAME} keeps Facts honest — target changes never auto-apply.
      </p>
    </main>
  );
}
