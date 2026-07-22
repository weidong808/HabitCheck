import { describe, expect, it } from "vitest";
import {
  comebackResponseSchema,
  privacyGate,
  starterResponseSchema,
  weeklyReviewResponseSchema,
} from "./privacyGate";

describe("privacyGate", () => {
  it("accepts whitelisted starter payload", () => {
    const gated = privacyGate({
      feature: "habit_starter",
      consented: true,
      goalText: "Walk more in the mornings",
    });
    expect(gated.feature).toBe("habit_starter");
  });

  it("rejects missing consent", () => {
    expect(() =>
      privacyGate({
        feature: "habit_starter",
        consented: false,
        goalText: "Walk more",
      }),
    ).toThrow();
  });

  it("rejects unknown fields via schema (extra ignored by zod object strip)", () => {
    const gated = privacyGate({
      feature: "habit_starter",
      consented: true,
      goalText: "Sleep earlier",
      secretJournal: "should not matter",
    });
    expect(gated).not.toHaveProperty("secretJournal");
  });
});

describe("response eval fixtures", () => {
  it("validates starter shape", () => {
    expect(
      starterResponseSchema.parse({
        name: "Morning walk",
        weeklyTarget: 4,
        motivation: "Feel clearer",
        smallerVersion: "Put on shoes",
        firstTwoWeeksRamp: ["Day 1: shoes", "Day 2: 5 minutes"],
      }),
    ).toBeTruthy();
  });

  it("validates comeback options 2–3", () => {
    expect(
      comebackResponseSchema.parse({
        options: ["Two-minute stretch", "Walk to the mailbox"],
        encouragement: "A smaller action still matters.",
      }).options,
    ).toHaveLength(2);
  });

  it("validates weekly review three cards", () => {
    const cards = weeklyReviewResponseSchema.parse({
      cards: [
        { theme: "consistency", title: "Steady", body: "You hit most days." },
        { theme: "recoveries", title: "Comebacks", body: "You restarted well." },
        { theme: "difficulty", title: "Load", body: "Keep it manageable." },
      ],
      nextWeekMove: "Keep the same target and protect one easy win.",
    });
    expect(cards.cards).toHaveLength(3);
  });
});
