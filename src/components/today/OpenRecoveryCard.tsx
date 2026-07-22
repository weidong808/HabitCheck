"use client";

import type { RecoveryEvent } from "@/lib/tracking/types";

type OpenRecoveryCardProps = {
  event: RecoveryEvent;
  today: string;
  busy?: boolean;
  onCompleteMicro: () => Promise<void>;
  onDismiss: () => Promise<void>;
};

export function OpenRecoveryCard({
  event,
  today,
  busy,
  onCompleteMicro,
  onDismiss,
}: OpenRecoveryCardProps) {
  const isMicro =
    event.kind === "smaller_version" || event.kind === "ai_comeback";

  return (
    <div className="mt-4 rounded-xl border border-[var(--accent)]/35 bg-[var(--accent)]/5 p-3">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">
        Open recovery
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]">
        {isMicro
          ? event.actionText ?? "Smaller version"
          : `Scheduled for ${event.scheduledFor}`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {isMicro ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCompleteMicro()}
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50"
          >
            I did it today ({today})
          </button>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Mark a full done on {event.scheduledFor} to complete this recovery.
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDismiss()}
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
