import { NextResponse } from "next/server";

/**
 * AI coach routes land in P5/P6 behind privacyGate.
 * P0 exposes a discovery stub so the API surface exists.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "stub",
    message:
      "HabitCheck AI coach endpoints are not live yet. Privacy-gated features ship in later phases.",
    features: [
      "habit_starter",
      "comeback",
      "weekly_review",
      "plan_adjuster",
      "smaller_version",
    ],
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "AI coach not enabled in this scaffold phase",
    },
    { status: 501 },
  );
}
