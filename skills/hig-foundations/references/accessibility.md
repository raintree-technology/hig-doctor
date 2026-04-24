---
title: "Accessibility | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/accessibility

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/accessibility.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Accessibility

  * **Intuitive.** Your interface uses familiar and consistent interactions that make tasks straightforward to perform.

  * **Perceivable.** Your interface doesn’t rely on any single method to convey information. People can access and interact with your content, whether they use sight, hearing, speech, or touch.

  * **Adaptable.** Your interface adapts to how people want to use their device, whether by supporting system accessibility features or letting people personalize settings.

## [Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision)

**Support larger text sizes.**

**Use recommended defaults for custom type sizes.**

**Bear in mind that font weight can also impact how easy text is to read.**

**Strive to meet color contrast minimum standards.**

**Prefer system-defined colors.**

**Convey information with more than color alone.**

**Describe your app’s interface and content for VoiceOver.**

## [Hearing](https://developer.apple.com/design/human-interface-guidelines/accessibility#Hearing)

**Support text-based ways to enjoy audio and video.**

  * **Captions** give people the textual equivalent of audible information in video or audio-only content. Captions are great for scenarios like game cutscenes and video clips where text synchronizes live with the media.

  * **Subtitles** allow people to read live onscreen dialogue in their preferred language. Subtitles are great for TV shows and movies.

  * **Audio descriptions** are interspersed between natural pauses in the main audio of a video and supply spoken narration of important information that’s presented only visually.

  * **Transcripts** provide a complete textual description of a video, covering both audible and visual information. Transcripts are great for longer-form media like podcasts and audiobooks where people may want to review content as a whole or highlight the transcript as media is playing.

**Use haptics in addition to audio cues.**

**Augment audio cues with visual cues.**

## [Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)

**Offer sufficiently sized controls.**

**Consider spacing between controls as important as size.**

**Support simple gestures for common interactions.**

**Offer alternatives to gestures.**

**Let people use Voice Control to give guidance and enter information verbally.**

**Integrate with Siri and Shortcuts to let people perform tasks using voice alone.**

**Support mobility-related assistive technologies.**

## [Speech](https://developer.apple.com/design/human-interface-guidelines/accessibility#Speech)

**Let people use the keyboard alone to navigate and interact with your app.**

**Support Switch Control.**

## [Cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)

**Keep actions simple and intuitive.**

**Minimize use of time-boxed interface elements.**

**Consider offering difficulty accommodations in games.**

**Let people control audio and video playback.**

**Allow people to opt out of flashing lights in video playback.**

**Be cautious with fast-moving and blinking animations.**

  * Tightening animation springs to reduce bounce effects

  * Tracking animations directly with people’s gestures

  * Avoiding animating depth changes in z-axis layers

  * Replacing transitions in x-, y-, and z-axes with fades to avoid motion

  * Avoiding animating into and out of blurs

**Optimize your app’s UI for Assistive Access.**

  * Identify the core functionality of your app and consider removing noncritical workflows and UI elements.

  * Break up multistep workflows so people can focus on a single interaction per screen.

  * Always ask for confirmation twice whenever people perform an action that’s difficult to recover from, such a deleting a file.

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/accessibility#Platform-considerations)

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/accessibility#visionOS)

  * Pointer Control (hand) 
  * Pointer Control (head) 
  * Zoom 

**Prioritize comfort.**

  * Keep interface elements within a person’s field of view. Prefer horizontal layouts to vertical ones that might cause neck strain, and avoid demanding the viewer’s attention in different locations in quick succession.

  * Reduce the speed and intensity of animated objects, particularly in someone’s peripheral vision.

  * Be gentle with camera and video motion, and avoid situations where someone may feel like the world around them is moving without their control.

  * Avoid anchoring content to the wearer’s head, which may make them feel stuck and confined, and also prevent them from using assistive technologies like Pointer Control.

  * Minimize the need for large and repetitive gestures, as these can become tiresome and may be difficult depending on a person’s surroundings.

## [Resources](https://developer.apple.com/design/human-interface-guidelines/accessibility#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/accessibility#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/accessibility#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/accessibility#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/accessibility#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/accessibility

