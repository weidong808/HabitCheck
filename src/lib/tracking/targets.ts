/**
 * Pure tracking helpers — week math and recovery rules expand in P1.
 * Tests are the scoring contract (MVP v5).
 */

export function clampWeeklyTarget(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(7, Math.max(1, Math.round(n)));
}

export function suggestedTargetDown(current: number): number {
  return clampWeeklyTarget(current - 1);
}

export function suggestedTargetUp(current: number): number {
  return clampWeeklyTarget(current + 1);
}
