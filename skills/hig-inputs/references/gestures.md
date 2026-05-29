---
title: "Gestures | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/gestures
---

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/gestures.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.

# Gestures

## Best practices

**Give people more than one way to interact with your app.**

**In general, respond to gestures in ways that are consistent with people’s expectations.**

**Handle gestures as responsively as possible.**

**Indicate when a gesture isn’t available.**

## Custom gestures

**Add custom gestures only when necessary.**

  * Discoverable

  * Straightforward to perform

  * Distinct from other gestures

  * Not the only way to perform an important action in your app or game

**Make custom gestures easy to learn.**

**Use shortcut gestures to supplement standard gestures, not replace them.**

**Avoid conflicting with gestures that access system UI.**

## Platform considerations

### iOS, iPadOS

**Consider allowing simultaneous recognition of multiple gestures if it enhances the experience.**

### visionOS

**Support standard gestures everywhere you can.**

**Offer both indirect and direct interactions when possible.**

**Avoid requiring specific body movements or positions for input.**

#### Designing custom gestures in visionOS

**Prioritize comfort.**

**Carefully consider complex custom gestures that involve multiple fingers or both hands.**

**Avoid custom gestures that require using a specific hand.**

#### Working with system overlays in visionOS

**Reserve the area around a person’s hand for system overlays and their related gestures.**

**Consider deferring the system overlay behavior when designing an immersive app or game.**

**Use caution when designing custom gestures that involve a rolling motion of the hand, wrist, and forearm.**

### watchOS

#### Double tap

**Avoid setting a primary action in views with lists, scroll views, or vertical tabs.**

**Choose the button that people use most commonly as the primary action in a view.**

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/gestures

