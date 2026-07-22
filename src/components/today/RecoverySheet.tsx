"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfWeek,
  endOfWeekSunday,
  isAfter,
  isOnOrAfter,
  startOfWeekMonday,
} from "@/lib/tracking";
import type { Habit, RecoveryKind } from "@/lib/tracking/types";

export type RecoveryChoice =
  | {
      kind: "smaller_version";
      actionText: string;
    }
  | {
      kind: "reschedule_in_week";
      scheduledFor: string;
    }
  | {
      kind: "restart_next";
      scheduledFor: string;
    };

type RecoverySheetProps = {
  habit: Habit;
  today: string;
  /** Week that triggered recovery (at-risk current week, or missed prior week). */
  triggerWeekStart: string;
  reason: "at_risk" | "missed";
  busy?: boolean;
  onChoose: (choice: RecoveryChoice) => Promise<void>;
  onDismiss: () => void;
};

export function RecoverySheet({
  habit,
  today,
  triggerWeekStart,
  reason,
  busy,
  onChoose,
  onDismiss,
}: RecoverySheetProps) {
  const [actionText, setActionText] = useState(habit.smallerVersion);
  const [scheduleDate, setScheduleDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  const weekStart = startOfWeekMonday(today);
  const weekDays = eachDayOfWeek(weekStart);
  const futureInWeek = weekDays.filter((d) => isOnOrAfter(d, today));
  const nextWeekStart = addDays(weekStart, 7);
  const restartOptions = [
    ...futureInWeek,
    ...eachDayOfWeek(nextWeekStart).slice(0, 3),
  ];

  const title =
    reason === "missed"
      ? "This week didn’t go as planned"
      : "This week is at risk";

  async function choose(kind: RecoveryKind) {
    setError(null);
    try {
      if (kind === "smaller_version") {
        if (!actionText.trim()) throw new Error("Describe the smaller action.");
        await onChoose({ kind, actionText: actionText.trim() });
        return;
      }
      if (kind === "reschedule_in_week") {
        if (!futureInWeek.includes(scheduleDate)) {
          throw new Error("Pick a day still left in this week.");
        }
        await onChoose({ kind, scheduledFor: scheduleDate });
        return;
      }
      if (kind === "restart_next") {
        await onChoose({ kind, scheduledFor: scheduleDate });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start recovery.");
    }
  }

  const sunday = useMemo(
    () => endOfWeekSunday(triggerWeekStart),
    [triggerWeekStart],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Recovery · {habit.name}
        </p>
        <h2
          id="recovery-title"
          className="mt-2 text-2xl text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Choose a way to restart. A smaller action still matters — and does not
          inflate your weekly completion. Trigger week ending {sunday}
          {isAfter(today, sunday) ? " (closed)" : ""}.
        </p>

        <div className="mt-6 space-y-4">
          <section className="rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Do a smaller version today
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Counts as a successful recovery, not a full completion.
            </p>
            <label className="mt-3 block text-sm">
              <span className="sr-only">Smaller action</span>
              <input
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)]"
                disabled={busy}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => choose("smaller_version")}
              className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
            >
              Start smaller version
            </button>
          </section>

          <section className="rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {reason === "missed"
                ? "Plan a catch-up day"
                : "Reschedule within this week"}
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Full completion on that day counts toward your weekly target.
            </p>
            <label className="mt-3 block text-sm">
              <span className="text-[var(--muted)]">Date</span>
              <select
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                disabled={busy}
              >
                {(reason === "missed" ? restartOptions : futureInWeek).map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              type="button"
              disabled={busy || (reason !== "missed" && futureInWeek.length === 0)}
              onClick={() =>
                choose(
                  reason === "missed" ? "restart_next" : "reschedule_in_week",
                )
              }
              className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium disabled:opacity-50"
            >
              Schedule it
            </button>
          </section>

          <section className="rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Choose my next restart day
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Recovery succeeds when you complete a full check-in on that date.
            </p>
            <label className="mt-3 block text-sm">
              <span className="text-[var(--muted)]">Restart date</span>
              <select
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                disabled={busy}
              >
                {restartOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => choose("restart_next")}
              className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium disabled:opacity-50"
            >
              Set restart day
            </button>
          </section>

          <section className="rounded-xl border border-dashed border-[var(--border)] p-4 opacity-80">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Ask AI for a personalized comeback
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Comeback Coach (2–3 options) ships with the AI platform phases.
              Use a smaller version for now.
            </p>
          </section>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
