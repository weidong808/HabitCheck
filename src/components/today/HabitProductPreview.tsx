import { WeekRing } from "@/components/today/WeekRing";

/**
 * Decorative Today-board preview for the first-run hero.
 * Shows real product chrome (rings, recovery, Done) — not an architecture diagram.
 */
export function HabitProductPreview() {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,var(--background))] p-3 shadow-[0_1px_0_color-mix(in_srgb,var(--foreground)_4%,transparent)] sm:p-4"
      aria-hidden
    >
      <div className="mb-3 flex items-end justify-between gap-2 px-1">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
            Facts
          </p>
          <p
            className="mt-0.5 text-lg text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            This week
          </p>
        </div>
        <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] uppercase">
          Example
        </p>
      </div>

      <div className="space-y-3">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-start gap-3">
            <WeekRing done={3} target={4} size={48} />
            <div className="min-w-0 flex-1">
              <p
                className="text-lg leading-snug text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Walk outside
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Clear head before screens.
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] uppercase">
                On track
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--accent)]">
            Done for today. Nice work.
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-start gap-3">
            <WeekRing done={1} target={3} size={48} />
            <div className="min-w-0 flex-1">
              <p
                className="text-lg leading-snug text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Read 10 pages
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Keep the streak honest.
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-[var(--muted)] uppercase">
                At risk
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-[var(--accent)]/25 bg-[color-mix(in_srgb,var(--accent)_7%,var(--background))] p-3">
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              This week is at risk. Choose a calm way to restart.
            </p>
            <span className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)]">
              Choose a recovery path
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
