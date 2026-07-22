"use client";

type WeekRingProps = {
  done: number;
  target: number;
  size?: number;
  label?: string;
};

export function WeekRing({
  done,
  target,
  size = 56,
  label,
}: WeekRingProps) {
  const safeTarget = Math.max(1, target);
  const ratio = Math.min(1, done / safeTarget);
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - ratio);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${done} of ${safeTarget} this week`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-[var(--foreground)]">
        {done}/{safeTarget}
      </span>
    </div>
  );
}
