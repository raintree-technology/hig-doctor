import { describe, test, expect } from "bun:test";
import { doccUrl, hashContent } from "./hig-drift";

describe("hig-drift helpers", () => {
  test("doccUrl maps a HIG design URL to its DocC JSON endpoint", () => {
    expect(doccUrl("https://developer.apple.com/design/human-interface-guidelines/color")).toBe(
      "https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json",
    );
    // Trailing slash tolerated.
    expect(doccUrl("https://developer.apple.com/design/human-interface-guidelines/digital-crown/")).toBe(
      "https://developer.apple.com/tutorials/data/design/human-interface-guidelines/digital-crown.json",
    );
  });

  test("doccUrl rejects non-HIG and empty-slug URLs", () => {
    expect(doccUrl("https://example.com/foo")).toBeNull();
    expect(doccUrl("https://developer.apple.com/design/human-interface-guidelines/")).toBeNull();
  });

  test("hashContent extracts text nodes and is whitespace-insensitive", () => {
    const doc = {
      abstract: [{ type: "text", text: "Use color   thoughtfully." }],
      primaryContentSections: [
        { content: [{ type: "paragraph", inlineContent: [{ type: "text", text: "System   colors\nadapt." }] }] },
      ],
    };
    // Same content, different internal whitespace → same hash.
    const doc2 = {
      abstract: [{ type: "text", text: "Use color thoughtfully." }],
      primaryContentSections: [
        { content: [{ type: "paragraph", inlineContent: [{ type: "text", text: "System colors adapt." }] }] },
      ],
    };
    expect(hashContent(doc2)).toBe(hashContent(doc));
  });

  test("hashContent changes when prose changes", () => {
    const a = hashContent({ abstract: [{ type: "text", text: "Before." }] });
    const b = hashContent({ abstract: [{ type: "text", text: "After." }] });
    expect(a).not.toBe(b);
  });

  test("hashContent ignores image/identifier churn", () => {
    const base = { abstract: [{ type: "text", text: "Stable copy." }] };
    const withRefs = { ...base, references: { "new-img.png": { type: "image" } }, identifier: { url: "doc://changed" } };
    expect(hashContent(withRefs)).toBe(hashContent(base));
  });
});
