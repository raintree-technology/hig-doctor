#!/usr/bin/env python3
"""
Batch-generate the full reference corpus from cached DocC JSON into a staging
tree mirroring skills/<skill>/references/<slug>.md.

Placement: leaf topics reuse the existing repo's slug->skill mapping. Topics
with no existing file (genuinely new) are reported for manual placement.
Collection/navigation pages (no prose) are skipped — they map to SKILL.md
indexes, not reference files.
"""
import argparse
import glob
import json
import os
from convert import convert

# New leaf topics and the skill folder they should live in (decided from the
# live HIG hierarchy). Nav/collection pages are intentionally excluded.
NEW_TOPIC_PLACEMENT = {
    # design-principles: getting-started -> foundations skill
    "design-principles": "hig-foundations",
    # snippets: Apple hierarchy is components > system-experiences
    "snippets": "hig-components-system",
    # designing-for-iphone-duo: new platform page (Sept 2026) -> platforms skill
    "designing-for-iphone-duo": "hig-platforms",
    # apple-in-app-purchase: Apple renamed in-app-purchase (Oct 2026) -> technologies skill
    "apple-in-app-purchase": "hig-technologies",
}
# Live collection/navigation pages with no leaf prose — skip (handled by SKILL.md).
SKIP_SLUGS = {
    "", "foundations", "components", "patterns", "inputs", "technologies",
    "getting-started", "content", "layout-and-organization", "menus-and-actions",
    "navigation-and-search", "presentation", "selection-and-input", "status",
    "system-experiences",
}


def existing_map(repo_root):
    out = {}
    for path in glob.glob(os.path.join(repo_root, "skills", "*", "references", "*.md")):
        slug = os.path.splitext(os.path.basename(path))[0]
        out[slug] = path.split(os.sep)[-3]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default=".hig-cache/manifest.json")
    ap.add_argument("--cache", default=".hig-cache/json")
    ap.add_argument("--repo-root", default="../..")
    ap.add_argument("--staging", default=".hig-cache/staging")
    ap.add_argument("--snapshot", default="2026-06-11")
    args = ap.parse_args()

    manifest = json.load(open(args.manifest))
    placement = existing_map(args.repo_root)
    placement.update(NEW_TOPIC_PLACEMENT)

    generated, skipped, unplaced, anomalies = [], [], [], []
    for topic in manifest["topics"]:
        slug = topic["slug"]
        if slug in SKIP_SLUGS:
            skipped.append(slug)
            continue
        skill = placement.get(slug)
        if not skill:
            unplaced.append(slug)
            continue
        md = convert(os.path.join(args.cache, slug + ".json"), slug, args.snapshot)
        words = len(md.split())
        if words < 60:  # frontmatter+footer alone is ~50 words; flag thin pages
            anomalies.append((slug, words))
        out_dir = os.path.join(args.staging, "skills", skill, "references")
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, slug + ".md"), "w") as f:
            f.write(md)
        generated.append((slug, skill, words))

    print(f"Generated: {len(generated)}  Skipped(nav): {len(skipped)}  "
          f"Unplaced(new, needs decision): {len(unplaced)}")
    if unplaced:
        print("\n  UNPLACED (no skill mapping):")
        for s in unplaced:
            print(f"    ? {s}")
    if anomalies:
        print("\n  THIN PAGES (<60 words — check conversion):")
        for s, w in anomalies:
            print(f"    ! {s} ({w} words)")
    total_words = sum(w for _, _, w in generated)
    print(f"\n  Total words across corpus: {total_words:,}")
    print(f"  Staging tree: {args.staging}/skills/*/references/")


if __name__ == "__main__":
    main()
