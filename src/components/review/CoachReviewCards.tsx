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

  const eligible = reviews.filter((r) => r.closedWeeks.length > 0).slice(0, 3);

  async function runCoach() {
    if (eligible.length === 0) return;
    setBusy(true);
    setError(null);
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
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_0_color-mix(in_srgb,var(--foreground)_4%,transparent)]">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
        Coach · Weekly review
      </p>
      <h2
        className="mt-1 text-xl text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Insight cards
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
        Optional coaching on closed-week summaries — Facts stay local until you
        consent.
      </p>

      {cards ? (
        <div className="mt-4 space-y-3">
          {cards.map((card) => (
            <article
              key={`${card.theme}-${card.title}`}
              className="rounded-xl bg-[var(--background)]/80 p-4"
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
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
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
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => setConsent(true)}
          className="hc-interactive mt-4 inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium disabled:opacity-50"
        >
          {busy ? "Coaching…" : "Ask for coach cards"}
        </button>
      )}

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
