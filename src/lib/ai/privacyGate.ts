import { z } from "zod";

export const PROMPT_VERSIONS = {
  habit_starter: "v1",
  comeback: "v1",
  weekly_review: "v1",
  plan_adjuster: "v1",
  smaller_version: "v1",
} as const;

export type AiFeature = keyof typeof PROMPT_VERSIONS;

export const difficultySchema = z.enum(["easy", "manageable", "hard"]);

export const aiHabitSummarySchema = z.object({
  name: z.string().max(80),
  weeklyTarget: z.number().int().min(1).max(7),
  smallerVersion: z.string().max(200),
  week: z
    .object({
      weekStart: z.string().max(12),
      doneCount: z.number().int().min(0).max(7),
      target: z.number().int().min(1).max(7),
      status: z.string().max(32),
      difficultyCounts: z.object({
        easy: z.number().int().min(0),
        manageable: z.number().int().min(0),
        hard: z.number().int().min(0),
      }),
      successfulRecoveriesInWeek: z.number().int().min(0),
      atRiskFired: z.boolean(),
    })
    .optional(),
});

export const starterRequestSchema = z.object({
  feature: z.literal("habit_starter"),
  consented: z.literal(true),
  goalText: z.string().min(3).max(400),
  constraints: z.string().max(200).optional(),
});

export const comebackRequestSchema = z.object({
  feature: z.literal("comeback"),
  consented: z.literal(true),
  summary: aiHabitSummarySchema,
  reason: z.enum(["at_risk", "missed"]),
});

export const weeklyReviewRequestSchema = z.object({
  feature: z.literal("weekly_review"),
  consented: z.literal(true),
  habits: z
    .array(
      z.object({
        summary: aiHabitSummarySchema,
        consistencyPct: z.number().min(0).max(200),
        recoveries: z.number().int().min(0),
        classification: z.string().max(24),
      }),
    )
    .min(1)
    .max(3),
});

export const planAdjusterRequestSchema = z.object({
  feature: z.literal("plan_adjuster"),
  consented: z.literal(true),
  summary: aiHabitSummarySchema,
  kind: z.enum(["up", "down"]),
  allowedTarget: z.number().int().min(1).max(7),
  currentTarget: z.number().int().min(1).max(7),
});

export const smallerVersionRequestSchema = z.object({
  feature: z.literal("smaller_version"),
  consented: z.literal(true),
  habitName: z.string().max(80),
  motivation: z.string().max(200).optional(),
  currentSmallerVersion: z.string().max(200).optional(),
});

export const aiRequestSchema = z.discriminatedUnion("feature", [
  starterRequestSchema,
  comebackRequestSchema,
  weeklyReviewRequestSchema,
  planAdjusterRequestSchema,
  smallerVersionRequestSchema,
]);

export type AiRequest = z.infer<typeof aiRequestSchema>;

export const starterResponseSchema = z.object({
  name: z.string().min(1).max(80),
  weeklyTarget: z.number().int().min(1).max(7),
  motivation: z.string().max(200),
  smallerVersion: z.string().min(1).max(200),
  firstTwoWeeksRamp: z.array(z.string().max(120)).min(2).max(6),
});

export const comebackResponseSchema = z.object({
  options: z.array(z.string().min(1).max(160)).min(2).max(3),
  encouragement: z.string().max(240),
});

export const weeklyReviewResponseSchema = z.object({
  cards: z
    .array(
      z.object({
        theme: z.enum(["consistency", "recoveries", "difficulty"]),
        title: z.string().max(80),
        body: z.string().max(400),
      }),
    )
    .length(3),
  nextWeekMove: z.string().max(240),
});

export const planAdjusterResponseSchema = z.object({
  explanation: z.string().min(1).max(400),
});

export const smallerVersionResponseSchema = z.object({
  smallerVersion: z.string().min(1).max(200),
});

/** Strip any unexpected keys — only whitelist leaves the client. */
export function privacyGate(payload: unknown): AiRequest {
  const parsed = aiRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("privacyGate rejected payload");
  }
  return parsed.data;
}
