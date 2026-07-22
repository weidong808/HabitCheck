"use client";

import { useState } from "react";
import type { CreateHabitInput } from "@/lib/storage/habitsRepo";

type CreateHabitFormProps = {
  disabled?: boolean;
  onCreate: (input: CreateHabitInput) => Promise<void>;
  onCancel?: () => void;
};

export function CreateHabitForm({
  disabled,
  onCreate,
  onCancel,
}: CreateHabitFormProps) {
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [weeklyTarget, setWeeklyTarget] = useState(4);
  const [smallerVersion, setSmallerVersion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onCreate({ name, motivation, weeklyTarget, smallerVersion });
      setName("");
      setMotivation("");
      setWeeklyTarget(4);
      setSmallerVersion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create habit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div>
        <h2
          className="text-xl text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New habit
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Flexible weekly target · smaller version ready for recovery later.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-[var(--foreground)]">Name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          placeholder="Morning walk"
          disabled={disabled || saving}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-[var(--foreground)]">
          Weekly target (1–7)
        </span>
        <input
          type="number"
          min={1}
          max={7}
          required
          value={weeklyTarget}
          onChange={(e) => setWeeklyTarget(Number(e.target.value))}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          disabled={disabled || saving}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-[var(--foreground)]">Motivation</span>
        <input
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          placeholder="Feel clearer in the morning"
          disabled={disabled || saving}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-[var(--foreground)]">
          Smaller version
        </span>
        <input
          required
          value={smallerVersion}
          onChange={(e) => setSmallerVersion(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          placeholder="Put on shoes and step outside"
          disabled={disabled || saving}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={disabled || saving}
          className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add habit"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
