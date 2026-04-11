import type { Element, Root } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getTopicSlugSet } from "./topics";

const HIG_BASE =
  "https://developer.apple.com/design/human-interface-guidelines/";

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
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeRewriteHigLinks)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}
