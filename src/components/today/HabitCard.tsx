"use client";

import { useMemo, useState } from "react";
import { OpenRecoveryCard } from "@/components/today/OpenRecoveryCard";
import { PauseControls } from "@/components/today/PauseControls";
import { WeekRing } from "@/components/today/WeekRing";
import { backfillDateWindow, hasTargetCountingDone } from "@/lib/tracking";
import type {
  CheckIn,
  Difficulty,
  Habit,
  PauseState,
  RecoveryEvent,
  WeekSnapshot,
} from "@/lib/tracking/types";

type HabitCardProps = {
  habit: Habit;
  week: WeekSnapshot;
  priorWeek?: WeekSnapshot;
  checkIns: CheckIn[];
  openRecoveries: RecoveryEvent[];
  recoveryCount: number;
  today: string;
  busy?: boolean;
  onDone: (difficulty?: Difficulty) => Promise<void>;
  onSkip: () => Promise<void>;
  onClearToday: () => Promise<void>;
  onBackfill: (
    date: string,
    status: "done" | "skipped",
    difficulty?: Difficulty,
  ) => Promise<void>;
  onArchive: () => Promise<void>;
  onPause: (pause: Exclude<PauseState, null>) => Promise<void>;
  onResume: () => Promise<void>;
  onOpenRecovery: (reason: "at_risk" | "missed") => void;
  onCompleteMicroRecovery: (eventId: string) => Promise<void>;
  onDismissRecovery: (eventId: string) => Promise<void>;
};

const DIFFICULTIES: Difficulty[] = ["easy", "manageable", "hard"];

export function HabitCard({
  habit,
  week,
  priorWeek,
  checkIns,
  openRecoveries,
  recoveryCount,
  today,
  busy,
  onDone,
  onSkip,
  onClearToday,
  onBackfill,
  onArchive,
  onPause,
  onResume,
  onOpenRecovery,
  onCompleteMicroRecovery,
  onDismissRecovery,
}: HabitCardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [showBackfill, setShowBackfill] = useState(false);
  const [backfillDate, setBackfillDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  const paused = habit.status === "paused";
  const todayDone = hasTargetCountingDone(checkIns, habit.id, today);
  const todaySkip = checkIns.some(
    (c) =>
      c.habitId === habit.id &&
      c.date === today &&
      c.status === "skipped" &&
      c.countsTowardTarget,
  );

  const dates = useMemo(() => backfillDateWindow(today, 7), [today]);
  const showMissedCta =
    priorWeek?.status === "missed" &&
    openRecoveries.every((e) => e.triggerWeekStart !== priorWeek.weekStart);
  const showAtRiskCta =
    week.atRiskFired &&
    !paused &&
    openRecoveries.every((e) => e.triggerWeekStart !== week.weekStart);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start gap-4">
        <WeekRing
          done={week.doneCount}
          target={week.target}
          label={`${habit.name}: ${week.doneCount} of ${week.target} this week`}
        />
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {habit.name}
          </h2>
          {habit.motivation ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{habit.motivation}</p>
          ) : null}
          <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--muted)] uppercase">
            {week.status.replaceAll("_", " ")}
            {week.atRiskFired ? " · at risk" : ""}
            {recoveryCount > 0 ? ` · ${recoveryCount} recoveries` : ""}
          </p>
        </div>
      </div>

      {(showAtRiskCta || showMissedCta) && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
          <p className="text-sm text-[var(--foreground)]">
            {showMissedCta
              ? "This week didn’t go as planned. Choose a way to restart."
              : "This week is at risk. Choose a way to restart."}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              onOpenRecovery(showMissedCta ? "missed" : "at_risk")
            }
            className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Choose a recovery path
          </button>
        </div>
      )}

      {openRecoveries.map((event) => (
        <OpenRecoveryCard
          key={event.id}
          event={event}
          today={today}
          busy={busy}
          onCompleteMicro={() => run(() => onCompleteMicroRecovery(event.id))}
          onDismiss={() => run(() => onDismissRecovery(event.id))}
        />
      ))}

      <PauseControls
        habit={habit}
        today={today}
        busy={busy}
        onPause={onPause}
        onResume={onResume}
      />

      {!paused ? (
        <div className="mt-5">
          <p className="text-sm font-medium text-[var(--foreground)]">Today</p>
          {todayDone ? (
            <p className="mt-2 text-sm text-[var(--accent)]">
              Done for today. Nice work.
            </p>
          ) : todaySkip ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Skipped today.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <fieldset>
                <legend className="sr-only">Difficulty (optional)</legend>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setDifficulty((prev) => (prev === d ? undefined : d))
                      }
                      className={
                        difficulty === d
                          ? "rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-medium capitalize text-[var(--accent)]"
                          : "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--muted)]"
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onDone(difficulty))}
                  className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
                >
                  Mark done
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onSkip())}
                  className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {(todayDone || todaySkip) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onClearToday())}
              className="mt-3 text-sm text-[var(--muted)] underline-offset-2 hover:underline"
            >
              Undo today
            </button>
          )}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[var(--muted)]">
          Check-ins are paused. Your previous progress remains.
        </p>
      )}

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={() => setShowBackfill((v) => !v)}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {showBackfill ? "Hide backfill" : "Backfill last 7 days"}
        </button>
        {showBackfill ? (
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Date</span>
              <select
                value={backfillDate}
                onChange={(e) => setBackfillDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)]"
                disabled={busy}
              >
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {d === today ? " (today)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || paused}
                onClick={() =>
                  run(() => onBackfill(backfillDate, "done", difficulty))
                }
                className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-50"
              >
                Done
              </button>
              <button
                type="button"
                disabled={busy || paused}
                onClick={() => run(() => onBackfill(backfillDate, "skipped"))}
                className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => onArchive())}
        className="mt-4 text-xs text-[var(--muted)] underline-offset-2 hover:underline"
      >
        Archive habit
      </button>
    </article>
  );
}
