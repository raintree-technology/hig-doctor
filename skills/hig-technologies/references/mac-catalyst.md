---
title: "Mac Catalyst | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/mac-catalyst

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/mac-catalyst.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Mac Catalyst

## [Before you start](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Before-you-start)

**Drag and drop.**

**Keyboard navigation and shortcuts.**

**Multitasking.**

  * Pointer interactions and keyboard-based focus and navigation

  * Window management

  * Toolbars

  * Rich text interaction, including copy and paste as well as contextual menus for editing

  * File management

  * Menu bar menus

  * App-specific settings in the system-provided Settings app

  * Split view

  * File browser

  * Activity view

  * Form sheet

  * Contextual actions

  * Color picker

## [Choose an idiom](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Choose-an-idiom)

**When you adopt the Mac idiom, thoroughly audit your app’s layout, and plan to make changes to it.**

**Adjust font sizes as needed.**

**Make sure views and images look good in the Mac version of your app.**

  * iPad idiom 
  * Mac idiom 

**Limit your appearance customizations to standard macOS appearance customizations that are the same or similar to those available in iPadOS.**

## [Integrate the Mac experience](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Integrate-the-Mac-experience)

### [Navigation](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Navigation)

  * [Split views](https://developer.apple.com/design/human-interface-guidelines/split-views). A split view supports hierarchical navigation, which consists of a two- or three-column interface that shows a primary column, an optional supplementary column, and a secondary pane of content. Frequently, apps use the primary column to create a sidebar-based interface where changes in the sidebar drive changes in the optional supplementary column, which then affect the content in the content pane.

  * [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars). A tab bar supports flat navigation by displaying top-level categories in a persistent bar at the bottom of the screen.

  * [Page controls](https://developer.apple.com/design/human-interface-guidelines/page-controls). A page control displays dots at the bottom of the screen that indicate the position of the current page in a flat list of pages.

  * A split view with a sidebar displays a list of top-level items, each of which can disclose a list of child items. Using a sidebar streamlines navigation, because each tab’s contents are available within the sidebar. By using a sidebar on both iPad and Mac, you create a consistent layout that makes it easy for iPad users to start using the Mac version of your app.

  * A segmented control and a tab bar both accommodate similar interactions, such as mutually exclusive selection. In general, using a split view instead of a tab bar works better than using a segmented control. However, a segmented control can work well on the Mac if your app uses a flat navigation hierarchy.

**Make sure people retain access to important tab-bar items in the Mac version of your app.**

**Offer multiple ways to move between pages.**

### [Inputs](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Inputs)

### [App icons](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#App-icons)

**Create a macOS version of your app icon.**

### [Layout](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Layout)

  * Divide a single column of content and actions into multiple columns.

  * Use the regular-width and regular-height size classes, and consider reflowing elements in the content area to a side-by-side arrangement as people resize the window.

  * Present an inspector UI next to the main content instead of using a popover.

**Consider moving controls from the main UI of your iPad app to your Mac app’s toolbar.**

**As much as possible, adopt a top-down flow.**

**Relocate buttons from the side and bottom edges of the screen.**

### [Menus](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Menus)

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/mac-catalyst

