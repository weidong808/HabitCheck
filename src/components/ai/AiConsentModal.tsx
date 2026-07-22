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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_srgb,#0d1210_42%,transparent)] p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
    >
      <div className="hc-sheet w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_12px_40px_color-mix(in_srgb,#0d1210_18%,transparent)]">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] uppercase">
          Coach · consent
        </p>
        <h2
          id="ai-consent-title"
          className="mt-2 text-xl leading-snug text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
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
