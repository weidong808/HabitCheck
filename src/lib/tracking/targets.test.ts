import { describe, expect, it } from "vitest";
import {
  clampWeeklyTarget,
  suggestedTargetDown,
  suggestedTargetUp,
} from "./targets";

describe("clampWeeklyTarget", () => {
  it("keeps values in 1–7", () => {
    expect(clampWeeklyTarget(0)).toBe(1);
    expect(clampWeeklyTarget(8)).toBe(7);
    expect(clampWeeklyTarget(3.6)).toBe(4);
  });
});

describe("deterministic plan adjuster numbers", () => {
  it("steps down and up without leaving 1–7", () => {
    expect(suggestedTargetDown(1)).toBe(1);
    expect(suggestedTargetDown(4)).toBe(3);
    expect(suggestedTargetUp(7)).toBe(7);
    expect(suggestedTargetUp(4)).toBe(5);
  });
});
