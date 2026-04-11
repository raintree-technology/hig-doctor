import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeTopicSourceUrl } from "./topics";

describe("sanitizeTopicSourceUrl", () => {
  it("accepts Apple HIG source URLs", () => {
    assert.equal(
      sanitizeTopicSourceUrl(
        "https://developer.apple.com/design/human-interface-guidelines/tab-bars",
      ),
      "https://developer.apple.com/design/human-interface-guidelines/tab-bars",
    );
  });

  it("rejects non-Apple or unsafe URLs", () => {
    assert.equal(sanitizeTopicSourceUrl("javascript:alert(1)"), "");
    assert.equal(
      sanitizeTopicSourceUrl(
        "https://example.com/design/human-interface-guidelines/tab-bars",
      ),
      "",
    );
    assert.equal(
      sanitizeTopicSourceUrl("https://developer.apple.com/documentation/swift"),
      "",
    );
  });
});
