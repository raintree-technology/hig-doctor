---
title: "Scroll views | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/scroll-views

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/scroll-views.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Scroll views

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Best-practices)

**Support default scrolling gestures and keyboard shortcuts.**

**Make it apparent when content is scrollable.**

**Avoid putting a scroll view inside another scroll view with the same orientation.**

**Consider supporting page-by-page scrolling if it makes sense for your content.**

**In some cases, scroll automatically to help people find their place.**

  * Your app performs an operation that selects content or places the insertion point in an area that’s currently hidden. For example, when your app locates text that people are searching for, scroll the content to bring the new selection into view.

  * People start entering information in a location that’s not currently visible. For example, if the insertion point is on one page and people navigate to another page, scroll back to the insertion point as soon as they begin to enter text.

  * The pointer moves past the edge of the view while people are making a selection. In this case, follow the pointer by scrolling in the direction it moves.

  * People select something and scroll to a new location before acting on the selection. In this case, scroll until the selection is in view before performing the operation.

**If you support zoom, set appropriate maximum and minimum scale values.**

## [Scroll edge effects](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Scroll-edge-effects)

  * Use a [`soft`](https://developer.apple.com/documentation/SwiftUI/ScrollEdgeEffectStyle/soft) edge effect in most cases, especially in iOS and iPadOS, to provide a subtle transition that works well for toolbars and interactive elements like buttons.

  * Use a [`hard`](https://developer.apple.com/documentation/SwiftUI/ScrollEdgeEffectStyle/hard) edge effect primarily in macOS for a stronger, more opaque boundary that’s ideal for interactive text, backless controls, or pinned table headers that need extra clarity.

**Only use a scroll edge effect when a scroll view is adjacent to floating interface elements.**

**Apply one scroll edge effect per view.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Platform-considerations)

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/scroll-views#iOS-iPadOS)

**Consider showing a page control when a scroll view is in page-by-page mode.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/scroll-views#macOS)

**If necessary, use small or mini scroll bars in a panel.**

### [tvOS](https://developer.apple.com/design/human-interface-guidelines/scroll-views#tvOS)

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/scroll-views#visionOS)

**If necessary, account for the size of the scroll indicator.**

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/scroll-views#watchOS)

**Prefer vertically scrolling content.**

**Use tab views to provide page-by-page scrolling.**

**When displaying paged content, consider limiting the content of an individual page to a single screen height.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Developer-documentation)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/scroll-views#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/scroll-views

