import type { Element, Root } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { EXIT, visit } from "unist-util-visit";
import { getTopicSlugSet } from "./topics";

const HIG_BASE =
  "https://developer.apple.com/design/human-interface-guidelines/";

/**
 * Strips the leading `<h1>` from rendered topic markdown. Every reference file
 * opens with `# <title>`, but the topic page template already renders that title
 * as the page's single `<h1>`. Removing the duplicate keeps a valid heading
 * outline (one h1 → h2 → h3), which the Website Spec requires.
 */
function rehypeStripLeadingH1() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "h1" && parent && typeof index === "number") {
        parent.children.splice(index, 1);
        return EXIT;
      }
    });
  };
}

/** Rewrites Apple HIG cross-reference URLs to internal /topics/ links when we have the topic */
function rehypeRewriteHigLinks() {
  return (tree: Root) => {
    const slugs = getTopicSlugSet();

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;

      // Match Apple HIG URLs like https://developer.apple.com/design/human-interface-guidelines/tab-bars
      if (href.startsWith(HIG_BASE)) {
        const rest = href.slice(HIG_BASE.length);
        // Extract slug (before any #anchor)
        const slug = rest.split("#")[0].replace(/\/$/, "");
        if (slug && slugs.has(slug)) {
          const anchor = rest.includes("#") ? `#${rest.split("#")[1]}` : "";
          node.properties.href = `/topics/${slug}${anchor}`;
          // Remove external link attributes
          delete node.properties.target;
          delete node.properties.rel;
        }
      }
    });
  };
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStripLeadingH1)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeRewriteHigLinks)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}
