"use client";

import { APP_NAME, APP_SERIES_LABEL, APP_TRUST_LINE } from "@/lib/brand";

type HabitEntrySurfaceProps = {
  onStart: () => void;
};

/** First-run composition — brand, one headline, one promise, one CTA. */
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
        <h1
          id="hc-entry-heading"
          className="hc-rise-delay mt-5 max-w-[11ch] text-5xl leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {APP_NAME}
        </h1>
        <p className="hc-rise-delay-2 mt-5 max-w-md text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
          Recover without fake completion.
        </p>
        <div className="hc-rise-delay-2 mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="hc-interactive inline-flex min-h-12 items-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Start with one habit
          </button>
        </div>
        <p className="hc-fade mt-6 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
          {APP_TRUST_LINE}
        </p>
      </div>
    </section>
  );
}
