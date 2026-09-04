import { describe, expect, test } from "bun:test";
import { detectPatterns } from "@hig-core/patterns";
import { SAMPLES } from "./audit-demo-fixtures";

describe("audit demo fixtures", () => {
  test("the HIG-aligned React sample has no concern findings", () => {
    const sample = SAMPLES["react-good"];

    const concerns = detectPatterns(sample.code, sample.filename).filter(
      (finding) => finding.type === "concern",
    );

    expect(concerns).toEqual([]);
  });
});
