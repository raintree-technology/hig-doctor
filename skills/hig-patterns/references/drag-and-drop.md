---
title: "Drag and drop | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/drag-and-drop

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/drag-and-drop.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Drag and drop

  * In visionOS, people pinch and hold a virtual object while dragging it to a new location in any direction, including along the z-axis.

  * iOS and iPadOS support drag and drop through gestures on the touchscreen, interactions with a pointing device, and through full keyboard-access mode.

  * Universal Control lets people drag content between their Mac and iPad.

  * On a Mac, people can interact with a pointing device, use full keyboard access mode, or use VoiceOver to perform drag and drop.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Best-practices)

**As much as possible, support drag and drop throughout your app.**

**Offer alternative ways to accomplish drag-and-drop actions.**

**Determine when dragging and dropping content within your app results in a move or a copy.**

**Support multi-item drag and drop when it makes sense.**

**Prefer letting people undo a drag-and-drop operation.**

**Consider offering multiple versions of dragged content, ordered from highest to lowest fidelity.**

**Consider supporting spring loading.**

## [Providing feedback](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Providing-feedback)

**Display a drag image as soon as people drag a selection about three points.**

**If it adds clarity, modify the drag image to help people predict the result of a drag-and-drop operation.**

**Show people whether a destination can accept dragged content.**

**When people drop an item on an invalid destination, or when dropping fails, provide visual feedback.**

## [Accepting drops](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Accepting-drops)

**Scroll the contents of a destination when necessary.**

**When there’s a choice, pick the richest version of dropped content your app can accept.**

**Extract only the relevant portion of dropped content if necessary.**

**When a physical keyboard is attached, check for the Option key at drop time.**

**Provide feedback when dropped content needs time to transfer.**

**Provide feedback when dropped content initiates a task or action.**

**Apply appropriate styling to dropped text.**

**After a drop, maintain the content’s selection state in the destination, updating it in the source as needed.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Platform-considerations)

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#iOS-iPadOS)

**Let people perform multiple simultaneous drag activities.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#macOS)

**Consider letting people drag content from your app into the Finder.**

**Let people drag selected content from an inactive window without first making the window active.**

**When possible, let people drag individual items from an inactive window without affecting an existing background selection.**

**Consider displaying a badge during multi-item drag operations.**

**Consider changing the pointer appearance to indicate what will happen when people drop content.**

**As much as possible, let people select and drag content with a single motion.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#visionOS)

**When possible, launch your app to handle content that people drop into empty space.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/drag-and-drop

