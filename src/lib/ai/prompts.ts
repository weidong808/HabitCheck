import { PROMPT_VERSIONS, type AiFeature } from "@/lib/ai/privacyGate";

const SHARED = `You are HabitCheck Coach for a local-first weekly habit app.
Tone: encouraging, practical, never shaming. Avoid words like failed, broke your streak, fell behind, try harder.
Prefer: This week didn't go as planned, Choose a way to restart, A smaller action still matters.
Return JSON only. No markdown. Use the exact property names shown in the schema.`;

const OUTPUT_SCHEMA: Record<AiFeature, string> = {
  habit_starter: `{"name":"string","weeklyTarget":1-7,"motivation":"string","smallerVersion":"string","firstTwoWeeksRamp":["string","string"]}`,
  comeback: `{"options":["string","string"],"encouragement":"string"}`,
  weekly_review: `{"cards":[{"theme":"consistency|recoveries|difficulty","title":"string","body":"string"},{"theme":"...","title":"...","body":"..."},{"theme":"...","title":"...","body":"..."}],"nextWeekMove":"string"}`,
  plan_adjuster: `{"explanation":"string"}`,
  smaller_version: `{"smallerVersion":"string"}`,
};

export function systemPrompt(feature: AiFeature): string {
  return `${SHARED}\nFeature: ${feature}\nPrompt version: ${PROMPT_VERSIONS[feature]}\nRequired JSON shape: ${OUTPUT_SCHEMA[feature]}`;
}

export function userPromptFor(feature: AiFeature, payload: unknown): string {
  return JSON.stringify({
    feature,
    promptVersion: PROMPT_VERSIONS[feature],
    requiredShape: OUTPUT_SCHEMA[feature],
    input: payload,
  });
}
