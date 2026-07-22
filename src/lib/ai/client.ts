import type { AiFeature, AiRequest } from "@/lib/ai/privacyGate";

export type AiClientResult<T> =
  | { ok: true; data: T; promptVersion: string; modelId?: string }
  | { ok: false; error: string; code?: string };

export async function callCoach<T>(
  body: AiRequest,
): Promise<AiClientResult<T>> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      data?: T;
      error?: string;
      code?: string;
      promptVersion?: string;
      modelId?: string;
    };
    if (!res.ok || !json.ok || !json.data) {
      return {
        ok: false,
        error: json.error || "Coach unavailable",
        code: json.code,
      };
    }
    return {
      ok: true,
      data: json.data,
      promptVersion: json.promptVersion || "v1",
      modelId: json.modelId,
    };
  } catch {
    return { ok: false, error: "Network error", code: "network" };
  }
}

export async function getCoachStatus(): Promise<{
  ready: boolean;
  features: AiFeature[];
}> {
  try {
    const res = await fetch("/api/ai");
    const json = (await res.json()) as {
      status?: string;
      features?: AiFeature[];
    };
    return {
      ready: json.status === "ready",
      features: json.features || [],
    };
  } catch {
    return { ready: false, features: [] };
  }
}
