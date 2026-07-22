# Rule catalog

Generated from `packages/core/src/patterns.ts` — do not edit by hand; run `bun scripts/generate-rule-docs.ts`.

348 rules. Every rule has a stable ID (`framework/label-slug`) used by inline suppressions, baselines, SARIF output, and the MCP server's `hig_explain_finding`.

Rule types: **concern** (a probable HIG violation, carries a severity), **positive** (good practice worth crediting), **pattern** (neutral component usage that routes HIG reference material into the report).

Engines: `regex` (zero-dependency line/document scanner), `swift-structural` (comment/string-aware Swift structural analysis), `ast-tsx` (TypeScript compiler API).

## Swift / SwiftUI (70 rules, 13 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `swift/tab-view` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/navigation-stack` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/navigation-split-view` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/navigation-view-deprecated` | concern | moderate | regex | Migrate to NavigationStack (single column) or NavigationSplitView (sidebar layouts). | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/navigation-link` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/list` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/scroll-view` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/lazy-vgrid` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/lazy-hgrid` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/geometry-reader` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/adaptive-layout` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/hardcoded-color` | concern | moderate | regex | Use semantic colors (.primary, .secondary, or an asset-catalog color) that adapt to dark mode. | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/hardcoded-rgbcolor` | concern | moderate | regex | Move the color into an asset catalog with light/dark variants. | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/hardcoded-uicolor` | concern | moderate | regex | Use a semantic UIColor (label, systemBackground) or an asset-catalog color. | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/hardcoded-color-ui-color` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/semantic-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/foreground-style` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/asset-catalog-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `swift/dynamic-type-style` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `swift/hardcoded-font-size` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `swift/hardcoded-uifont` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `swift/scaled-metric` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `swift/accessibility-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/accessibility-hint` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/accessibility-hidden` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/accessibility-add-traits` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/accessibility-value` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/accessibility-action` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/reduce-motion` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/on-tap-gesture-without-traits` | concern | moderate | regex | Prefer Button, or add .accessibilityAddTraits(.isButton) so VoiceOver announces it. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/image-without-a11y` | concern | moderate | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/is-accessibility-element-false-on-interactive` | concern | serious | regex | Keep interactive elements exposed to accessibility; give them a label instead of hiding them. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `swift/color-scheme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/preferred-color-scheme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/toggle` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/picker` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/slider` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/stepper` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/date-picker` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/color-picker` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `swift/sheet` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `swift/alert` | pattern | — | regex | — | [alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |
| `swift/confirmation-dialog` | pattern | — | regex | — | [alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |
| `swift/popover` | pattern | — | regex | — | [popovers](https://developer.apple.com/design/human-interface-guidelines/popovers) |
| `swift/searchable` | pattern | — | regex | — | [searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| `swift/progress-view` | pattern | — | regex | — | [progress-indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) |
| `swift/context-menu` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `swift/menu` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `swift/toolbar` | pattern | — | regex | — | [toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) |
| `swift/with-animation` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `swift/sensory-feedback` | pattern | — | regex | — | [playing-haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics) |
| `swift/on-drag` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/refreshable` | pattern | — | regex | — | [loading](https://developer.apple.com/design/human-interface-guidelines/loading) |
| `swift/swipe-actions` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/tap-gesture` | pattern | — | regex | — | [gestures](https://developer.apple.com/design/human-interface-guidelines/gestures) |
| `swift/keyboard-shortcut` | pattern | — | regex | — | [keyboards](https://developer.apple.com/design/human-interface-guidelines/keyboards) |
| `swift/focus-state` | pattern | — | regex | — | [focus-and-selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection) |
| `swift/app-intent` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/swift-data` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/widget-kit` | pattern | — | regex | — | [widgets](https://developer.apple.com/design/human-interface-guidelines/widgets) |
| `swift/activity-kit` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/health-kit` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/arkit` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/pass-kit-apple-pay` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/sign-in-with-apple` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/conditional-platform` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `swift/hardcoded-cgrect` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/ignores-safe-area` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `swift/non-private-state` | concern | moderate | regex | — | [feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) |

## Web / React / Next.js (122 rules, 24 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `web/aria-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-describedby` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-live` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-expanded` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-hidden` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-current` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-invalid` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-errormessage` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-required` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/role-attribute` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/sr-only` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/alt-text` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/tab-index` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/focus-management` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/keyboard-handler` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/skip-link` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/html-for-for-attribute` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/missing-alt` | concern | critical | regex | Add descriptive alt text, or alt="" when the image is purely decorative. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/image-without-alt` | concern | critical | regex | Add descriptive alt text, or alt="" when the image is purely decorative. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/svg-without-a11y` | concern | critical | regex | Give inline SVG role="img" plus a <title> or aria-label, or aria-hidden="true" if decorative. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/div-with-on-click-no-role` | concern | serious | regex | Use a native <button>, or add role="button", tabIndex={0}, and Enter/Space key handling. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/span-with-on-click-no-role` | concern | serious | regex | Use a native <button>, or add role="button", tabIndex={0}, and Enter/Space key handling. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/ambiguous-link-text` | concern | serious | regex | Write link text that names the destination; avoid "click here"/"read more". | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/positive-tabindex` | concern | serious | regex | Use tabindex="0" (or -1); positive values override the natural focus order. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/aria-hidden-on-focusable` | concern | serious | regex | Remove aria-hidden from focusable elements, or take them out of the tab order too. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/on-mouse-over-without-on-focus` | concern | serious | regex | Pair onMouseOver with onFocus so keyboard users get the same affordance. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/on-mouse-out-without-on-blur` | concern | serious | regex | Pair onMouseOut with onBlur so keyboard users get the same affordance. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/auto-focus` | concern | moderate | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/empty-heading` | concern | critical | regex | Add text content to the heading or remove it; screen readers announce empty headings as unlabeled. | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/empty-button` | concern | critical | regex | Give the button visible text or an aria-label. | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/div-as-button` | concern | serious | regex | Replace the div with a native <button>; it brings focus, key handling, and semantics for free. | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/div-as-nav-header-class` | concern | serious | regex | Use the semantic <nav>/<header> element instead of a classed div so landmarks exist. | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/missing-html-lang` | concern | critical | regex | Add lang="…" to the <html> element so assistive tech picks the right voice. | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/html-lang-attribute` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/landmark-main` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/landmark-nav` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/landmark-banner` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/landmark-contentinfo` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/heading-h1` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/heading-h2` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/heading-h3` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/css-variable-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `web/semantic-text-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `web/semantic-bg-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `web/semantic-border-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `web/inline-color-style` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `web/design-token-font-size` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `web/font-weight-token` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `web/hardcoded-font-size-px` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `web/rem-em-font-size` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `web/system-font-stack` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `web/dark-mode-class` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/prefers-color-scheme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/color-scheme-property` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/responsive-breakpoint` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/media-query` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/safe-area-inset` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/container-query` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/prefers-reduced-motion` | positive | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `web/css-animation` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `web/css-transition` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `web/min-touch-target-44px` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/nav-element` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/link-component` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/use-router` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/use-pathname` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/header-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/main-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/footer-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/section-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/aside-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/article-element` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/grid-layout` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/button-element` | pattern | — | regex | — | [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| `web/input-element` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `web/select-element` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `web/textarea-element` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `web/checkbox-radio` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `web/label-element` | positive | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `web/switch-toggle` | pattern | — | regex | — | [toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) |
| `web/form-element` | pattern | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/form-validation` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/input-type-email` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/input-type-tel` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/input-type-url` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/input-type-number` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/autocomplete-attribute` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/fieldset-element` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/legend-element` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/placeholder-text` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `web/dialog-element` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `web/modal-sheet` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `web/alert-dialog` | pattern | — | regex | — | [alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |
| `web/popover` | pattern | — | regex | — | [popovers](https://developer.apple.com/design/human-interface-guidelines/popovers) |
| `web/toast-notification` | pattern | — | regex | — | [feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) |
| `web/tooltip` | pattern | — | regex | — | [offering-help](https://developer.apple.com/design/human-interface-guidelines/offering-help) |
| `web/search-input` | pattern | — | regex | — | [searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| `web/search-role` | pattern | — | regex | — | [searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| `web/dropdown-menu` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `web/context-menu` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `web/menu-role` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `web/menuitem-role` | pattern | — | regex | — | [menus](https://developer.apple.com/design/human-interface-guidelines/menus) |
| `web/progress-bar` | pattern | — | regex | — | [progress-indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) |
| `web/loading-state` | pattern | — | regex | — | [loading](https://developer.apple.com/design/human-interface-guidelines/loading) |
| `web/aria-busy` | pattern | — | regex | — | [loading](https://developer.apple.com/design/human-interface-guidelines/loading) |
| `web/next-image` | pattern | — | regex | — | [images](https://developer.apple.com/design/human-interface-guidelines/images) |
| `web/table-element` | pattern | — | regex | — | [lists-and-tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) |
| `web/accordion` | pattern | — | regex | — | [disclosure-controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls) |
| `web/card-component` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `web/list-elements` | pattern | — | regex | — | [lists-and-tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) |
| `web/details-summary` | pattern | — | regex | — | [disclosure-controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls) |
| `web/framer-motion` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `web/metadata-head` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/error-boundary` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/i18n-l10n` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `web/analytics` | pattern | — | regex | — | [privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) |
| `web/video-without-track` | concern | critical | regex | Add a <track kind="captions"> file to the video. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/autoplay-media` | concern | serious | regex | Avoid autoplay; if unavoidable, autoplay muted with visible controls. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/blink-element` | concern | critical | regex | Remove <blink>; if emphasis is needed, use CSS animation that honors prefers-reduced-motion. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/marquee-element` | concern | critical | regex | Remove <marquee>; use static layout or an accessible animation that honors prefers-reduced-motion. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/user-scalable-no` | concern | critical | regex | Remove user-scalable=no from the viewport meta so pinch-zoom keeps working. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `web/maximum-scale-1` | concern | critical | regex | Remove maximum-scale=1 from the viewport meta so users can zoom. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |

## CSS / SCSS (25 rules, 10 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `css/css-custom-property-def` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `css/hardcoded-hex-in-css` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `css/clamp-font-size` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `css/font-size-below-12px` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `css/text-align-justify` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `css/line-height-below-1-2` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `css/max-width-on-text` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `css/focus-visible` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `css/focus-ring-styles` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `css/high-contrast` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `css/outline-none` | concern | serious | regex | Keep a visible focus indicator — style :focus-visible instead of removing the outline. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `css/hover-without-focus` | concern | moderate | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `css/print-styles` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/logical-properties` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/flexbox-gap` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/aspect-ratio` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/overflow-hidden-on-body` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/touch-target-sizing` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `css/extreme-z-index` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/important-usage` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/custom-scrollbar` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `css/rtl-direction` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `css/logical-text-align` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `css/logical-margin-padding` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `css/physical-text-align` | concern | moderate | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

## Vue / Nuxt (19 rules, 1 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `vue/v-bind-aria-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/v-bind-aria-describedby` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/v-bind-aria-expanded` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/v-bind-role` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/v-bind-alt` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/v-on-click-without-keyboard` | concern | serious | regex | Add @keydown.enter/@keydown.space handling, or use a <button>. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `vue/router-link` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `vue/nuxt-link` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `vue/use-router-vue` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `vue/nav-in-template` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `vue/header-in-template` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `vue/main-in-template` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `vue/footer-in-template` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `vue/vue-dark-class` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `vue/v-model` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `vue/vue-form` | pattern | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `vue/vue-form-validation` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `vue/vue-transition` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `vue/vue-i18n` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

## Svelte / SvelteKit (14 rules, 1 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `svelte/aria-label-svelte` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `svelte/aria-describedby-svelte` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `svelte/role-svelte` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `svelte/on-click-without-on-keydown` | concern | serious | regex | Add on:keydown handling, or use a <button>. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `svelte/svelte-kit-link` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `svelte/nav-svelte` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `svelte/header-svelte` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `svelte/main-svelte` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `svelte/svelte-dark-class` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `svelte/svelte-reduced-motion` | positive | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `svelte/svelte-transition` | pattern | — | regex | — | [motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| `svelte/svelte-form` | pattern | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `svelte/svelte-bind-value` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `svelte/svelte-i18n` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

## Angular (17 rules, 1 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `angular/attr-aria-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `angular/attr-aria-describedby` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `angular/attr-role` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `angular/angular-cdk-a11y` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `angular/click-without-keydown` | concern | serious | regex | Add a (keydown) handler, or use a <button>. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `angular/router-link` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `angular/router-outlet` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `angular/mat-button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `angular/mat-form-field` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `angular/mat-input` | pattern | — | regex | — | [text-fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) |
| `angular/mat-slide-toggle` | pattern | — | regex | — | [toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) |
| `angular/mat-dialog` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `angular/mat-table` | pattern | — | regex | — | [lists-and-tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) |
| `angular/angular-form` | pattern | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `angular/angular-validation` | positive | — | regex | — | [entering-data](https://developer.apple.com/design/human-interface-guidelines/entering-data) |
| `angular/angular-i18n` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `angular/angular-dark-theme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

## Jetpack Compose (28 rules, 4 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `compose/content-description` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `compose/semantics-modifier` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `compose/clear-and-set-semantics` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `compose/clickable-without-role` | concern | serious | regex | Pass role = Role.Button (or use Modifier.semantics) so TalkBack announces the control. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `compose/test-tag` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `compose/material-theme-color-scheme` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `compose/hardcoded-color-0x` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `compose/hardcoded-color-red-blue` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `compose/material-theme-typography` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `compose/hardcoded-font-size` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `compose/is-system-in-dark-theme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `compose/dark-color-scheme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `compose/navigation-bar` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `compose/nav-host` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `compose/bottom-navigation` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `compose/scaffold` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `compose/lazy-column` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `compose/lazy-row` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `compose/lazy-vertical-grid` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `compose/compose-button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `compose/text-field` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `compose/compose-switch` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `compose/compose-checkbox` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `compose/compose-slider` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `compose/alert-dialog-compose` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `compose/bottom-sheet` | pattern | — | regex | — | [modality](https://developer.apple.com/design/human-interface-guidelines/modality) |
| `compose/search-bar-compose` | pattern | — | regex | — | [searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| `compose/circular-progress` | pattern | — | regex | — | [progress-indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) |

## Android XML (18 rules, 4 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `android-xml/android-content-description` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `android-xml/image-view-without-content-description` | concern | critical | regex | Add android:contentDescription, or importantForAccessibility="no" if decorative. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `android-xml/important-for-accessibility` | pattern | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `android-xml/android-label-for` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `android-xml/color-resource` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `android-xml/hardcoded-color-in-xml` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `android-xml/sp-text-size` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `android-xml/dp-text-size` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `android-xml/style-usage` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `android-xml/dp-units` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `android-xml/px-units-in-xml` | concern | moderate | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `android-xml/dimen-resource` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `android-xml/constraint-layout` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `android-xml/recycler-view` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `android-xml/bottom-navigation-view` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `android-xml/navigation-view` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `android-xml/material-button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `android-xml/min-height-48dp` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

## React Native (14 rules, 1 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `react-native/accessibility-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `react-native/accessibility-role` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `react-native/accessibility-hint` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `react-native/accessibility-state` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `react-native/accessible-true` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `react-native/use-color-scheme` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `react-native/use-window-dimensions` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `react-native/react-navigation` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `react-native/flat-list` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `react-native/section-list` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `react-native/safe-area-view` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `react-native/gesture-handler` | pattern | — | regex | — | [gestures](https://developer.apple.com/design/human-interface-guidelines/gestures) |
| `react-native/haptics` | pattern | — | regex | — | [playing-haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics) |
| `react-native/nested-touchables` | concern | serious | regex | Flatten nested touchables; keep one interactive wrapper per control. | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |

## Flutter (21 rules, 3 concerns)

| Rule ID | Type | Severity | Engine | Guidance | HIG |
|---------|------|----------|--------|----------|-----|
| `flutter/semantics-widget` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `flutter/exclude-semantics` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `flutter/merge-semantics` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `flutter/semantic-label` | positive | — | regex | — | [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| `flutter/theme-color` | positive | — | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `flutter/hardcoded-color` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `flutter/colors-red-blue` | concern | moderate | regex | — | [color](https://developer.apple.com/design/human-interface-guidelines/color) |
| `flutter/theme-text-style` | positive | — | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `flutter/hardcoded-font-size` | concern | moderate | regex | — | [typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| `flutter/brightness-detection` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `flutter/dark-theme` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `flutter/media-query-responsive` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `flutter/layout-builder` | positive | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `flutter/navigator` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `flutter/cupertino-tab-bar` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `flutter/go-router` | pattern | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |
| `flutter/list-view` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `flutter/grid-view` | pattern | — | regex | — | [layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| `flutter/cupertino-button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `flutter/elevated-button` | pattern | — | regex | — | [controls](https://developer.apple.com/design/human-interface-guidelines/controls) |
| `flutter/flutter-l10n` | positive | — | regex | — | [hig](https://developer.apple.com/design/human-interface-guidelines/) |

