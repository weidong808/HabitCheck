import { describe, expect, it } from "vitest";
import { buildExportDocument, parseExportDocument } from "./exportImport";

describe("exportImport", () => {
  it("round-trips habitcheck-export@2", () => {
    const doc = buildExportDocument({
      habits: [],
      checkIns: [],
      recoveryEvents: [],
      settings: {
        id: "settings",
        theme: "system",
        remindersEnabled: false,
        aiEnabled: true,
        onboardingCompleted: false,
      },
    });
    const parsed = parseExportDocument(JSON.parse(JSON.stringify(doc)));
    expect(parsed.version).toBe("habitcheck-export@2");
    expect(parsed.settings?.aiEnabled).toBe(true);
  });

  it("rejects wrong version", () => {
    expect(() =>
      parseExportDocument({ version: "habitcheck-export@1", habits: [], checkIns: [] }),
    ).toThrow(/Unsupported export version/);
  });
});
