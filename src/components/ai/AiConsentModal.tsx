"use client";

type AiConsentProps = {
  title: string;
  description: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AiConsentModal({
  title,
  description,
  busy,
  onConfirm,
  onCancel,
}: AiConsentProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach · consent
        </p>
        <h2
          id="ai-consent-title"
          className="mt-2 text-xl text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Only selected summaries leave this device for this action. Facts stay
          local. You can cancel anytime.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
          >
            Continue with Coach
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
