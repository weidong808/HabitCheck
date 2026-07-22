import Link from "next/link";
import {
  APP_NAME,
  APP_SERIES_LABEL,
  APP_TAGLINE,
  APP_TRUST_LINE,
  WELLNESS_DISCLAIMER,
} from "@/lib/brand";

export default function HomePage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {APP_SERIES_LABEL}
      </p>
      <h1
        className="mt-3 text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {APP_NAME}
      </h1>
      <p className="mt-3 text-lg text-[var(--muted)]">{APP_TAGLINE}</p>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
        Local-first weekly habits with kind recovery and a Facts vs Coach
        design. Scaffold is live — tracking and AI coach surfaces land next.
      </p>

      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Facts
        </p>
        <p className="mt-2 text-base text-[var(--foreground)]">
          Today&apos;s check-in and week progress will appear here (P2).
        </p>
        <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach
        </p>
        <p className="mt-2 text-base text-[var(--muted)]">
          Habit Starter, Comeback Coach, Weekly Review, and Plan Adjuster ship
          in later phases — always opt-in, summaries only.
        </p>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
        {APP_TRUST_LINE}
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">{WELLNESS_DISCLAIMER}</p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)]"
        >
          Privacy
        </Link>
        <Link
          href="/review"
          className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)]"
        >
          Review (stub)
        </Link>
      </div>
    </main>
  );
}
