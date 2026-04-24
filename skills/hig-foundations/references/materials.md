---
title: "Materials | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/materials

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/materials.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Materials

## [Liquid Glass](https://developer.apple.com/design/human-interface-guidelines/materials#Liquid-Glass)

**Don’t use Liquid Glass in the content layer.**

**Use Liquid Glass effects sparingly.**

**Only use clear Liquid Glass for components that appear over visually rich backgrounds.**

  * If the underlying content is bright, consider adding a dark dimming layer of 35% opacity. For developer guidance, see [`clear`](https://developer.apple.com/documentation/SwiftUI/Glass/clear).

  * If the underlying content is sufficiently dark, or if you use standard media playback controls from AVKit that provide their own dimming layer, you don’t need to apply a dimming layer.

## [Standard materials](https://developer.apple.com/design/human-interface-guidelines/materials#Standard-materials)

**Choose materials and effects based on semantic meaning and recommended usage.**

**Help ensure legibility by using vibrant colors on top of materials.**

**Consider contrast and visual separation when choosing a material to combine with blur and vibrancy effects.**

  * Thicker materials, which are more opaque, can provide better contrast for text and other elements with fine features.

  * Thinner materials, which are more translucent, can help people retain their context by providing a visible reminder of the content that’s in the background.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/materials#Platform-considerations)

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/materials#iOS-iPadOS)

  * [`UIVibrancyEffectStyle.label`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/label) (default)

  * [`UIVibrancyEffectStyle.secondaryLabel`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel)

  * [`UIVibrancyEffectStyle.tertiaryLabel`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel)

  * [`UIVibrancyEffectStyle.quaternaryLabel`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/quaternaryLabel)

  * [`UIVibrancyEffectStyle.fill`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/fill) (default)

  * [`UIVibrancyEffectStyle.secondaryFill`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/secondaryFill)

  * [`UIVibrancyEffectStyle.tertiaryFill`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/tertiaryFill)

### [macOS](https://developer.apple.com/design/human-interface-guidelines/materials#macOS)

**Choose when to allow vibrancy in custom views and controls.**

**Choose a background blending mode that complements your interface design.**

### [tvOS](https://developer.apple.com/design/human-interface-guidelines/materials#tvOS)

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/materials#visionOS)

**Prefer translucency to opaque colors in windows.**

**If necessary, choose materials that help you create visual separations or indicate interactivity in your app.**

  * The [`thin`](https://developer.apple.com/documentation/SwiftUI/Material/thin) material brings attention to interactive elements like buttons and selected items.

  * The [`regular`](https://developer.apple.com/documentation/SwiftUI/Material/regular) material can help you visually separate sections of your app, like a sidebar or a grouped table view.

  * The [`thick`](https://developer.apple.com/documentation/SwiftUI/Material/thick) material lets you create a dark element that remains visually distinct when it’s on top of an area that uses a `regular` background.

  * Use [`UIVibrancyEffectStyle.label`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/label) for standard text.

  * Use [`UIVibrancyEffectStyle.secondaryLabel`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel) for descriptive text like footnotes and subtitles.

  * Use [`UIVibrancyEffectStyle.tertiaryLabel`](https://developer.apple.com/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel) for inactive elements, and only when text doesn’t need high legibility.

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/materials#watchOS)

**Use materials to provide context in a full-screen modal view.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/materials#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/materials#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/materials#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/materials#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/materials#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/materials

