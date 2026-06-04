import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("removes raw HTML and dangerous URL schemes", async () => {
    const html = await renderMarkdown(
      `<script>alert(1)</script>

<img src="https://example.com/image.png" onerror="alert(2)">

[click me](javascript:alert(3))`,
    );

    assert.doesNotMatch(html, /<script>/);
    assert.doesNotMatch(html, /onerror=/);
    assert.doesNotMatch(html, /javascript:/);
    assert.match(html, /click me/);
  });

  it("rewrites Apple HIG links to internal topic routes", async () => {
    const html = await renderMarkdown(
      "[Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)",
    );

    assert.match(html, /href="\/topics\/tab-bars"/);
  });

  it("strips the leading h1 so the page keeps a single h1 from the template", async () => {
    const html = await renderMarkdown(
      "# Tab bars\n\n## Best practices\n\nUse a sidebar on iPadOS.",
    );

    assert.doesNotMatch(html, /<h1/);
    assert.match(html, /<h2[^>]*>[\s\S]*Best practices/);
  });
});
