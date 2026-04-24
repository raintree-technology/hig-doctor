---
title: "Playing haptics | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/playing-haptics

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/playing-haptics.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Playing haptics

  * In an iPadOS, macOS, tvOS, or visionOS app or game, [game controllers](https://developer.apple.com/design/human-interface-guidelines/game-controls) can provide haptic feedback (for developer guidance, see [Playing Haptics on Game Controllers](https://developer.apple.com/documentation/CoreHaptics/playing-haptics-on-game-controllers)).

  * [Apple Pencil Pro](https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble) and some trackpads can provide haptic feedback when connected to certain iPad models. (For details on Apple Pencil features and compatibility, see [Apple Pencil](https://www.apple.com/apple-pencil/).)

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Best-practices)

**Use system-provided haptic patterns according to their documented meanings.**

**Use haptics consistently throughout your app or game.**

**Prefer using haptics to complement other feedback in your app or game.**

**Avoid overusing haptics.**

**In most apps, prefer playing short haptics that complement discrete events.**

**Make haptics optional.**

**Be aware that playing haptics might impact other user experiences.**

## [Custom haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Custom-haptics)

  * _Transient_ events are brief and compact, often feeling like taps or impulses. The experience of tapping the Flashlight button on the Home Screen is an example of a transient event.

  * _Continuous_ events feel like sustained vibrations, such as the experience of the lasers effect in a message.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Platform-considerations)

### [iOS](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#iOS)

  * Use standard UI components — like [toggles](https://developer.apple.com/design/human-interface-guidelines/toggles), [sliders](https://developer.apple.com/design/human-interface-guidelines/sliders), and [pickers](https://developer.apple.com/design/human-interface-guidelines/pickers) — that play Apple-designed system haptics by default.

  * When it makes sense, use a feedback generator to play one of several predefined haptic patterns in the categories of [notification](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Notification), [impact](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Impact), and [selection](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Selection) (for developer guidance, see [`UIFeedbackGenerator`](https://developer.apple.com/documentation/UIKit/UIFeedbackGenerator)).

#### [Notification](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Notification)

**Success.**

**Warning.**

**Error.**

#### [Impact](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Impact)

**Light.**

**Medium.**

**Heavy.**

**Rigid.**

**Soft.**

#### [Selection](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Selection)

**Selection.**

### [macOS](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#macOS)

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#watchOS)

  * Notification 
  * Up 
  * Down 
  * Success 
  * Failure 
  * Retry 
  * Start 
  * Stop 
  * Click 

**Notification.**

**Up.**

**Down.**

**Success.**

**Failure.**

**Retry.**

**Start.**

**Stop.**

**Click.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/playing-haptics#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/playing-haptics

