---
title: "Playing video | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/playing-video

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/playing-video.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Playing video

  * In full-screen — or _aspect-fill_ — mode, the video scales to fill the display, and some edge cropping may occur. This mode is the default for wide video (2:1 through 2.40:1). For developer guidance, see [`resizeAspectFill`](https://developer.apple.com/documentation/AVFoundation/AVLayerVideoGravity/resizeAspectFill).

  * In fit-to-screen — or _aspect_ — mode, the entire video is visible onscreen, and letterboxing or pillarboxing occurs as needed. This mode is the default for standard video (4:3, 16:9, and anything up to 2:1) and ultrawide video (anything above 2.40:1). For developer guidance, see [`resizeAspect`](https://developer.apple.com/documentation/AVFoundation/AVLayerVideoGravity/resizeAspect).

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/playing-video#Best-practices)

**Use the system video player to give people a familiar and convenient experience.**

**Always display video content at its original aspect ratio.**

  * Result of padding a 4:3 video 
  * Result of padding a 21:9 video 

**Provide additional information when it adds value.**

**Support the interactions people expect, regardless of the input device they’re using to control playback.**

**If people need to access playback options or content-specific information in your tvOS app, consider adding a transport control or a custom content tab.**

**Avoid allowing audio from different sources to mix as viewers switch between modes.**

## [Integrating with the TV app](https://developer.apple.com/design/human-interface-guidelines/playing-video#Integrating-with-the-TV-app)

**Ensure a smooth transition to your app.**

**Show the expected content immediately.**

**Avoid asking people if they want to resume playback.**

**Play or pause playback when people press Space on a connected Bluetooth keyboard.**

**Make sure content plays for the correct viewer.**

**Use the previous end time when resuming playback of a long video clip.**

### [Loading content](https://developer.apple.com/design/human-interface-guidelines/playing-video#Loading-content)

**Avoid displaying loading screens when possible.**

**Start playback immediately.**

**Minimize loading screen content.**

### [Exiting playback](https://developer.apple.com/design/human-interface-guidelines/playing-video#Exiting-playback)

**Show a contextually relevant screen.**

**Be prepared for an immediate exit.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/playing-video#Platform-considerations)

### [tvOS](https://developer.apple.com/design/human-interface-guidelines/playing-video#tvOS)

**Defer to content when displaying logos or noninteractive overlays above video.**

**Show interactive overlays gracefully.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/playing-video#visionOS)

**Help people stay comfortable when playing video in your app.**

  * Letting them choose when to start playing a video

  * Using a small window for playback, letting people resize it if they want

  * Making sure people can see their surroundings during playback

**In a fully immersive experience, avoid letting virtual content obscure playback or transport controls.**

**Avoid automatically starting a fully immersive video playback experience.**

**Create a thumbnail track if you want to support scrubbing.**

**Avoid expanding an inline video player to fill a window.**

**Use a RealityKit video player if you need to play video in a view like a splash screen or a transitional view.**

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/playing-video#watchOS)

**Keep video clips short.**

**Use the recommended sizes and encoding values for media assets.**

**Avoid creating a poster image that looks like a system control.**

**Consider creating a poster image that represents a video clip’s contents.**

## [Resources](https://developer.apple.com/design/human-interface-guidelines/playing-video#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/playing-video#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/playing-video#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/playing-video#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/playing-video#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/playing-video

