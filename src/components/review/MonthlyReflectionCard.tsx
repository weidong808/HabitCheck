"use client";

import { useMemo, useState } from "react";
import { AiConsentModal } from "@/components/ai/AiConsentModal";
import { callCoach } from "@/lib/ai/client";
import { computeMonthlyInsights } from "@/lib/tracking/insights";
import type { CheckIn, Habit } from "@/lib/tracking/types";

type Reflection = {
  headline: string;
  observations: string[];
  encouragement: string;
};

type MonthlyReflectionCardProps = {
  habits: Habit[];
  checkIns: CheckIn[];
  today: string;
  aiEnabled: boolean;
};

const WEEKS = 4;

export function MonthlyReflectionCard({
  habits,
  checkIns,
  today,
  aiEnabled,
}: MonthlyReflectionCardProps) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [revealKey, setRevealKey] = useState(0);

  const insights = useMemo(
    () => computeMonthlyInsights({ habits, checkIns, asOf: today, weeks: WEEKS }),
    [habits, checkIns, today],
  );

  const hasData =
    insights.perHabit.length > 0 && insights.overall.totalDone > 0;

  async function runCoach() {
    setBusy(true);
    setError(null);
    setReflection(null);
    const result = await callCoach<Reflection>({
      feature: "monthly_reflection",
      consented: true,
      weeks: insights.weeks,
      perHabit: insights.perHabit.slice(0, 3).map((h) => ({
        name: h.name,
        weeklyTarget: h.weeklyTarget,
        weeksMetTarget: h.weeksMetTarget,
        totalDone: h.totalDone,
        avgDonePerWeek: h.avgDonePerWeek,
        bestWeekday: h.bestWeekday,
        difficultyCounts: h.difficultyCounts,
        trend: h.trend,
      })),
      overall: insights.overall,
    });
    setBusy(false);
    setConsent(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevealKey((k) => k + 1);
    setReflection(result.data);
  }

  if (!aiEnabled) return null;

  if (!hasData) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Monthly reflection unlocks after a few weeks of check-ins.
      </p>
    );
  }

  return (
    <section className="hc-coach-panel mt-8 overflow-hidden rounded-2xl border border-[var(--accent)]/20 bg-[color-mix(in_srgb,var(--accent)_5%,var(--card))] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
            Coach · Monthly reflection
          </p>
          <h2
            className="mt-1 text-xl text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Patterns from your last {insights.weeks} weeks
          </h2>
        </div>
        <span
          className={`hc-coach-pulse mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] ${busy ? "is-active" : ""}`}
          aria-hidden
        />
      </div>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
        A calm read on your recent rhythm — best days, difficulty, and trend.
        When you consent, habit names plus aggregate counts leave this device —
        never individual check-ins or dates.
      </p>

      {busy ? (
        <div className="hc-coach-listening mt-5 space-y-3" aria-live="polite">
          <p className="text-sm text-[var(--foreground)]">
            Looking for patterns…
          </p>
          <div className="space-y-2">
            <div className="hc-coach-skeleton h-16 rounded-xl" />
            <div
              className="hc-coach-skeleton h-16 rounded-xl"
              style={{ animationDelay: "120ms" }}
            />
          </div>
        </div>
      ) : null}

      {!busy && reflection ? (
        <div key={revealKey} className="mt-5 space-y-3">
          <h3 className="hc-coach-stagger text-base font-semibold text-[var(--foreground)]">
            {reflection.headline}
          </h3>
          <ul className="space-y-2">
            {reflection.observations.map((obs, index) => (
              <li
                key={index}
                className="hc-coach-stagger rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/90 p-4 text-sm leading-relaxed text-[var(--muted)]"
                style={{ animationDelay: `${120 + index * 160}ms` }}
              >
                {obs}
              </li>
            ))}
          </ul>
          {reflection.encouragement ? (
            <p
              className="hc-coach-stagger text-sm leading-relaxed text-[var(--foreground)]"
              style={{
                animationDelay: `${120 + reflection.observations.length * 160}ms`,
              }}
            >
              {reflection.encouragement}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => setConsent(true)}
            className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Refresh reflection
          </button>
        </div>
      ) : null}

      {!busy && !reflection ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setConsent(true)}
          className="hc-interactive mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          Reflect on my month
        </button>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {consent ? (
        <AiConsentModal
          title="Use Monthly Reflection?"
          description="We'll send habit names plus aggregate counts (per-habit totals, best weekday, difficulty mix, trend) — never individual check-ins or dates."
          busy={busy}
          onConfirm={() => void runCoach()}
          onCancel={() => setConsent(false)}
        />
      ) : null}
    </section>
  );
}
