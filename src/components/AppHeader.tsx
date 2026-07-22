"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_NAME, APP_TAGLINE, SITE_SERIES_NAME } from "@/lib/brand";

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/", label: "Today", exact: true },
  { href: "/review", label: "Review" },
  { href: "/privacy", label: "Privacy" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          aria-label={`${APP_NAME} home`}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]/50"
            aria-hidden
          >
            H
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-lg leading-none text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)] sm:text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {APP_NAME}
            </span>
            <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.14em] text-[var(--muted)] uppercase">
              {SITE_SERIES_NAME} · {APP_TAGLINE}
            </span>
          </span>
        </Link>

        <nav
          className="flex shrink-0 items-center gap-1 text-sm sm:gap-2"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-md px-2.5 py-1.5 font-medium text-[var(--foreground)]"
                    : "rounded-md px-2.5 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                }
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
