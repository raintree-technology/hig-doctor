---
title: "Machine learning | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/machine-learning

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/machine-learning.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Machine learning

## [Planning your design](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Planning-your-design)

## [The role of machine learning in your app](https://developer.apple.com/design/human-interface-guidelines/machine-learning#The-role-of-machine-learning-in-your-app)

### [Critical or complementary](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Critical-or-complementary)

  * The keyboard uses machine learning to provide QuickType suggestions. Because the keyboard still works without these suggestions, machine learning plays a complementary role in the app.

  * Face ID relies on machine learning to perform accurate face recognition. Without machine learning, Face ID would not work.

### [Private or public](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Private-or-public)

  * If a health app misinterprets data and incorrectly recommends a visit to the doctor, people are likely to experience anxiety and may lose trust in the app.

  * If a music app misinterprets data and recommends an artist that people don’t like, they’re likely to view the result as an inconsequential mistake.

### [Proactive or reactive](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Proactive-or-reactive)

  * QuickType suggests words in reaction to what people type.

  * Siri Suggestions can proactively suggest a shortcut based on people’s recent routines.

### [Visible or invisible](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Visible-or-invisible)

### [Dynamic or static](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Dynamic-or-static)

  * Face ID improves dynamically as people’s faces gradually change over time.

  * Photos improves its object recognition capabilities with every new iOS release.

## [Explicit feedback](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Explicit-feedback)

**Request explicit feedback only when necessary.**

**Always make providing explicit feedback a voluntary task.**

**Use simple, direct language to describe each explicit feedback option and its consequences.**

  * Suggest less pop music

  * Suggest more thrillers

  * Mute politics for a week

**Add icons to an option description if it helps people understand it.**

**Consider offering multiple options when requesting explicit feedback.**

**Act immediately when you receive explicit feedback and persist the resulting changes.**

**Consider using explicit feedback to help improve when and where you show results.**

## [Implicit feedback](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Implicit-feedback)

**Always secure people’s information.**

**Help people control their information.**

**Don’t let implicit feedback decrease people’s opportunities to explore.**

**When possible, use multiple feedback signals to improve suggestions and mitigate mistakes.**

**Consider withholding private or sensitive suggestions.**

**Prioritize recent feedback.**

**Use feedback to update predictions on a cadence that matches the person’s mental model of the feature.**

**Be prepared for changes in implicit feedback when you make changes to your app’s UI.**

**Beware of confirmation bias.**

## [Calibration](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Calibration)

**Always secure people’s information.**

**Be clear about why you need people’s information.**

**Collect only the most essential information.**

**Avoid asking people to participate in calibration more than once.**

**Make calibration quick and easy.**

  * Prioritize getting a few pieces of important information and infer the rest from other sources or by getting people’s feedback.

  * Avoid asking for information that most people would have to look up.

  * Avoid asking people to perform actions that might be difficult.

**Make sure people know how to perform calibration successfully.**

**Immediately provide assistance if progress stalls.**

**Confirm success.**

**Let people cancel calibration at any time.**

**Give people a way to update or remove information they provided during calibration.**

## [Corrections](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Corrections)

**Give people familiar, easy ways to make corrections.**

**Provide immediate value when people make a correction.**

**Let people correct their corrections.**

**Always balance the benefits of a feature with the effort required to make a correction.**

**Never rely on corrections to make up for low-quality results.**

**Learn from corrections when it makes sense.**

**When possible, use guided corrections instead of freeform corrections.**

## [Mistakes](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Mistakes)

  * Anticipate mistakes. As much as possible, design ways to avoid mistakes and mitigate them when they happen.

  * Help people handle mistakes. Mistakes can have a wide range of consequences, so the tools you provide to handle a mistake must be able to address those consequences.

  * Learn from mistakes when doing so improves your app. In some cases, learning from a mistake might have undesirable effects, such as causing unpredictability in the user experience. When it makes sense, use each mistake as a data point that can refine your machine learning models and improve your app.

  * [Limitations](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Limitations) help you set people’s expectations about the accuracy of your suggestions.

  * [Corrections](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Corrections) give people a way to be successful even when your results are wrong.

  * [Attribution](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Attribution) gives people insight into where suggestions come from, which can help them understand mistakes.

  * [Confidence](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Confidence) helps you gauge the quality of your results, which can impact how you present them.

  * Feedback — both [explicit](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Explicit-feedback) and [implicit](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Implicit-feedback) — lets people tell you about mistakes that you might not be aware of.

**Understand the significance of a mistake’s consequences.**

**Make it easy for people to correct frequent or predictable mistakes.**

**Continuously update your feature to reflect people’s evolving interests and preferences and help avoid mistakes.**

**When possible, address mistakes without complicating the UI.**

**Be especially careful to avoid mistakes in proactive features.**

**As you work on reducing mistakes in one area, always consider the effect your work has on other areas and overall accuracy.**

## [Multiple options](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Multiple-options)

  * Suggested options, a proactive feature that suggests content to people based on the their past interactions. For example, For You recommendations from Apple Music.

  * Requested options, a reactive feature that suggests potential next steps to people based on their recent actions. For example, Quick Type suggestions.

  * Corrections, which are actions people take to fix mistakes your app has made when it’s acting on their behalf. For example, the Photos Auto-Crop feature.

**Prefer diverse options.**

**In general, avoid providing too many options.**

**List the most likely option first.**

**Make options easy to distinguish and choose.**

**Learn from selections when it makes sense.**

## [Confidence](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Confidence)

**Know what your confidence values mean before you decide how to present them.**

**In general, translate confidence values into concepts that people already understand.**

**In situations where attributions aren’t helpful, consider ranking or ordering the results in a way that implies confidence levels.**

**In scenarios where people expect statistical or numerical information, display confidence values that help them interpret the results.**

**Whenever possible, help people make decisions by conveying confidence in terms of actionable suggestions.**

**Consider changing how you present results based on different confidence thresholds.**

**When you know that confidence values correspond to result quality, you generally want to avoid showing results when confidence is low.**

## [Attribution](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Attribution)

  * Encourage people to change what they do in your app

  * Minimize the impact of [mistakes](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Mistakes)

  * Help people build a mental model of your feature

  * Promote trust in your app over time

**Consider using attributions to help people distinguish among results.**

**Avoid being too specific or too general.**

**Keep attributions factual and based on objective analysis.**

**In general, avoid technical or statistical jargon.**

## [Limitations](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Limitations)

  * Photos to perform a search that covers every category they can imagine

  * Siri to respond to queries that aren’t well defined, like “What is the meaning of life?”

  * FaceID to work from every angle

  * Set people’s expectations before they use the feature.

  * Show people how to get the best results while they’re using the feature.

  * When inferior results occur, explain why so that people can understand the feature better.

**Help people establish realistic expectations.**

**Demonstrate how to get the best results.**

  * Use placeholder text to suggest input. In Photos, the search bar displays the text “Photos, People, Places…” to help people understand what they can search for before they begin typing. Photos also displays a description of how it scans the photo library to offer search suggestions.

  * As people interact with the feature, provide feedback on their actions to guide them towards a result without overwhelming them. For example, while people are interacting with Animoji, the feature responds to current conditions and suggests how people can improve their results by adjusting the lighting or moving closer to the camera.

  * Suggest alternative ways to accomplish the goal instead of showing no results. To do this successfully, you need to understand the goal well enough to suggest alternatives that make sense. For example, if people ask Siri to set a timer on a Mac, Siri suggests setting a reminder instead, because timers aren’t available in macOS. This suggestion makes sense because people’s goal is to receive an alert at a certain time.

**Explain how limitations can cause unsatisfactory results.**

**Consider telling people when limitations are resolved.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/machine-learning#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/machine-learning

