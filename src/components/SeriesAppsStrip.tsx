import {
  READINESS_URL,
  RETIRECHECK_URL,
  SITE_SERIES_NAME,
  SLEEPCHECK_URL,
} from "@/lib/brand";

const SIBLINGS = [
  { name: "SleepCheck", href: SLEEPCHECK_URL },
  { name: "Readiness", href: READINESS_URL },
  { name: "RetireCheck", href: RETIRECHECK_URL },
] as const;

/** Compact series framing — sibling apps without cluttering the first paint. */
export function SeriesAppsStrip({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label={`Also in ${SITE_SERIES_NAME}`}
      className={`hc-fade border-t border-[var(--border)]/70 pt-5 ${className}`}
    >
      <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--muted)] uppercase">
        Also in {SITE_SERIES_NAME}
      </p>
      <ul className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-[var(--muted)]">
        {SIBLINGS.map((app, i) => (
          <li key={app.href} className="flex items-center gap-x-1">
            {i > 0 ? <span aria-hidden>·</span> : null}
            <a
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)]/85 underline-offset-2 hover:text-[var(--accent)] hover:underline"
            >
              {app.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
