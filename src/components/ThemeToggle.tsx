"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const ready = mounted && resolvedTheme != null;
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={
        !ready
          ? "Toggle color theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      disabled={!ready}
      onClick={() => {
        if (!ready) return;
        setTheme(isDark ? "light" : "dark");
      }}
    >
      <span className="sr-only">Toggle theme</span>
      {ready ? (
        isDark ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )
      ) : (
        <span className="theme-toggle-placeholder" aria-hidden />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />
    </svg>
  );
}
