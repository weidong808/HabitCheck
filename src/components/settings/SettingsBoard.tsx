"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { APP_NAME, APP_SERIES_LABEL } from "@/lib/brand";
import { getCoachStatus } from "@/lib/ai/client";
import {
  exportAllData,
  getOrCreateSettings,
  importAllData,
  setAiEnabled,
} from "@/lib/storage/settingsRepo";

export function SettingsBoard() {
  const [ready, setReady] = useState(false);
  const [aiEnabled, setAiEnabledState] = useState(true);
  const [coachReady, setCoachReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [settings, status] = await Promise.all([
      getOrCreateSettings(),
      getCoachStatus(),
    ]);
    setAiEnabledState(settings.aiEnabled);
    setCoachReady(status.ready);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load settings.",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function toggleAi(next: boolean) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await setAiEnabled(next);
      setAiEnabledState(next);
      setMessage(next ? "AI coach enabled." : "AI coach disabled on this device.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update AI setting.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const doc = await exportAllData();
      const blob = new Blob([JSON.stringify(doc, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habitcheck-export-${doc.exportedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Export downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File | null) {
    if (!file) return;
    const confirmed = window.confirm(
      "Replace all HabitCheck data on this device with the import file? This cannot be undone.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as unknown;
      await importAllData(raw);
      await refresh();
      setMessage("Import complete — local data replaced.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <p className="text-[var(--muted)]">Loading settings…</p>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {APP_SERIES_LABEL} · Settings
      </p>
      <h1
        className="mt-3 text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Settings
      </h1>
      <p className="mt-3 text-base text-[var(--muted)]">
        Local AI preference and backup for {APP_NAME}. Habit Facts never leave
        this device unless you consent to a coach action.
      </p>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2
          className="text-lg text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AI coach
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Master toggle for Habit Starter, Comeback, Review cards, and Plan
          Adjuster explanations. Server still fail-closes without{" "}
          <code className="font-mono text-xs">OPENAI_API_KEY</code>.
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--muted)] uppercase">
          Server · {coachReady ? "ready" : "unavailable"}
        </p>
        <label className="mt-4 flex items-center gap-3 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={aiEnabled}
            disabled={busy}
            onChange={(e) => void toggleAi(e.target.checked)}
            className="h-4 w-4"
          />
          Enable AI coach on this device
        </label>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2
          className="text-lg text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Export & import
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Download a JSON backup, or replace local data with a previous export
          (confirm required).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleExport()}
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
          >
            Export JSON
          </button>
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-[var(--border)] px-3 text-sm">
            Import replace…
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = "";
                void handleImport(file);
              }}
            />
          </label>
        </div>
      </section>

      {message ? (
        <p className="mt-4 text-sm text-[var(--foreground)]" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

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
