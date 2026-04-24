---
title: "Windows | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/windows

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/windows.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Windows

  * A _primary_ window presents the main navigation and content of an app, and actions associated with them.

  * An _auxiliary_ window presents a specific task or area in an app. Dedicated to one experience, an auxiliary window doesn’t allow navigation to other app areas, and it typically includes a button people use to close it after completing the task.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/windows#Best-practices)

**Make sure that your windows adapt fluidly to different sizes to support multitasking and multiwindow workflows.**

**Choose the right moment to open a new window.**

**Consider providing the option to view content in a new window.**

**Avoid creating custom window UI.**

**Use the term _window_ in user-facing content.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/windows#Platform-considerations)

### [iPadOS](https://developer.apple.com/design/human-interface-guidelines/windows#iPadOS)

  * **Full screen.** App windows fill the entire screen, and people switch between them — or between multiple windows of the same app — using the app switcher.

  * **Windowed.** People can freely resize app windows. Multiple windows can be onscreen at once, and people can reposition them and bring them to the front. The system remembers window size and placement even when an app is closed.

  * Full screen 
  * Windowed 

**Make sure window controls don’t overlap toolbar items.**

**Consider letting people use a gesture to open content in a new window.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/windows#macOS)

#### [macOS window anatomy](https://developer.apple.com/design/human-interface-guidelines/windows#macOS-window-anatomy)

#### [macOS window states](https://developer.apple.com/design/human-interface-guidelines/windows#macOS-window-states)

  * **Main.** The frontmost window that people view is an app’s main window. There can be only one main window per app.

  * **Key.** Also called the _active window_ , the key window accepts people’s input. There can be only one key window onscreen at a time. Although the front app’s main window is usually the key window, another window — such as a panel floating above the main window — might be key instead. People typically click a window to make it key; when people click an app’s Dock icon to bring all of that app’s windows forward, only the most recently accessed window becomes key.

  * **Inactive.** A window that’s not in the foreground is an inactive window.

**Make sure custom windows use the system-defined appearances.**

**Avoid putting critical information or actions in a bottom bar, because people often relocate a window in a way that hides its bottom edge.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/windows#visionOS)

#### [visionOS windows](https://developer.apple.com/design/human-interface-guidelines/windows#visionOS-windows)

**Prefer using a window to present a familiar interface and to support familiar tasks.**

**Retain the window’s glass background.**

**Choose an initial window size that minimizes empty areas within it.**

**Aim for an initial shape that suits a window’s content.**

**Choose a minimum and maximum size for each window to help keep your content looking great.**

**Minimize the depth of 3D content you display in a window.**

#### [visionOS volumes](https://developer.apple.com/design/human-interface-guidelines/windows#visionOS-volumes)

**Prefer using a volume to display rich, 3D content.**

**Place 2D content so it looks good from multiple angles.**

**In general, use dynamic scaling.**

**Take advantage of the default baseplate appearance to help people discern the edges of a volume.**

**Consider offering high-value content in an ornament.**

**Choose an alignment that supports the way people interact with your volume.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/windows#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/windows#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/windows#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/windows#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/windows#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/windows

