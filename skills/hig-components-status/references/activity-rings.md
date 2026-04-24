---
title: "Activity rings | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/activity-rings

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/activity-rings.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Activity rings

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Best-practices)

**Display Activity rings when they’re relevant to the purpose of your app.**

**Use Activity rings only to show Move, Exercise, and Stand information.**

**Use Activity rings to show progress for a single person.**

**Always keep the visual appearance of Activity rings the same, regardless of where you display them.**

  * Never change the colors of the rings; for example, don’t use filters or modify opacity.

  * Always display Activity rings on a black background.

  * Prefer enclosing the rings and background within a circle. To do this, adjust the corner radius of the enclosing view rather than applying a circular mask.

  * Ensure that the black background remains visible around the outermost ring. If necessary, add a thin, black stroke around the outer edge of the ring, and avoid including a gradient, shadow, or any other visual effect.

  * Always scale the rings appropriately so they don’t seem disconnected or out of place.

  * When necessary, design the surrounding interface to blend with the rings; never change the rings to blend with the surrounding interface.

**To display a label or value that’s directly associated with an Activity ring, use the colors that match it.**

**Maintain Activity ring margins.**

**Differentiate other ring-like elements from Activity rings.**

**Don’t send notifications that repeat the same information the Activity app sends.**

**Don’t use Activity rings for decoration.**

**Don’t use Activity rings for branding.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Platform-considerations)

### [iOS](https://developer.apple.com/design/human-interface-guidelines/activity-rings#iOS)

  * With an Apple Watch paired, iOS shows all three Activity rings.

  * Without an Apple Watch paired, iOS shows the Move ring only, which represents an approximation of a person’s activity based on their steps and workout information from other apps.

## [Resources](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/activity-rings#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/activity-rings

