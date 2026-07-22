"use client";

import { useState } from "react";
import { AiConsentModal } from "@/components/ai/AiConsentModal";
import { callCoach } from "@/lib/ai/client";
import type { HabitReviewFacts } from "@/lib/tracking";

type CoachCard = {
  theme: "consistency" | "recoveries" | "difficulty";
  title: string;
  body: string;
};

type CoachReviewCardsProps = {
  reviews: HabitReviewFacts[];
  aiEnabled: boolean;
};

export function CoachReviewCards({
  reviews,
  aiEnabled,
}: CoachReviewCardsProps) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<CoachCard[] | null>(null);
  const [nextWeekMove, setNextWeekMove] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(0);

  const eligible = reviews.filter((r) => r.closedWeeks.length > 0).slice(0, 3);

  async function runCoach() {
    if (eligible.length === 0) return;
    setBusy(true);
    setError(null);
    setCards(null);
    setNextWeekMove(null);
    const result = await callCoach<{
      cards: CoachCard[];
      nextWeekMove: string;
    }>({
      feature: "weekly_review",
      consented: true,
      habits: eligible.map((r) => {
        const latest = r.closedWeeks[r.closedWeeks.length - 1]!;
        return {
          summary: {
            name: r.habit.name,
            weeklyTarget: r.habit.weeklyTarget,
            smallerVersion: r.habit.smallerVersion,
            week: {
              weekStart: latest.week.weekStart,
              doneCount: latest.week.doneCount,
              target: latest.week.target,
              status: latest.week.status,
              difficultyCounts: latest.week.difficultyCounts,
              successfulRecoveriesInWeek: latest.recoveriesCompleted,
              atRiskFired: latest.week.atRiskFired,
            },
          },
          consistencyPct: Math.round(latest.consistency * 100),
          recoveries: latest.recoveriesCompleted,
          classification: latest.classification,
        };
      }),
    });
    setBusy(false);
    setConsent(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevealKey((k) => k + 1);
    setCards(result.data.cards);
    setNextWeekMove(result.data.nextWeekMove);
  }

  if (!aiEnabled) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Coach cards are off — enable AI in Settings to request insight.
      </p>
    );
  }

  if (eligible.length === 0) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Coach cards unlock after at least one closed week.
      </p>
    );
  }

  return (
    <section className="hc-coach-panel mt-8 overflow-hidden rounded-2xl border border-[var(--accent)]/20 bg-[color-mix(in_srgb,var(--accent)_5%,var(--card))] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
            Coach · Weekly review
          </p>
          <h2
            className="mt-1 text-xl text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Insight cards
          </h2>
        </div>
        <span
          className={`hc-coach-pulse mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] ${busy ? "is-active" : ""}`}
          aria-hidden
        />
      </div>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
        A calm read on closed-week patterns — not a chat. Facts stay local until
        you consent; numbers never get rewritten.
      </p>

      {busy ? (
        <div className="hc-coach-listening mt-5 space-y-3" aria-live="polite">
          <p className="text-sm text-[var(--foreground)]">Listening to your Facts…</p>
          <div className="space-y-2">
            <div className="hc-coach-skeleton h-16 rounded-xl" />
            <div
              className="hc-coach-skeleton h-16 rounded-xl"
              style={{ animationDelay: "120ms" }}
            />
            <div
              className="hc-coach-skeleton h-10 rounded-xl"
              style={{ animationDelay: "240ms" }}
            />
          </div>
        </div>
      ) : null}

      {!busy && cards ? (
        <div key={revealKey} className="mt-5 space-y-3">
          {cards.map((card, index) => (
            <article
              key={`${card.theme}-${card.title}`}
              className="hc-coach-stagger rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/90 p-4"
              style={{ animationDelay: `${120 + index * 180}ms` }}
            >
              <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] uppercase">
                {card.theme}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                {card.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                {card.body}
              </p>
            </article>
          ))}
          {nextWeekMove ? (
            <p
              className="hc-coach-stagger text-sm leading-relaxed text-[var(--foreground)]"
              style={{ animationDelay: `${120 + cards.length * 180}ms` }}
            >
              <span className="font-medium">Next week move: </span>
              {nextWeekMove}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => setConsent(true)}
            className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Refresh coach cards
          </button>
        </div>
      ) : null}

      {!busy && !cards ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setConsent(true)}
          className="hc-interactive mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          Ask for coach cards
        </button>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {consent ? (
        <AiConsentModal
          title="Use Weekly Review Coach?"
          description="We'll send closed-week summaries only (consistency, recoveries, difficulty) — not full history."
          busy={busy}
          onConfirm={() => void runCoach()}
          onCancel={() => setConsent(false)}
        />
      ) : null}
    </section>
  );
}
