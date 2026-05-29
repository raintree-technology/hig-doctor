---
title: "Layout | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/layout
---

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/layout.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.

# Layout

## Best practices

**Group related items to help people find the information they want.**

**Make essential information easy to find by giving it sufficient space.**

**Extend content to fill the screen or window.**

## Visual hierarchy

**Differentiate controls from content.**

**Place items to convey their relative importance.**

**Align components with one another to make them easier to scan and to communicate organization and hierarchy.**

**Take advantage of progressive disclosure to help people discover content that’s currently hidden.**

**Make controls easier to use by providing enough space around them and grouping them in logical sections.**

## Adaptability

  * Different device screen sizes, resolutions, and color spaces

  * Different device orientations (portrait/landscape)

  * System features like Dynamic Island and camera controls

  * External display support, Display Zoom, and resizable windows on iPad

  * Dynamic Type text-size changes

  * Locale-based internationalization features like left-to-right/right-to-left layout direction, date/time/number formatting, font variation, and text length

**Design a layout that adapts gracefully to context changes while remaining recognizably consistent.**

**Be prepared for text-size changes.**

**Preview your app on multiple devices, using different orientations, localizations, and text sizes.**

**When necessary, scale artwork in response to display changes.**

## Guides and safe areas

**Respect key display and system features in each platform.**

## Platform considerations

### iOS

**Aim to support both portrait and landscape orientations.**

**Prefer a full-bleed interface for your game.**

**Avoid full-width buttons.**

**Hide the status bar only when it adds value or enhances your experience.**

### iPadOS

**As someone resizes a window, defer switching to a compact view for as long as possible.**

**Test your layout at common system-provided sizes, and provide smooth transitions.**

**Consider a convertible tab bar for adaptive navigation.**

### macOS

**Avoid placing controls or critical information at the bottom of a window.**

**Avoid displaying content within the camera housing at the top edge of the window.**

### tvOS

**Be prepared for a wide range of TV sizes.**

**Adhere to the screen’s safe area.**

**Include appropriate padding between focusable elements.**

#### Grids

  * Two-column 
  * Three-column 
  * Four-column 
  * Five-column 
  * Six-column 
  * Seven-column 
  * Eight-column 
  * Nine-column 

#### Nine-column grid

**Include additional vertical spacing for titled rows.**

**Use consistent spacing.**

**Make partially hidden content look symmetrical.**

### visionOS

**Consider centering the most important content and controls in your app or game.**

**Keep a window’s content within its bounds.**

**If you need to display additional controls that don’t belong within a window, use an ornament.**

**Make a window’s interactive components easy for people to look at.**

### watchOS

**Design your content to extend from one edge of the screen to the other.**

**Avoid placing more than two or three controls side by side in your interface.**

**Support autorotation in views people might want to show others.**

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/layout

