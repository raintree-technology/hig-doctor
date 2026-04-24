---
title: "Siri | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/siri

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/siri.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Siri

  * Ask Siri to perform a system-defined task that your app supports, like send a message, play a song, or start a workout.

  * Run a _shortcut_ , which is a way to accelerate actions your app defines through onscreen interactions or by voice.

  * Use the Shortcuts app to adjust what a shortcut does, including combining several actions to perform one multistep shortcut.

  * Tap a _suggestion_ to perform a shortcut with your app (Siri can _suggest_ shortcuts that people might want to perform, based on their current context and the information you provide).

  * Use Siri to control an accessory that integrates with your app.

  * Identify key tasks in your app that people might want to perform on a regular basis.

  * Drive engagement by telling the system about your app’s key tasks and by supporting suggestions.

  * For actions that people can perform through voice interaction, design functional conversational flows that feel natural.

  * Explore the various ways people might perform your app’s tasks — such as in a hands-free situation — and the devices they might be using, such as Apple Watch or iPad.

## [Integrating your app with Siri](https://developer.apple.com/design/human-interface-guidelines/siri#Integrating-your-app-with-Siri)

### [A closer look at intents](https://developer.apple.com/design/human-interface-guidelines/siri#A-closer-look-at-intents)

### [Provide information about actions and support suggestions](https://developer.apple.com/design/human-interface-guidelines/siri#Provide-information-about-actions-and-support-suggestions)

  * Shortly before 7:30 a.m., Siri might suggest the _order coffee_ action to people who use the coffee app every morning.

  * After people use a box office–type app to buy tickets to a movie, Siri might remind them to turn on Do Not Disturb shortly before showtime.

  * Siri might suggest an automation that starts a workout in a person’s favorite workout app and plays their favorite workout playlist as they enter their usual gym.

  * When people enter the airport after a home-bound flight, Siri might suggest they request a ride home from their favorite ride-sharing app.

### [Design a great voice experience](https://developer.apple.com/design/human-interface-guidelines/siri#Design-a-great-voice-experience)

### [Recognize that people use Siri in different contexts](https://developer.apple.com/design/human-interface-guidelines/siri#Recognize-that-people-use-Siri-in-different-contexts)

## [System intents](https://developer.apple.com/design/human-interface-guidelines/siri#System-intents)

### [Design responses to system intents](https://developer.apple.com/design/human-interface-guidelines/siri#Design-responses-to-system-intents)

**Whenever possible, complete requests without leaving Siri.**

**When a request has a financial impact, default to the safest and least expensive option.**

**When people request media playback from your app, consider providing alternative results if the request is ambiguous.**

**On Apple Watch, design a streamlined workflow that requires minimal interaction.**

### [Enhance the voice experience for system intents](https://developer.apple.com/design/human-interface-guidelines/siri#Enhance-the-voice-experience-for-system-intents)

**Create example requests.**

**Define custom vocabulary that people use with your app.**

**Consider defining alternative app names.**

### [Design a custom interface for a system intent](https://developer.apple.com/design/human-interface-guidelines/siri#Design-a-custom-interface-for-a-system-intent)

**Avoid including extraneous or redundant information.**

**Make sure people can still perform the action without viewing your custom interface.**

**Use ample margins and padding in your custom interface.**

**Minimize the height of your interface.**

**Refrain from displaying your app name or icon.**

## [Custom intents](https://developer.apple.com/design/human-interface-guidelines/siri#Custom-intents)

### [Custom intent categories and responses](https://developer.apple.com/design/human-interface-guidelines/siri#Custom-intent-categories-and-responses)

  * Confirmation. Confirms that people still want to perform the action.

  * Success. Indicates that the action has been initiated.

  * Error. Tells people that the action can’t be completed.

### [Design a custom intent](https://developer.apple.com/design/human-interface-guidelines/siri#Design-a-custom-intent)

**If your app’s action requires a custom intent, pick the category that most closely matches the action.**

**Design custom intents that accelerate common, useful tasks.**

**Ensure that your intent works well in every scenario.**

**In general, design custom intents for tasks that aren’t overly complex.**

**Design your intents to be long-lived.**

**Don’t request permission to use Siri.**

**Support background operation.**

### [Help people customize their requests](https://developer.apple.com/design/human-interface-guidelines/siri#Help-people-customize-their-requests)

**Design intents that require as few follow-up questions as possible.**

**List the smallest number of options possible, and sort the items in a way that makes sense.**

**Make sure each follow-up question is meaningful.**

**Design parameters that are easy for people to understand and use.**

**Ask for confirmation only when necessary.**

**Support follow-up questions when it makes sense.**

**Prioritize the options you offer based on the context in which people run your shortcut.**

**Consider adjusting the parameter values you offer when people set up your shortcut.**

  * You can find and present parameter values that are relevant to the context people are in while they’re setting up the shortcut. For example, if people use the Shortcuts app to choose a value for a store-location parameter, the parameter can dynamically generate a list of stores that are currently closest to the device.

  * You can present a comprehensive list of parameter values. When people set up a shortcut, having an extensive list of parameter values can help them create the shortcut they want. In contrast, when people use a shortcut to accelerate an action, they generally prefer the convenience of having a shorter list of choices.

### [Enhance the voice experience for custom intents](https://developer.apple.com/design/human-interface-guidelines/siri#Enhance-the-voice-experience-for-custom-intents)

**Aim to create conversational interactions.**

**Help people understand errors and failures.**

**Strive for engaging voice responses.**

**Create voice responses that are concise, descriptive, and effective in voice-driven scenarios.**

**Avoid unnecessary repetition.**

**Help conversations with Siri feel natural.**

**Exclude your app name.**

**Don’t attempt to mimic or manipulate Siri.**

**Be appropriate and respect parental controls.**

**Avoid using personal pronouns.**

**Consider letting people view more options in your app.**

**Keep responses device-independent.**

**Don’t advertise.**

## [Shortcuts and suggestions](https://developer.apple.com/design/human-interface-guidelines/siri#Shortcuts-and-suggestions)

  * Siri can suggest a shortcut for an action people have performed at least once by offering it in search results, on the lock screen, and in the Shortcuts app.

  * Your app can supply a shortcut for an action that people haven’t done yet but might want to do in the future, so that the Shortcuts app can suggest it or it can appear on the [Siri watch face](https://support.apple.com/guide/watch/faces-and-features-apde9218b440/watchos#apdcc88df92c).

  * People can use the Shortcuts app to view all their shortcuts and even combine actions from different apps into multistep shortcuts.

  * People can also use the Shortcuts app to automate a shortcut by defining the conditions that can run it, like time of day or current location.

### [Make app actions widely available](https://developer.apple.com/design/human-interface-guidelines/siri#Make-app-actions-widely-available)

  * In search results

  * Throughout the Shortcuts app

  * On the lock screen as a Siri Suggestion

  * Within the Now Playing view (for recently played media content)

  * During Wind Down

**Make a donation every time people perform the action.**

**Only donate actions that people actually perform.**

**Remove donations for actions that require corresponding data.**

**If your app handles reservations, consider donating them to the system.**

#### [Suggest Shortcuts people might want to add to Siri](https://developer.apple.com/design/human-interface-guidelines/siri#Suggest-Shortcuts-people-might-want-to-add-to-Siri)

#### [Display shortcuts on the Siri watch face](https://developer.apple.com/design/human-interface-guidelines/siri#Display-shortcuts-on-the-Siri-watch-face)

### [Create shortcut titles and subtitles](https://developer.apple.com/design/human-interface-guidelines/siri#Create-shortcut-titles-and-subtitles)

**Be concise but descriptive.**

**Start titles with a verb and use sentence-style capitalization without punctuation.**

**Lead with important information.**

**Exclude your app name.**

**Localize titles and subtitles.**

**Consider providing a custom image for a more engaging suggestion.**

  * 60x60 pt (180x180 px @ 3x) to display in an iOS app

  * 34x34 pt (68x68 px @2x) to display on the Siri watch face on the 44mm Apple Watch (watchOS scales down the image for smaller watches)

### [Provide default phrases for shortcuts](https://developer.apple.com/design/human-interface-guidelines/siri#Provide-default-phrases-for-shortcuts)

**Keep phrases short and memorable.**

**Make sure the phrases you suggest are accurate and specific.**

**Don’t commandeer core Siri commands.**

### [Make shortcuts customizable](https://developer.apple.com/design/human-interface-guidelines/siri#Make-shortcuts-customizable)

**Provide a parameter summary for each custom intent you support.**

**Craft a short parameter summary that’s clearly related to your intent’s title.**

**Aim for a parameter summary that reads like a sentence.**

**Provide multiple parameter summaries when necessary.**

**Provide output parameters for information that people can use in a multistep shortcut.**

**Consider defining an input parameter.**

**Help people distinguish among different variations of the same action.**

**Avoid providing multiple actions that perform the same basic task.**

## [Editorial guidelines](https://developer.apple.com/design/human-interface-guidelines/siri#Editorial-guidelines)

**Use correct capitalization and punctuation when using the term _Hey Siri_.**

**In a localized context, translate only the word _Hey_ in the phrase _Hey Siri_.**

### [Referring to Shortcuts](https://developer.apple.com/design/human-interface-guidelines/siri#Referring-to-Shortcuts)

**When referring to the Shortcuts feature or app, always typeset with a capital S and make sure that _Shortcuts_ is plural.**

**When referring to individual shortcuts (that is, not the feature or the Shortcuts app), use lowercase.**

**Use the right terminology when describing how people can use Shortcuts in your app.**

### [Referring to Apple products](https://developer.apple.com/design/human-interface-guidelines/siri#Referring-to-Apple-products)

**Adhere to Apple’s trademark guidelines.**

  * Use Apple product names in singular form only; don’t make Apple product names possessive.

  * Don’t translate Apple, Siri, or any other Apple trademark.

  * Don’t use category descriptors. For example, say iPad, not tablet.

  * Don’t indicate any kind of sponsorship, partnership, or endorsement from Apple.

  * Attribute Apple, Siri, and all other Apple trademarks with the correct credit lines wherever legal information appears within your app.

  * Refer to Apple devices and operating systems only in technical specifications or compatibility descriptions.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/siri#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/siri#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/siri#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/siri#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/siri#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/siri#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/siri

