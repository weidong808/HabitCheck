"use client";

import { useState } from "react";
import { AiConsentModal } from "@/components/ai/AiConsentModal";
import { callCoach } from "@/lib/ai/client";
import type { PlanAdjustSuggestion } from "@/lib/tracking";
import { planAdjustPairKey } from "@/lib/tracking";
import type { Habit } from "@/lib/tracking/types";

type TargetAdjustPromptProps = {
  habit: Habit;
  suggestion: PlanAdjustSuggestion;
  busy?: boolean;
  aiEnabled?: boolean;
  onAccept: (target: number) => Promise<void>;
  onDismiss: (pairKey: string) => Promise<void>;
};

export function TargetAdjustPrompt({
  habit,
  suggestion,
  busy,
  aiEnabled = true,
  onAccept,
  onDismiss,
}: TargetAdjustPromptProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(suggestion.proposedTarget);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [coachBusy, setCoachBusy] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const title =
    suggestion.kind === "down"
      ? "What feels realistic now?"
      : "Maintain or progress?";
  const body =
    suggestion.kind === "down"
      ? `Two difficult weeks in a row. Suggested weekly target: ${suggestion.proposedTarget} (from ${habit.weeklyTarget}). Takes effect next Monday.`
      : `Two easy weeks in a row. Suggested weekly target: ${suggestion.proposedTarget} (from ${habit.weeklyTarget}). Takes effect next Monday.`;

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update target.");
    }
  }

  async function runExplain() {
    setCoachBusy(true);
    setError(null);
    const result = await callCoach<{ explanation: string }>({
      feature: "plan_adjuster",
      consented: true,
      kind: suggestion.kind,
      allowedTarget: suggestion.proposedTarget,
      currentTarget: habit.weeklyTarget,
      summary: {
        name: habit.name,
        weeklyTarget: habit.weeklyTarget,
        smallerVersion: habit.smallerVersion,
      },
    });
    setCoachBusy(false);
    setConsent(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setExplanation(result.data.explanation);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-4">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
        Facts · Plan adjuster
      </p>
      <h3
        className="mt-1 text-lg text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Weeks {suggestion.weekStarts[0]} → {suggestion.weekStarts[1]} (
        {suggestion.classifications.join(", ")}).
      </p>

      {explanation ? (
        <p className="mt-3 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--foreground)]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
            Coach
          </span>
          <span className="mt-1 block">{explanation}</span>
        </p>
      ) : aiEnabled ? (
        <button
          type="button"
          disabled={busy || coachBusy}
          onClick={() => setConsent(true)}
          className="mt-3 text-sm text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-50"
        >
          {coachBusy ? "Explaining…" : "Ask Coach why this suggestion"}
        </button>
      ) : null}

      {editing ? (
        <label className="mt-3 block text-sm">
          <span className="text-[var(--muted)]">Target (1–7)</span>
          <input
            type="number"
            min={1}
            max={7}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            disabled={busy}
          />
        </label>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(() => onAccept(editing ? value : suggestion.proposedTarget))
          }
          className="inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing((v) => !v)}
          className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm"
        >
          {editing ? "Hide edit" : "Edit"}
        </button>
        {suggestion.kind === "up" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() => onDismiss(planAdjustPairKey(suggestion.weekStarts)))
            }
            className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm"
          >
            Maintain
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(() => onDismiss(planAdjustPairKey(suggestion.weekStarts)))
          }
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {consent ? (
        <AiConsentModal
          title="Explain this target suggestion?"
          description="We'll send habit name, current target, and the proposed ±1 target only — not full history."
          busy={coachBusy}
          onConfirm={() => void runExplain()}
          onCancel={() => setConsent(false)}
        />
      ) : null}
    </div>
  );
}
