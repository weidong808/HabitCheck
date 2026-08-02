"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHomeLink } from "@/components/SiteHomeLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_NAME, APP_TAGLINE, SITE_SERIES_NAME } from "@/lib/brand";

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/", label: "Today", exact: true },
  { href: "/review", label: "Review" },
  { href: "/settings", label: "Settings" },
  { href: "/privacy", label: "Privacy" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--header-bg)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          aria-label={`${APP_NAME} home`}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/25 bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))] text-sm font-semibold text-[var(--accent)] transition-[border-color,background-color] duration-160 group-hover:border-[var(--accent)]/55"
            aria-hidden
          >
            H
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-lg leading-none text-[var(--foreground)] transition-colors duration-160 group-hover:text-[var(--accent)] sm:text-xl"
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
          className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1"
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
                    ? "inline-flex min-h-11 items-center rounded-md px-2.5 py-1.5 font-medium text-[var(--foreground)] shadow-[inset_0_-2px_0_0_var(--accent)]"
                    : "inline-flex min-h-11 items-center rounded-md px-2.5 py-1.5 text-[var(--muted)] transition-colors duration-160 hover:text-[var(--foreground)] active:text-[var(--foreground)]"
                }
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <SiteHomeLink
            variant="compact"
            markSize={18}
            className="ml-0.5 hidden text-[var(--muted)] sm:inline-flex"
          />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
