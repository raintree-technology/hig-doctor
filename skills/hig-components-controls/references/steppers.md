---
title: "Steppers | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/steppers

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/steppers.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Steppers

A stepper is a two-segment control that people use to increase or decrease an incremental value.



A stepper sits next to a field that displays its current value, because the stepper itself doesn’t display a value.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/steppers#Best-practices)

**Make the value that a stepper affects obvious.** A stepper itself doesn’t display any values, so make sure people know which value they’re changing when they use a stepper.

**Consider pairing a stepper with a text field when large value changes are likely.** Steppers work well by themselves for making small changes that require a few taps or clicks. By contrast, people appreciate the option to use a field to enter specific values, especially when the values they use can vary widely. On a printing screen, for example, it can help to have both a stepper and a text field to set the number of copies.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/steppers#Platform-considerations)

 _No additional considerations for iOS, iPadOS, or visionOS. Not supported in watchOS or tvOS._

### [macOS](https://developer.apple.com/design/human-interface-guidelines/steppers#macOS)

**For large value ranges, consider supporting Shift-click to change the value quickly.** If your app benefits from larger changes in a stepper’s value, it can be useful to let people Shift-click the stepper to change the value by more than the default increment (by 10 times the default, for example).

## [Resources](https://developer.apple.com/design/human-interface-guidelines/steppers#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/steppers#Related)

[Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)

[Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/steppers#Developer-documentation)

[`UIStepper`](https://developer.apple.com/documentation/UIKit/UIStepper) — UIKit

[`NSStepper`](https://developer.apple.com/documentation/AppKit/NSStepper) — AppKit

