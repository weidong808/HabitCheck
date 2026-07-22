import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, APP_SERIES_LABEL } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Weekly review · ${APP_NAME}`,
  description: "Facts and Coach weekly review — scaffold stub.",
};

export default function ReviewPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {APP_SERIES_LABEL} · Review
      </p>
      <h1
        className="mt-3 text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Weekly review
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
        After a week ends, Facts (consistency, recoveries, difficulty) will
        appear here. Coach insight cards ship with the AI platform phases.
      </p>
      <p className="mt-8">
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
