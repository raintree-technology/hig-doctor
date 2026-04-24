---
title: "Tab views | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/tab-views

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/tab-views.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Tab views

A tab view presents multiple mutually exclusive panes of content in the same area, which people can switch between using a tabbed control.



## [Best practices](https://developer.apple.com/design/human-interface-guidelines/tab-views#Best-practices)

**Use a tab view to present closely related areas of content.** The appearance of a tab view provides a strong visual indication of enclosure. People expect each tab to display content that is in some way similar or related to the content in the other tabs.

**Make sure the controls within a pane affect content only in the same pane.** Panes are mutually exclusive, so ensure they’re fully self-contained.

**Provide a label for each tab that describes the contents of its pane.** A good label helps people predict the contents of a pane before clicking or tapping its tab. In general, use nouns or short noun phrases for tab labels. A verb or short verb phrase may make sense in some contexts. Use title-style capitalization for tab labels.

**Avoid using a pop-up button to switch between tabs.** A tabbed control is efficient because it requires a single click or tap to make a selection, whereas a pop-up button requires two. A tabbed control also presents all choices onscreen at the same time, whereas people must click a pop-up button to see its choices. Note that a pop-up button can be a reasonable alternative in cases where there are too many panes of content to reasonably display with tabs.

**Avoid providing more than six tabs in a tab view.** Having more than six tabs can be overwhelming and create layout issues. If you need to present six or more tabs, consider another way to implement the interface. For example, you could instead present each tab as a view option in a pop-up button menu.

For developer guidance, see [`NSTabView`](https://developer.apple.com/documentation/AppKit/NSTabView).

## [Anatomy](https://developer.apple.com/design/human-interface-guidelines/tab-views#Anatomy)

The tabbed control appears on the top edge of the content area. You can choose to hide the control, which is appropriate for an app that switches between panes programmatically.



When you hide the tabbed control, the content area can be borderless, bezeled, or bordered with a line. A borderless view can be solid or transparent.

**In general, inset a tab view by leaving a margin of window-body area on all sides of a tab view.** This layout looks clean and leaves room for additional controls that aren’t directly related to the contents of the tab view. You can extend a tab view to meet the window edges, but this layout is unusual.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/tab-views#Platform-considerations)

 _Not supported in iOS, iPadOS, tvOS, or visionOS._

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/tab-views#iOS-iPadOS)

For similar functionality, consider using a [segmented control](https://developer.apple.com/design/human-interface-guidelines/segmented-controls) instead.

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/tab-views#watchOS)

watchOS displays tab views using [page controls](https://developer.apple.com/design/human-interface-guidelines/components/presentation/page-controls). For developer guidance, see [`TabView`](https://developer.apple.com/documentation/SwiftUI/TabView) and [`verticalPage`](https://developer.apple.com/documentation/SwiftUI/TabViewStyle/verticalPage).



## [Resources](https://developer.apple.com/design/human-interface-guidelines/tab-views#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/tab-views#Related)

[Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

[Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/tab-views#Developer-documentation)

[`TabView`](https://developer.apple.com/documentation/SwiftUI/TabView) — SwiftUI

[`NSTabView`](https://developer.apple.com/documentation/AppKit/NSTabView) — AppKit

## [Change log](https://developer.apple.com/design/human-interface-guidelines/tab-views#Change-log)

Date| Changes  
---|---  
June 5, 2023| Added guidance for using tab views in watchOS.  
  
