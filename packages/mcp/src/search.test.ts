import { describe, test, expect, beforeAll } from "bun:test";
import { join } from "node:path";
import { SearchIndex } from "./search";

const skillsDir = join(import.meta.dir, "..", "..", "..", "skills");

describe("SearchIndex (BM25 over the skills corpus)", () => {
  let index: SearchIndex;
  beforeAll(async () => {
    index = await SearchIndex.build(skillsDir);
  });

  test("indexes the whole corpus (skill overviews + reference topics)", () => {
    // 14 skills + 150+ reference topics.
    expect(index.size).toBeGreaterThan(150);
  });

  test("surfaces the color topic for a color query", () => {
    const results = index.search("dark mode semantic color contrast");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.topic === "color")).toBe(true);
  });

  test("returns topics with skill, score, and a snippet", () => {
    const [top] = index.search("accessibility voiceover labels");
    expect(top.skill).toMatch(/^hig-/);
    expect(top.score).toBeGreaterThan(0);
    expect(top.snippet.length).toBeGreaterThan(0);
  });

  test("respects the limit and orders by descending score", () => {
    const results = index.search("layout", 3);
    expect(results.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test("empty or stopword-only queries return nothing", () => {
    expect(index.search("")).toEqual([]);
    expect(index.search("the and of to")).toEqual([]);
  });
});
