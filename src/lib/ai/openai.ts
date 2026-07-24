import OpenAI from "openai";
import type { AiFeature } from "@/lib/ai/privacyGate";
import { systemPrompt, userPromptFor } from "@/lib/ai/prompts";

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const enabled = process.env.AI_COACH_ENABLED !== "false";
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 900);
  return { apiKey, model, enabled, maxOutputTokens, configured: Boolean(apiKey) };
}

export async function generateJson(args: {
  feature: AiFeature;
  payload: unknown;
}): Promise<{ text: string; modelId: string }> {
  const { apiKey, model, maxOutputTokens } = getOpenAIConfig();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    max_completion_tokens: maxOutputTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(args.feature) },
      { role: "user", content: userPromptFor(args.feature, args.payload) },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return { text, modelId: completion.model || model };
}

export function summarizeProviderError(err: unknown): string {
  if (!err || typeof err !== "object") return "provider_error";
  const e = err as { status?: number; code?: string; message?: string };
  // Never echo provider messages — they can include partial API keys.
  return [e.status && `status_${e.status}`, e.code || "provider_error"]
    .filter(Boolean)
    .join(":");
}
