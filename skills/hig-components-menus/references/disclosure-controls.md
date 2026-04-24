---
title: "Disclosure controls | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/disclosure-controls

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/disclosure-controls.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Disclosure controls

Disclosure controls reveal and hide information and functionality related to specific controls or views.



## [Best practices](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Best-practices)

**Use a disclosure control to hide details until they’re relevant.** Place controls that people are most likely to use at the top of the disclosure hierarchy so they’re always visible, with more advanced functionality hidden by default. This organization helps people quickly find the most essential information without overwhelming them with too many detailed options.

## [Disclosure triangles](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Disclosure-triangles)

A disclosure triangle shows and hides information and functionality associated with a view or a list of items. For example, Keynote uses a disclosure triangle to show advanced options when exporting a presentation, and the Finder uses disclosure triangles to progressively reveal hierarchy when navigating a folder structure in list view.

  * Collapsed 
  * Expanded 







A disclosure triangle points inward from the leading edge when its content is hidden and down when its content is visible. Clicking or tapping the disclosure triangle switches between these two states, and the view expands or collapses accordingly to accommodate the content.

**Provide a descriptive label when using a disclosure triangle.** Make sure your labels indicate what is disclosed or hidden, like “Advanced Options.”

For developer guidance, see [`NSButton.BezelStyle.disclosure`](https://developer.apple.com/documentation/AppKit/NSButton/BezelStyle-swift.enum/disclosure).

## [Disclosure buttons](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Disclosure-buttons)

A disclosure button shows and hides functionality associated with a specific control. For example, the macOS Save sheet shows a disclosure button next to the Save As text field. When people click or tap this button, the Save dialog expands to give advanced navigation options for selecting an output location for their document.

A disclosure button points down when its content is hidden and up when its content is visible. Clicking or tapping the disclosure button switches between these two states, and the view expands or collapses accordingly to accommodate the content.

  * Collapsed 
  * Expanded 







**Place a disclosure button near the content that it shows and hides.** Establish a clear relationship between the control and the expanded choices that appear when a person clicks or taps a button.

**Use no more than one disclosure button in a single view.** Multiple disclosure buttons add complexity and can be confusing.

For developer guidance, see [`NSButton.BezelStyle.pushDisclosure`](https://developer.apple.com/documentation/AppKit/NSButton/BezelStyle-swift.enum/pushDisclosure).

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Platform-considerations)

 _No additional considerations for macOS. Not supported in tvOS or watchOS._

### [iOS, iPadOS, visionOS](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#iOS-iPadOS-visionOS)

Disclosure controls are available in iOS, iPadOS, and visionOS with the SwiftUI [`DisclosureGroup`](https://developer.apple.com/documentation/SwiftUI/DisclosureGroup) view.

## [Resources](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Related)

[Outline views](https://developer.apple.com/design/human-interface-guidelines/outline-views)

[Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)

[Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Developer-documentation)

[`DisclosureGroup`](https://developer.apple.com/documentation/SwiftUI/DisclosureGroup) — SwiftUI

[`NSButton.BezelStyle.disclosure`](https://developer.apple.com/documentation/AppKit/NSButton/BezelStyle-swift.enum/disclosure) — AppKit

[`NSButton.BezelStyle.pushDisclosure`](https://developer.apple.com/documentation/AppKit/NSButton/BezelStyle-swift.enum/pushDisclosure) — AppKit

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls#Videos)

[![](https://devimages-cdn.apple.com/wwdc-services/images/49/1636D358-5C36-4027-B204-81FFE4D05B7D/3455_wide_250x141_1x.jpg) Stacks, Grids, and Outlines in SwiftUI ](https://developer.apple.com/videos/play/wwdc2020/10031)

