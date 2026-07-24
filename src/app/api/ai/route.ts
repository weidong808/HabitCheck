import { NextResponse } from "next/server";
import {
  privacyGate,
  PROMPT_VERSIONS,
  starterResponseSchema,
  comebackResponseSchema,
  weeklyReviewResponseSchema,
  planAdjusterResponseSchema,
  smallerVersionResponseSchema,
  monthlyReflectionResponseSchema,
  type AiFeature,
} from "@/lib/ai/privacyGate";
import { generateJson, getOpenAIConfig, summarizeProviderError } from "@/lib/ai/openai";
import { checkRateLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function schemaFor(feature: AiFeature) {
  switch (feature) {
    case "habit_starter":
      return starterResponseSchema;
    case "comeback":
      return comebackResponseSchema;
    case "weekly_review":
      return weeklyReviewResponseSchema;
    case "plan_adjuster":
      return planAdjusterResponseSchema;
    case "smaller_version":
      return smallerVersionResponseSchema;
    case "monthly_reflection":
      return monthlyReflectionResponseSchema;
  }
}

export async function GET() {
  const { configured, enabled, model } = getOpenAIConfig();
  return NextResponse.json({
    ok: true,
    status: configured && enabled ? "ready" : "unavailable",
    model,
    features: Object.keys(PROMPT_VERSIONS),
    promptVersions: PROMPT_VERSIONS,
  });
}

export async function POST(req: Request) {
  const started = Date.now();
  const { configured, enabled, model } = getOpenAIConfig();

  if (!enabled || !configured) {
    return NextResponse.json(
      {
        ok: false,
        error: "AI coach unavailable",
        code: "ai_unavailable",
      },
      { status: 503 },
    );
  }

  const limit = checkRateLimit(clientIp(req));
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limited", code: "rate_limited" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", code: "bad_request" },
      { status: 400 },
    );
  }

  let gated;
  try {
    gated = privacyGate(body);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload rejected by privacy gate", code: "privacy_gate" },
      { status: 400 },
    );
  }

  try {
    const { text, modelId } = await generateJson({
      feature: gated.feature,
      payload: gated,
    });
    const parsedJson = JSON.parse(text) as unknown;
    const schema = schemaFor(gated.feature);
    const validated = schema.safeParse(parsedJson);
    if (!validated.success) {
      console.info(
        JSON.stringify({
          event: "ai_schema_fail",
          feature: gated.feature,
          latencyMs: Date.now() - started,
        }),
      );
      return NextResponse.json(
        { ok: false, error: "Model output failed validation", code: "schema_fail" },
        { status: 502 },
      );
    }

    // Never trust model target numbers for plan adjuster — strip if present.
    const data =
      gated.feature === "plan_adjuster"
        ? { explanation: (validated.data as { explanation: string }).explanation }
        : validated.data;

    console.info(
      JSON.stringify({
        event: "ai_ok",
        feature: gated.feature,
        promptVersion: PROMPT_VERSIONS[gated.feature],
        modelId,
        latencyMs: Date.now() - started,
      }),
    );

    return NextResponse.json({
      ok: true,
      feature: gated.feature,
      promptVersion: PROMPT_VERSIONS[gated.feature],
      modelId,
      data,
    });
  } catch (err) {
    console.info(
      JSON.stringify({
        event: "ai_error",
        feature: gated.feature,
        error: summarizeProviderError(err),
        latencyMs: Date.now() - started,
      }),
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Coach request failed",
        code: "provider_error",
        model,
      },
      { status: 502 },
    );
  }
}
