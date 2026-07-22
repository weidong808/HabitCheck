import type { Metadata } from "next";
import Link from "next/link";
import {
  APP_NAME,
  APP_SERIES_LABEL,
  APP_URL,
  SITE_HOME_URL,
  WELLNESS_DISCLAIMER,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy · ${APP_NAME}`,
  description: `How ${APP_NAME} handles local habit data, optional AI coach calls, and page analytics.`,
};

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {APP_SERIES_LABEL} · Privacy
      </p>
      <h1
        className="mt-2 text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Privacy
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
        What stays on your device, when the AI coach may send summaries, and how
        analytics work.
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-[var(--muted)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Habit data (Facts)
          </h2>
          <p className="mt-2">
            Habit definitions, check-ins, and recovery events stay in this
            browser (IndexedDB). There is no account and no cloud sync in v1.
            Weekly consistency, misses, and recoveries are computed in app code
            — not by a model.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Optional AI coach
          </h2>
          <p className="mt-2">
            Coach features (Habit Starter, Comeback Coach, Weekly Review, Plan
            Adjuster, Smart smaller-version) are opt-in per action. When you
            consent, only selected structured summaries leave the device through
            a privacy gate — not full history and not free-form journals. The
            model proposes language and options; it does not rewrite your
            scores or auto-change targets. If the model fails or you decline,
            Facts and tracking still work.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Analytics
          </h2>
          <p className="mt-2">
            The live site at{" "}
            <a
              href={APP_URL}
              className="text-[var(--accent)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {APP_URL.replace("https://", "")}
            </a>{" "}
            may record privacy-friendly page views via Vercel Analytics. Habit
            payloads are never sent as analytics events.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Wellness
          </h2>
          <p className="mt-2">{WELLNESS_DISCLAIMER}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this educational showcase: visit{" "}
            <a
              href={SITE_HOME_URL}
              className="text-[var(--accent)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              weidong-shi.com
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Back to Today
        </Link>
      </p>
    </main>
  );
}
