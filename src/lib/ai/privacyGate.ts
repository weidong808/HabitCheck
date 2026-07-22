/**
 * Privacy gate stub — real whitelist + provider calls in P5.
 */
export type AiFeature =
  | "habit_starter"
  | "comeback"
  | "weekly_review"
  | "plan_adjuster"
  | "smaller_version";

export function privacyGateEnabled(): boolean {
  return false;
}

export function assertPrivacyGateReady(feature: AiFeature): never {
  throw new Error(
    `privacyGate is not live yet (requested: ${feature}). Scaffold phase only.`,
  );
}
