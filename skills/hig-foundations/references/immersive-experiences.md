---
title: "Immersive experiences | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/immersive-experiences

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/immersive-experiences.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Immersive experiences

## [Immersion and passthrough](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Immersion-and-passthrough)

### [Immersion styles](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Immersion-styles)

  * **Use dimmed passthrough to bring attention to your content.** You can subtly dim or tint passthrough and other visible content to bring attention to your app in the Shared Space without hiding other apps and games, or create a more focused experience in a Full Space. While passthrough is tinted black by default, you can apply a custom tint color to create a dynamic experience in your app. For developer guidance, see [`SurroundingsEffect`](https://developer.apple.com/documentation/SwiftUI/SurroundingsEffect).

  * Without dimmed passthrough 
  * With dimmed passthrough 

  * **Create unbounded 3D experiences.** Use the `mixed` immersion style in a Full Space to blend your content with passthrough. When your app or game runs in a Full Space, you can request access to information about nearby physical objects and room layout, helping you display virtual content in a person’s surroundings. The `mixed` immersion style doesn’t define a boundary. Instead, when a person gets too close to a physical object, the system automatically makes nearby content semi-opaque to help them remain aware of their surroundings. For developer guidance, see [`mixed`](https://developer.apple.com/documentation/SwiftUI/ImmersionStyle/mixed) and [ARKit](https://developer.apple.com/documentation/ARKit).

  * **Use`progressive` immersion to blend your custom environment with a person’s surroundings.** You can use the `progressive` style in a Full Space to display a custom environment that partially replaces passthrough. You can also define a specific range of immersion that works best with your app or game, and display content in portrait or landscape orientation. While in your immersive experience, people can use the Digital Crown to adjust the amount of immersion within either the default range of 120- to 360-degrees or a custom range, if you specify one. The system automatically defines an approximately 1.5-meter boundary when an experience transitions to the `progressive` style. For developer guidance, see [`progressive`](https://developer.apple.com/documentation/SwiftUI/ImmersionStyle/progressive).

  * **Use`full` immersion to create a fully immersive experience.** You can use the `full` style in a Full Space to display a 360-degree custom environment that completely replaces passthrough and transports people to a new place. As with the `progressive` style, the system defines an approximately 1.5-meter boundary when a fully immersive experience starts. For developer guidance, see [`full`](https://developer.apple.com/documentation/SwiftUI/ImmersionStyle/full).

  * Full Space (Mixed) 
  * Full Space (Progressive) 
  * Full Space (Immersive) 

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Best-practices)

**Offer multiple ways to use your app or game.**

**Prefer launching your app or game in the Shared Space or using the`mixed` immersion style.**

**Reserve immersion for meaningful moments and content.**

**Help people engage with key moments in your app or game, regardless of the level of immersion.**

**Prefer subtle tint colors for passthrough.**

## [Promoting comfort](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Promoting-comfort)

**Be mindful of people’s visual comfort.**

**Choose a style of immersion that supports the movements people might make while they’re in your app or game.**

**Avoid encouraging people to move while they’re in a progressive or fully immersive experience.**

**If you use the`mixed` immersion style, avoid obscuring passthrough too much.**

**Adopt ARKit if you want to blend custom content with someone’s surroundings.**

## [Transitioning between immersive styles](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Transitioning-between-immersive-styles)

**Design smooth, predictable transitions when changing immersion.**

**Let people choose when to enter or exit a more immersive experience.**

**Indicate the purpose of an exit control.**

## [Displaying virtual hands](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Displaying-virtual-hands)

**Prefer virtual hands that match familiar characteristics.**

**Use caution if you create virtual hands that are larger than the viewer’s hands.**

**If there’s an interruption in hand-tracking data, fade out virtual hands and reveal the viewer’s own hands.**

## [Creating an environment](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Creating-an-environment)

**Minimize distracting content.**

**Help people distinguish interactive objects in your environment.**

**Keep animation subtle.**

**Create an expansive environment, regardless of the place it depicts.**

**Use Spatial Audio to create atmosphere.**

**In general, avoid using a flat 360-degree image to create your environment.**

**Help people feel grounded.**

**Minimize asset redundancy.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/immersive-experiences

