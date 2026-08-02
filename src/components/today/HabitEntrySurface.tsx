"use client";

import { HabitProductPreview } from "@/components/today/HabitProductPreview";
import { SeriesAppsStrip } from "@/components/SeriesAppsStrip";
import {
  APP_HUMAN_HEADLINE,
  APP_NAME,
  APP_PRIMARY_CTA_LABEL,
  APP_SERIES_LABEL,
  APP_STORY_CTA_LABEL,
  APP_TRUST_LINE,
  SITE_CASE_STUDY_URL,
} from "@/lib/brand";

type HabitEntrySurfaceProps = {
  onStart: () => void;
};

/** First-run composition — brand, human promise, product proof, dual CTAs. */
export function HabitEntrySurface({ onStart }: HabitEntrySurfaceProps) {
  return (
    <section
      className="hc-entry relative isolate -mx-5 overflow-hidden px-5 sm:-mx-6 sm:px-6"
      aria-labelledby="hc-entry-heading"
    >
      <div className="hc-entry-glow" aria-hidden />
      <div className="relative z-10">
        <p className="hc-rise font-mono text-[11px] tracking-[0.18em] text-[var(--accent)] uppercase">
          {APP_SERIES_LABEL}
        </p>
        <p
          className="hc-rise-delay mt-4 text-2xl leading-none tracking-tight text-[var(--foreground)] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {APP_NAME}
        </p>
        <h1
          id="hc-entry-heading"
          className="hc-rise-delay mt-4 max-w-[18ch] text-[1.85rem] leading-[1.12] tracking-tight text-balance text-[var(--foreground)] sm:text-[2.35rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {APP_HUMAN_HEADLINE}
        </h1>
        <p className="hc-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Flexible weekly targets, kind recovery, and no fake checkmarks.
        </p>
        <div className="hc-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="main-cta"
            onClick={onStart}
            className="hc-interactive inline-flex min-h-12 items-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-foreground)]"
          >
            {APP_PRIMARY_CTA_LABEL}
          </button>
          <a
            href={SITE_CASE_STUDY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hc-interactive inline-flex min-h-12 items-center rounded-lg border border-[var(--border-strong)] bg-[var(--card)]/70 px-5 text-sm font-medium text-[var(--foreground)]"
          >
            {APP_STORY_CTA_LABEL}
          </a>
        </div>
        <p className="hc-fade mt-5 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
          {APP_TRUST_LINE}
        </p>

        <div className="hc-rise-delay-2 mt-8">
          <HabitProductPreview />
        </div>

        <SeriesAppsStrip className="mt-8" />
      </div>
    </section>
  );
}
