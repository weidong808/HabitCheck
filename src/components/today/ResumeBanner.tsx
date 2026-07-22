"use client";

type ResumeBannerProps = {
  names: string[];
  onDismiss: () => void;
};

export function ResumeBanner({ names, onDismiss }: ResumeBannerProps) {
  if (names.length === 0) return null;

  return (
    <div
      className="mb-6 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3"
      role="status"
    >
      <p className="text-sm text-[var(--foreground)]">
        Welcome back —{" "}
        {names.length === 1
          ? `${names[0]} is active again`
          : `${names.join(", ")} are active again`}
        . What feels realistic now?
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
