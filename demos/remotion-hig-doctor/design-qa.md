# Design QA

- Source visual truth: `design-qa-assets/hig-doctor-website.png`
- Implementation evidence: `design-qa-assets/linkedin-orchard-hero.png`, `design-qa-assets/linkedin-orchard-demo.png`
- Combined comparison: `design-qa-assets/site-video-comparison.png`
- Source viewport: current local HIG Doctor website in the Codex in-app browser
- Output viewports: LinkedIn 1080 × 1350; X 1080 × 1080; device scale 1
- States: hero at 2 seconds; fully revealed audit demonstration at 7 seconds; CTA at 13 seconds

## Full-view comparison

The revised videos use the website's exact orchard asset and reproduce its dark photographic treatment, white SF-style display type, restrained secondary copy, translucent glass surfaces, HIG Doctor mark, and centered composition. The social layouts intentionally reflow the landscape website hero into platform-native 4:5 and 1:1 frames.

## Focused region comparison

The website hero and video hero were compared together in `site-video-comparison.png`. The headline and supporting positioning are now shared directly with the site. The audit scene was inspected at full resolution: both storefronts, four findings, source locations, semantic colors, and product imagery remain legible over the orchard.

## Required fidelity surfaces

- Fonts and typography: system display typography, weight, tracking, hierarchy, and wrapping match the website treatment; no clipping or truncation.
- Spacing and layout rhythm: centered hero, compact metric row, safe margins, and three-column demo remain balanced in both output ratios.
- Colors and visual tokens: orchard exposure, blue-black overlay, muted white copy, glass cards, and border opacity now follow the website tokens.
- Image quality and asset fidelity: the orchard is the exact website asset. The transparent headphone product photograph remains sharp at both placements.
- Copy and content: the website's “Teach your AI Apple's design language,” “complete Apple Human Interface Guidelines,” and “no hallucinated patterns / wrong-platform advice” positioning is preserved. The current visible GitHub count is 118.

## Browser verification

- The local HIG Doctor website rendered successfully in the Codex in-app browser.
- Hero layout and visual tokens were inspected against the rendered video.
- Browser console errors checked: none.
- No website interaction changes were made; the primary video states were verified from rendered frames.

## Findings

No actionable P0, P1, or P2 differences remain. The videos omit website navigation and secondary platform copy intentionally to preserve feed readability and pacing.

## Comparison history

- Earlier light cream direction did not match the HIG Doctor website. Replaced it with the exact orchard asset and dark site tokens.
- Initial dark pass suppressed too much orchard detail. Increased image exposure and reduced the overlay to match the website's visible fruit and foliage.
- Replaced generic campaign copy with the site's product positioning and updated the visible GitHub count.

## Follow-up polish

- P3: restrained sound design could add transition emphasis, but the videos remain fully understandable when muted.

final result: passed
