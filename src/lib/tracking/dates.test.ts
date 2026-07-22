import { describe, expect, it } from "vitest";
import {
  addDays,
  endOfWeekSunday,
  isWeekClosed,
  startOfWeekMonday,
  weekdayMonday0,
} from "./dates";

describe("dates", () => {
  it("treats Monday as weekday 0", () => {
    expect(weekdayMonday0("2026-07-20")).toBe(0); // Mon
    expect(weekdayMonday0("2026-07-26")).toBe(6); // Sun
  });

  it("finds Monday week start", () => {
    expect(startOfWeekMonday("2026-07-22")).toBe("2026-07-20");
    expect(startOfWeekMonday("2026-07-20")).toBe("2026-07-20");
    expect(startOfWeekMonday("2026-07-26")).toBe("2026-07-20");
  });

  it("ends week on Sunday", () => {
    expect(endOfWeekSunday("2026-07-20")).toBe("2026-07-26");
  });

  it("closes week only after Sunday", () => {
    expect(isWeekClosed("2026-07-20", "2026-07-26")).toBe(false);
    expect(isWeekClosed("2026-07-20", "2026-07-27")).toBe(true);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
  });
});
