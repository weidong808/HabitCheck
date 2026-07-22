"use client";

import { useEffect, useState } from "react";
import { AiConsentModal } from "@/components/ai/AiConsentModal";
import { callCoach } from "@/lib/ai/client";
import type { CreateHabitInput } from "@/lib/storage/habitsRepo";
import { getOrCreateSettings } from "@/lib/storage/settingsRepo";

type CreateHabitFormProps = {
  disabled?: boolean;
  onCreate: (input: CreateHabitInput) => Promise<void>;
  onCancel?: () => void;
};

type StarterData = {
  name: string;
  weeklyTarget: number;
  motivation: string;
  smallerVersion: string;
  firstTwoWeeksRamp: string[];
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
  const [ramp, setRamp] = useState<string[]>([]);
  const [goalText, setGoalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [coachBusy, setCoachBusy] = useState(false);
  const [consent, setConsent] = useState<"starter" | "smaller" | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    void getOrCreateSettings().then((s) => setAiEnabled(s.aiEnabled));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onCreate({
        name,
        motivation,
        weeklyTarget,
        smallerVersion,
        ...(ramp.length > 0 ? { firstTwoWeeksRamp: ramp } : {}),
      });
      setName("");
      setMotivation("");
      setWeeklyTarget(4);
      setSmallerVersion("");
      setRamp([]);
      setGoalText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create habit.");
    } finally {
      setSaving(false);
    }
  }

  async function runStarter() {
    setCoachBusy(true);
    setError(null);
    const result = await callCoach<StarterData>({
      feature: "habit_starter",
      consented: true,
      goalText,
    });
    setCoachBusy(false);
    setConsent(null);
    if (!result.ok) {
      setError(result.error + " — you can still fill the form manually.");
      return;
    }
    setName(result.data.name);
    setMotivation(result.data.motivation);
    setWeeklyTarget(result.data.weeklyTarget);
    setSmallerVersion(result.data.smallerVersion);
    setRamp(result.data.firstTwoWeeksRamp);
  }

  async function runSmallerVersion() {
    setCoachBusy(true);
    setError(null);
    const result = await callCoach<{ smallerVersion: string }>({
      feature: "smaller_version",
      consented: true,
      habitName: name || goalText || "Habit",
      motivation,
      currentSmallerVersion: smallerVersion || undefined,
    });
    setCoachBusy(false);
    setConsent(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSmallerVersion(result.data.smallerVersion);
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
          Manual setup or Habit Starter coach — you accept or edit everything.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach · Habit Starter
        </p>
        {aiEnabled ? (
          <>
            <label className="mt-2 block text-sm">
              <span className="font-medium text-[var(--foreground)]">
                Describe your goal
              </span>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[var(--foreground)]"
                placeholder="I want a short morning walk most weekdays"
                disabled={disabled || saving || coachBusy}
              />
            </label>
            <button
              type="button"
              disabled={
                disabled || saving || coachBusy || goalText.trim().length < 3
              }
              onClick={() => setConsent("starter")}
              className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium disabled:opacity-50"
            >
              {coachBusy && consent === "starter"
                ? "Coaching…"
                : "Ask Habit Starter"}
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">
            AI coach is off — enable it in Settings, or fill the form manually.
          </p>
        )}
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
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <input
            required
            value={smallerVersion}
            onChange={(e) => setSmallerVersion(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            placeholder="Put on shoes and step outside"
            disabled={disabled || saving}
          />
          <button
            type="button"
            disabled={disabled || saving || coachBusy || !aiEnabled}
            onClick={() => setConsent("smaller")}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-50"
          >
            Suggest
          </button>
        </div>
      </label>

      {ramp.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] p-3">
          <p className="text-xs font-medium text-[var(--foreground)]">
            First two weeks (from Coach — edit anytime later)
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {ramp.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

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

      {consent === "starter" ? (
        <AiConsentModal
          title="Use Habit Starter?"
          description="We'll send your goal text (not your habit history) to generate a suggested plan you can edit."
          busy={coachBusy}
          onConfirm={() => void runStarter()}
          onCancel={() => setConsent(null)}
        />
      ) : null}
      {consent === "smaller" ? (
        <AiConsentModal
          title="Suggest a smaller version?"
          description="We'll send habit name and motivation only to propose a micro-action."
          busy={coachBusy}
          onConfirm={() => void runSmallerVersion()}
          onCancel={() => setConsent(null)}
        />
      ) : null}
    </form>
  );
}
