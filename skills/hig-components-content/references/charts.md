---
title: "Charts | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/charts

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/charts.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Charts

  * Learn how upcoming weather conditions might affect their plans.

  * Analyze stock prices to understand past performance and discover trends.

  * Review fitness data to monitor their progress and set new goals.

## [Anatomy](https://developer.apple.com/design/human-interface-guidelines/charts#Anatomy)

## [Marks](https://developer.apple.com/design/human-interface-guidelines/charts#Marks)

**Choose a mark type based on the information you want to communicate about the data.**

**Consider combining mark types when it adds clarity to your chart.**

## [Axes](https://developer.apple.com/design/human-interface-guidelines/charts#Axes)

**Use a fixed or dynamic axis range depending on the meaning of your chart.**

**Define the value of the lower bound based on mark type and chart usage.**

**Prefer familiar sequences of values in the tick and grid-line labels for an axis.**

**Tailor the appearance of grid lines and labels to a chart’s use cases.**

## [Descriptive content](https://developer.apple.com/design/human-interface-guidelines/charts#Descriptive-content)

**Write descriptions that help people understand what a chart does before they view it.**

**Summarize the main message of your chart to help make it approachable and useful for everyone.**

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/charts#Best-practices)

**Establish a consistent visual hierarchy that helps communicate the relative importance of various chart elements.**

**In a compact environment, maximize the width of the plot area to give people enough space to comfortably examine a chart.**

**Make every chart in your app accessible.**

**Let people interact with the data when it makes sense, but don’t require interaction to reveal critical information.**

**Make it easy for everyone to interact with a chart.**

**Make an interactive chart easy to navigate when using keyboard commands (including full keyboard access) or Switch Control.**

**Help people notice important changes in a chart.**

**Align a chart with surrounding interface elements.**

## [Color](https://developer.apple.com/design/human-interface-guidelines/charts#Color)

**Avoid relying solely on color to differentiate between different pieces of data or communicate essential information in a chart.**

**Aid comprehension by adding visual separation between contiguous areas of color.**

## [Enhancing the accessibility of a chart](https://developer.apple.com/design/human-interface-guidelines/charts#Enhancing-the-accessibility-of-a-chart)

**Consider using Audio Graphs to give VoiceOver users more information about your chart.**

**Write accessibility labels that support the purpose of your chart.**

  * **Prioritize clarity and comprehensiveness.** In general, it’s rarely enough to merely report a data value unless you also include context that helps people understand it, like the date or location that’s associated with it. Aim to concisely describe the context for a value without repeating information that people can get in other ways, like an axis name that Audio Graphs or your overview provides. Follow context-setting information with a succinct description of the element’s details.

  * **Avoid using subjective terms.** Subjective words — like rapidly, gradually, and almost — communicate your interpretation of the data. To help people form their own interpretations, use actual values in your descriptions.

  * **Maximize clarity in data descriptions by avoiding potentially ambiguous formats and abbreviations.** For example, using “June 6” is clearer than using “6/6”; similarly, spelling out “60 minutes” or “60 meters” is clearer than using the abbreviation “60m.”

  * **Describe what the chart’s details represent, not what they look like.** Consider a chart that uses red and blue colors to help people visually distinguish two different data series. It’s crucial to create accessibility labels that identify what each series represents, but describing the colors that visually represent them can add unnecessary information and be distracting.

  * **Be consistent throughout your app when referring to a specific axis.** For example, if you always mention the X axis first, people can spend less time figuring out which axis is relevant in a description.

**Hide visible text labels for axes and ticks from assistive technologies.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/charts#Platform-considerations)

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/charts#watchOS)

**In general, avoid requiring complex chart interactions in your watchOS app.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/charts#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/charts#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/charts#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/charts#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/charts#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/charts

