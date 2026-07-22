import { describe, expect, it } from "vitest";
import { backfillDateWindow } from "./backfill";

describe("backfillDateWindow", () => {
  it("returns last 7 days ending at asOf", () => {
    expect(backfillDateWindow("2026-07-22", 7)).toEqual([
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
    ]);
  });
});
