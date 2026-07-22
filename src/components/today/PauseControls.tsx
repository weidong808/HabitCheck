"use client";

import { useState } from "react";
import { addDays } from "@/lib/tracking";
import type { Habit, PauseState } from "@/lib/tracking/types";

type PauseControlsProps = {
  habit: Habit;
  today: string;
  busy?: boolean;
  onPause: (pause: Exclude<PauseState, null>) => Promise<void>;
  onResume: () => Promise<void>;
};

export function PauseControls({
  habit,
  today,
  busy,
  onPause,
  onResume,
}: PauseControlsProps) {
  const [untilDate, setUntilDate] = useState(addDays(today, 3));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (habit.status === "paused") {
    return (
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3">
        <p className="text-sm text-[var(--foreground)]">
          Paused
          {habit.pause?.kind === "until"
            ? ` until ${habit.pause.untilDate}`
            : " indefinitely"}
          .
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setError(null);
            try {
              await onResume();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not resume.",
              );
            }
          }}
          className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          Resume now
        </button>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
      >
        {open ? "Hide pause options" : "Pause habit"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3 rounded-xl border border-[var(--border)] p-3">
          <p className="text-xs text-[var(--muted)]">
            Pausing mid-week keeps check-ins visible but excludes the week from
            averages.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setError(null);
              try {
                await onPause({ kind: "indefinite" });
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Could not pause.",
                );
              }
            }}
            className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm"
          >
            Pause indefinitely
          </button>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Pause until</span>
            <input
              type="date"
              value={untilDate}
              min={today}
              onChange={(e) => setUntilDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              disabled={busy}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setError(null);
              try {
                await onPause({ kind: "until", untilDate });
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Could not pause.",
                );
              }
            }}
            className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm"
          >
            Pause until date
          </button>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
