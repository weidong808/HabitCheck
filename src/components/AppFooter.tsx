import Link from "next/link";
import { SiteHomeLink } from "@/components/SiteHomeLink";
import {
  APP_NAME,
  GITHUB_REPO_URL,
  READINESS_URL,
  RETIRECHECK_URL,
  ROADMAP_URL,
  SITE_BRAND_NAME,
  SITE_SERIES_NAME,
  SLEEPCHECK_URL,
  WELLNESS_DISCLAIMER,
} from "@/lib/brand";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[var(--border)]/80 pt-8 text-sm text-[var(--muted)]">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p
              className="text-lg text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {APP_NAME}
            </p>
            <p className="mt-2 leading-relaxed">{WELLNESS_DISCLAIMER}</p>
            <p className="mt-3 font-mono text-[11px] tracking-[0.12em] uppercase">
              {SITE_SERIES_NAME} · App #4 · {SITE_BRAND_NAME}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--foreground)] uppercase">
                App
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[var(--foreground)]"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <a
                    href={GITHUB_REPO_URL}
                    className="hover:text-[var(--foreground)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={ROADMAP_URL}
                    className="hover:text-[var(--foreground)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--foreground)] uppercase">
                Series
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <SiteHomeLink className="hover:text-[var(--foreground)]" />
                </li>
                <li>
                  <a
                    href={RETIRECHECK_URL}
                    className="hover:text-[var(--foreground)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    RetireCheck
                  </a>
                </li>
                <li>
                  <a
                    href={SLEEPCHECK_URL}
                    className="hover:text-[var(--foreground)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SleepCheck
                  </a>
                </li>
                <li>
                  <a
                    href={READINESS_URL}
                    className="hover:text-[var(--foreground)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Readiness
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-[var(--border)] py-6 text-xs">
          © {year} {SITE_BRAND_NAME}. Personal lab / educational showcase.
        </p>
      </div>
    </footer>
  );
}
