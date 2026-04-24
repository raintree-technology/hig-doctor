---
title: "Privacy | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/privacy

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/privacy.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Privacy

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/privacy#Best-practices)

**Request access only to data that you actually need.**

**Be transparent about how your app collects and uses people’s data.**

**Process data on the device where possible.**

**Adopt system-defined privacy protections and follow security best practices.**

## [Requesting permission](https://developer.apple.com/design/human-interface-guidelines/privacy#Requesting-permission)

  * Personal data, including location, health, financial, contact, and other personally identifying information

  * User-generated content like emails, messages, calendar data, contacts, gameplay information, Apple Music activity, HomeKit data, and audio, video, and photo content

  * Protected resources like Bluetooth peripherals, home automation features, Wi-Fi connections, and local networks

  * Device capabilities like camera and microphone

  * In a visionOS app running in a Full Space, ARKit data, such as hand tracking, plane estimation, image anchoring, and world tracking

  * The device’s advertising identifier, which supports app tracking

**Request permission only when your app clearly needs access to the data or resource.**

**Avoid requesting permission at launch unless the data or resource is required for your app to function.**

**Write copy that clearly describes how your app uses the ability, data, or resource you’re requesting.**

  * Example 1 
  * Example 2 
  * Example 3 

### [Pre-alert screens, windows, or views](https://developer.apple.com/design/human-interface-guidelines/privacy#Pre-alert-screens-windows-or-views)

**Include only one button and make it clear that it opens the system alert.**

**Don’t include additional actions in your custom screen or window.**

### [Tracking requests](https://developer.apple.com/design/human-interface-guidelines/privacy#Tracking-requests)

**Never precede the system-provided alert with a custom screen or window that could confuse or mislead people.**

  * Incentive 
  * Imitation request 
  * Alert image 
  * Alert annotation 

## [Location button](https://developer.apple.com/design/human-interface-guidelines/privacy#Location-button)

**Consider using the location button to give people a lightweight way to share their location for specific app features.**

**Consider customizing the location button to harmonize with your UI.**

  * Choose the system-provided title that works best with your feature, such as “Current Location” or “Share My Current Location.”

  * Choose the filled or outlined location glyph.

  * Select a background color and a color for the title and glyph.

  * Adjust the button’s corner radius.

## [Protecting data](https://developer.apple.com/design/human-interface-guidelines/privacy#Protecting-data)

**Avoid relying solely on passwords for authentication.**

**Store sensitive information in a keychain.**

**Never store passwords or other secure content in plain-text files.**

**Avoid inventing custom authentication schemes.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/privacy#Platform-considerations)

### [macOS](https://developer.apple.com/design/human-interface-guidelines/privacy#macOS)

**Sign your app with a valid Developer ID.**

**Protect people’s data with app sandboxing.**

**Avoid making assumptions about who is signed in.**

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/privacy#visionOS)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/privacy#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/privacy#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/privacy#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/privacy#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/privacy#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/privacy

