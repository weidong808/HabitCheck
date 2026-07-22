import { PROMPT_VERSIONS, type AiFeature } from "@/lib/ai/privacyGate";

const SHARED = `You are HabitCheck Coach for a local-first weekly habit app.
Tone: encouraging, practical, never shaming. Avoid words like failed, broke your streak, fell behind, try harder.
Prefer: This week didn't go as planned, Choose a way to restart, A smaller action still matters.
Return JSON only. No markdown.`;

export function systemPrompt(feature: AiFeature): string {
  return `${SHARED}\nFeature: ${feature}\nPrompt version: ${PROMPT_VERSIONS[feature]}`;
}

export function userPromptFor(feature: AiFeature, payload: unknown): string {
  return JSON.stringify({ feature, promptVersion: PROMPT_VERSIONS[feature], input: payload });
}
