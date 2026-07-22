import { describe, test, expect } from "bun:test";
import { refineSwift } from "./swift-structural";
import { analyzeFile } from "../analyze";
import { detectPatterns } from "../patterns";

describe("swift-structural engine", () => {
  test("drops Image findings when an accessibility modifier is chained (even across lines)", () => {
    const code = `Image(systemName: "star")\n  .resizable()\n  .accessibilityLabel("Favorite")`;
    expect(analyzeFile(code, "V.swift").filter(m => m.ruleId === "swift/image-without-a11y")).toEqual([]);
  });

  test("keeps Image findings without any a11y modifier and tags them swift-structural", () => {
    const code = `Image(systemName: "star").frame(width: 20, height: 20)`;
    const hit = analyzeFile(code, "V.swift").find(m => m.ruleId === "swift/image-without-a11y");
    expect(hit?.engine).toBe("swift-structural");
  });

  test("drops onTapGesture findings when the chain carries a trait/label", () => {
    const code = `Text("Go")\n  .onTapGesture { go() }\n  .accessibilityAddTraits(.isButton)`;
    expect(analyzeFile(code, "V.swift").filter(m => m.ruleId === "swift/on-tap-gesture-without-traits")).toEqual([]);
  });

  test("keeps a bare onTapGesture and tags it swift-structural", () => {
    const code = `Text("Go").onTapGesture { go() }`;
    const hit = analyzeFile(code, "V.swift").find(m => m.ruleId === "swift/on-tap-gesture-without-traits");
    expect(hit?.engine).toBe("swift-structural");
  });

  test("is not fooled by an accessibilityLabel inside a comment or string", () => {
    const code = `Image(systemName: "star") // .accessibilityLabel("nope")\n  .frame(width: 20)`;
    const hit = analyzeFile(code, "V.swift").find(m => m.ruleId === "swift/image-without-a11y");
    expect(hit?.engine).toBe("swift-structural");
  });

  test("passes non-Swift matches through untouched", () => {
    const matches = detectPatterns('<img src="x">', "a.html");
    expect(refineSwift(matches, "")).toEqual(matches);
  });
});
