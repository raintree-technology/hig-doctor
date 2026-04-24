---
title: "Buttons | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/buttons

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/buttons.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Buttons

  * **Style.** A visual style based on size, color, and shape.

  * **Content.** A symbol (or icon), text label, or both that a button displays to convey its purpose.

  * **Role.** A system-defined role that identifies a button’s semantic meaning and can affect its appearance.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/buttons#Best-practices)

**Make buttons easy for people to use.**

**Always include a press state for a custom button.**

## [Style](https://developer.apple.com/design/human-interface-guidelines/buttons#Style)

**In general, use a button that has a prominent visual style for the most likely action in a view.**

**Use style — not size — to visually distinguish the preferred choice among multiple options.**

**Avoid applying a similar color to button labels and content layer backgrounds.**

## [Content](https://developer.apple.com/design/human-interface-guidelines/buttons#Content)

**Ensure that each button clearly communicates its purpose.**

**Try to associate familiar actions with familiar icons.**

**Consider using text when a short label communicates more clearly than an icon.**

## [Role](https://developer.apple.com/design/human-interface-guidelines/buttons#Role)

  * **Normal.** No specific meaning.

  * **Primary.** The button is the default button — the button people are most likely to choose.

  * **Cancel.** The button cancels the current action.

  * **Destructive.** The button performs an action that can result in data destruction.

**Assign the primary role to the button people are most likely to choose.**

**Don’t assign the primary role to a button that performs a destructive action, even if that action is the most likely choice.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/buttons#Platform-considerations)

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/buttons#iOS-iPadOS)

**Configure a button to display an activity indicator when you need to provide feedback about an action that doesn’t instantly complete.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/buttons#macOS)

#### [Push buttons](https://developer.apple.com/design/human-interface-guidelines/buttons#Push-buttons)

**Use a flexible-height push button only when you need to display tall or variable height content.**

**Append a trailing ellipsis to the title when a push button opens another window, view, or app.**

**Consider supporting spring loading.**

#### [Square buttons](https://developer.apple.com/design/human-interface-guidelines/buttons#Square-buttons)

**Use square buttons in a view, not in the window frame.**

**Prefer using a symbol in a square button.**

**Avoid using labels to introduce square buttons.**

#### [Help buttons](https://developer.apple.com/design/human-interface-guidelines/buttons#Help-buttons)

**Use the system-provided help button to display your help documentation.**

**When possible, open the help topic that’s related to the current context.**

**Include no more than one help button per window.**

**Position help buttons where people expect to find them.**

**Use a help button within a view, not in the window frame.**

**Avoid displaying text that introduces a help button.**

#### [Image buttons](https://developer.apple.com/design/human-interface-guidelines/buttons#Image-buttons)

**Use an image button in a view, not in the window frame.**

**Include about 10 pixels of padding between the edges of the image and the button edges.**

**If you need to include a label, position it below the image button.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/buttons#visionOS)

**Prefer buttons that have a discernible background shape and fill.**

  * When a button appears on top of a glass [window](https://developer.apple.com/design/human-interface-guidelines/windows#visionOS), use the [`thin`](https://developer.apple.com/documentation/SwiftUI/Material/thin) material as the button’s background.

  * When a button appears floating in space, use the [glass material](https://developer.apple.com/design/human-interface-guidelines/materials#visionOS) for its background.

**Avoid creating a custom button that uses a white background fill and black text or icons.**

**In general, prefer circular or capsule-shape buttons.**

**Provide enough space around a button to make it easy for people to look at it.**

**Choose the right shape if you need to display text-labeled buttons in a stack or row.**

**Use standard controls to take advantage of the audible feedback sounds people already know.**

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/buttons#watchOS)

**Use a toolbar to place buttons in the corners.**

**Prefer buttons that span the width of the screen for primary actions in your app.**

**Use toolbar buttons to provide either navigation to related areas or contextual actions for the view’s content.**

**Use the same height for vertical stacks of one- and two-line text buttons.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/buttons#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/buttons#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/buttons#Developer-documentation)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/buttons#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/buttons

