---
title: "Maps | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/maps

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/maps.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Maps

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/maps#Best-practices)

**In general, make your map interactive.**

**Pick a map emphasis style that suits the needs of your app.**

  * The _default_ style presents a version of the map with fully saturated colors, and is a good option for most standard map applications without a lot of custom elements. This style is also useful for keeping visual alignment between your map and the Maps app, in situations when people might switch between them.

  * The _muted_ style, by contrast, presents a desaturated version of the map. This style is great if you have a lot of information-rich content that you want to stand out against the map.

**Help people find places in your map.**

**Clearly identify elements that people select.**

**Cluster overlapping points of interest to improve map legibility.**

**Help people see the Apple logo and legal link.**

  * Use adequate padding to separate the logo and link from the map boundaries and your custom controls. For example, it works well to use 7 points of padding on the sides of the elements and 10 points above and below them.

  * Avoid causing the logo and link to move with your interface. It’s best when the Apple logo and legal link appear to be fixed to the map.

  * If your custom interface can move relative to the map, use the lowest position of the custom element to determine the placement of the logo and link. For example, if your app lets people pull up a custom card from the bottom of the screen, place the Apple logo and legal link 10 points above the lowest resting position of the card.

## [Custom information](https://developer.apple.com/design/human-interface-guidelines/maps#Custom-information)

**Use annotations that match the visual style of your app.**

**If you want to display custom information that’s related to standard map features, consider making them independently selectable.**

**Use overlays to define map areas with a specific relationship to your content.**

  * _Above roads_ , the default level, places the overlay above roads but below buildings, trees, and other features. This is great for situations where you want people to have an idea of what’s below the overlay, while still clearly understanding that it’s a defined space.

  * _Above labels_ places the overlay above both roads and labels, hiding everything beneath it. This is useful for content that you want to be fully abstracted from the features of the map, or when you want to hide areas of the map that aren’t relevant.

**Make sure there’s enough contrast between custom controls and the map.**

## [Place cards](https://developer.apple.com/design/human-interface-guidelines/maps#Place-cards)

### [Displaying place cards in a map](https://developer.apple.com/design/human-interface-guidelines/maps#Displaying-place-cards-in-a-map)

  * The _automatic_ style lets the system determine the place card style based on the size of your map view.

  * The _callout_ style displays a place card in a popover style next to the selected place. You can further specify the style of a callout — the _full_ callout style displays a large, detailed place card, and the _compact_ callout style displays a space-saving, more concise place card. If you don’t specify a callout style, the system defaults to the _automatic_ callout style, which determines the callout style based on your map’s view size.

  * The _caption_ style displays an “Open in Apple Maps” link.

  * The _sheet_ style displays a place card in a [sheet](https://developer.apple.com/design/human-interface-guidelines/sheets).

  * Full callout 
  * Compact callout 
  * Caption 
  * Sheet 

**Consider your map presentation when choosing a style.**

**Make sure your place card looks great on different devices and window sizes.**

**Avoid duplicating information.**

**Keep the location on your map visible when displaying a place card.**

### [Adding place cards outside of a map](https://developer.apple.com/design/human-interface-guidelines/maps#Adding-place-cards-outside-of-a-map)

**Use location-related cues in surrounding content to help communicate that people can open a place card.**

## [Indoor maps](https://developer.apple.com/design/human-interface-guidelines/maps#Indoor-maps)

  * Example 1 
  * Example 2 
  * Example 3 

**Adjust map detail based on the zoom level.**

**Use distinctive styling to differentiate the features of your map.**

**Offer a floor picker if your venue includes multiple levels.**

**Include surrounding areas to provide context.**

**Consider supporting navigation between your venue and nearby transit points.**

**Limit scrolling outside of your venue.**

**Design an indoor map that feels like a natural extension of your app.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/maps#Platform-considerations)

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/maps#watchOS)

**Fit the map interface element to the screen.**

**Show the smallest region that encompasses the points of interest.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/maps#Resources)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/maps#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/maps#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/maps#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/maps

