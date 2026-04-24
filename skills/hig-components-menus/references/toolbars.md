---
title: "Toolbars | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/toolbars

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/toolbars.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Toolbars

  * The title of the current view

  * Navigation controls, like back and forward, and [search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)

  * Actions, or bar items, like [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) and [menus](https://developer.apple.com/design/human-interface-guidelines/menus)

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/toolbars#Best-practices)

**Choose items deliberately to avoid overcrowding.**

**Add a More menu to contain additional actions.**

  * Standard 
  * Compact 

**In iPadOS and macOS apps, consider letting people customize the toolbar to include their most common items.**

**Reduce the use of toolbar backgrounds and tinted controls.**

**Avoid applying a similar color to toolbar item labels and content layer backgrounds.**

**Prefer using standard components in a toolbar.**

**Consider temporarily hiding toolbars for a distraction-free experience.**

## [Titles](https://developer.apple.com/design/human-interface-guidelines/toolbars#Titles)

**Provide a useful title for each window.**

**Don’t title windows with your app name.**

**Write a concise title.**

## [Navigation](https://developer.apple.com/design/human-interface-guidelines/toolbars#Navigation)

**Use the standard Back and Close buttons.**

## [Actions](https://developer.apple.com/design/human-interface-guidelines/toolbars#Actions)

**Provide actions that support the main tasks people perform.**

**Make sure the meaning of each control is clear.**

**Prefer system-provided symbols without borders.**

**Use the`.prominent` style for key actions such as Done or Submit.**

## [Item groupings](https://developer.apple.com/design/human-interface-guidelines/toolbars#Item-groupings)

  * **Leading edge.** Elements that let people return to the previous document and show or hide a sidebar appear at the far leading edge, followed by the view title. Next to the title, the toolbar can include a document menu that contains standard and app-specific commands that affect the document as a whole, such as Duplicate, Rename, Move, and Export. To ensure that these items are always available, items on the toolbar’s leading edge aren’t customizable.

  * **Center area.** Common, useful controls appear in the center area, and the view title can appear here if it’s not on the leading edge. In macOS and iPadOS, people can add, remove, and rearrange items here if you let them customize the toolbar, and items in this section automatically collapse into the system-managed overflow menu when the window shrinks enough in size.

  * **Trailing edge.** The trailing edge contains important items that need to remain available, buttons that open nearby inspectors, an optional search field, and the More menu that contains additional items and supports toolbar customization. It also includes a primary action like Done when one exists. Items on the trailing edge remain visible at all window sizes.

**Group toolbar items logically by function and frequency of use.**

**Group navigation controls and critical actions like Done, Close, or Save in dedicated, familiar, and visually distinct sections.**

**Keep consistent groupings and placement across platforms.**

**Minimize the number of groups.**

**Keep actions with text labels separate.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/toolbars#Platform-considerations)

### [iOS](https://developer.apple.com/design/human-interface-guidelines/toolbars#iOS)

**Prioritize only the most important items for inclusion in the main toolbar area.**

**Use a large title to help people stay oriented as they navigate and scroll.**

### [iPadOS](https://developer.apple.com/design/human-interface-guidelines/toolbars#iPadOS)

**Consider combining a toolbar with a tab bar.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/toolbars#macOS)

**Make every toolbar item available as a command in the menu bar.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/toolbars#visionOS)

**Prefer using a system-provided toolbar.**

**Avoid creating a vertical toolbar.**

**Try to prevent windows from resizing below the width of the toolbar.**

**If your app can enter a modal state, consider offering contextually relevant toolbar controls.**

**Avoid using a pull-down menu in a toolbar.**

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/toolbars#watchOS)

**Use a scrolling toolbar button for an important action that isn’t a primary app function.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/toolbars#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/toolbars#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/toolbars#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/toolbars#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/toolbars#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/toolbars

