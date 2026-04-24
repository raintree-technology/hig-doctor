---
title: "Apple Pay | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/apple-pay

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/apple-pay.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Apple Pay

## [Offering Apple Pay](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Offering-Apple-Pay)

**Offer Apple Pay on all devices and browsers that support it.**

**If you use Apple Pay APIs to find out whether someone has an active card in Wallet, you must make Apple Pay the primary — but not necessarily sole — payment option everywhere you use the APIs.**

**If you also offer other payment methods, offer Apple Pay at the same time.**

**If you use an Apple Pay button to start the Apple Pay payment process, you must use the Apple-provided API to display it.**

**If you use a custom button to start the Apple Pay payment process, make sure your custom button doesn’t display “Apple Pay” or the Apple Pay logo.**

**Use Apple Pay buttons only to start the Apple Pay payment process and, when appropriate, the Apple Pay set-up process.**

**Don’t hide an Apple Pay button or make it appear unavailable.**

**Use the Apple Pay mark only to communicate that Apple Pay is accepted.**

**Inform search engines that Apple Pay is accepted on your website.**

## [Streamlining checkout](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Streamlining-checkout)

**Provide a cohesive checkout experience.**

**If Apple Pay is available, assume the person wants to use it.**

**Accelerate single-item purchases with Apple Pay buttons on product detail pages.**

**Accelerate multi-item purchases with express checkout.**

**Collect necessary information, like color and size options, before people reach the Apple Pay button.**

**Collect optional information before checkout begins.**

**Gather multiple shipping methods and destinations before showing the payment sheet.**

**For in-store pickup, help people choose a pickup location before displaying the payment sheet.**

**Prefer information from Apple Pay.**

**Avoid requiring account creation prior to purchase.**

**Report the result of the transaction so that people can view it in the payment sheet.**

**Display an order confirmation or thank-you page.**

### [Customizing the payment sheet](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Customizing-the-payment-sheet)

**Only present and request essential information.**

**Display the active coupon or promotional code, or give people a way to enter it.**

**Let people choose the shipping method in the payment sheet.**

**For in-store pickup, consider letting people choose a pickup window that works for them.**

**Use line items to explain additional charges, discounts, pending costs, add-on donations, recurring, and future payments.**

  * iOS 
  * Web 

**Keep line items short.**

**Provide a business name after the word _Pay_ on the same line as the total.**

**If you’re not the end merchant, specify both your business name and the end merchant’s name in the payment sheet.**

**Clearly disclose when additional costs may be incurred after payment authorization.**

**Handle data entry and payment errors gracefully.**

### [Displaying a website icon](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Displaying-a-website-icon)

## [Handling errors](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Handling-errors)

### [Data validation](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Data-validation)

  * iOS 
  * Web 

**Avoid forcing compliance with your business logic.**

**Provide accurate status reporting to the system.**

**Succinctly and specifically describe the problem when data is invalid or incorrectly formatted.**

### [Payment processing](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Payment-processing)

**Handle interruptions correctly.**

## [Supporting subscriptions](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions)

  * iOS 
  * Web 

**Clarify subscription details before showing the payment sheet.**

**Include line items that reiterate billing frequency, discounts, and additional upfront fees.**

  * iOS 
  * Web 

**Clarify the current payment amount in the total line.**

**Only show the payment sheet when a subscription change results in additional fees.**

### [Supporting donations](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-donations)

**Use a line item to denote a donation.**

**Streamline checkout by offering predefined donation amounts.**

## [Using Apple Pay buttons](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Using-Apple-Pay-buttons)

### [Button types](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Button-types)

  * A button that is guaranteed to use an Apple-approved caption, font, color, and style

  * Assurance that the button’s contents maintain ideal proportions as you change its size

  * Automatic translation of the button’s caption into the language that’s set for the device

  * Support for configuring the button’s corner radius to match the style of your UI

  * A system-provided alternative text label that lets VoiceOver describe the button

### [Button styles](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Button-styles)

#### [Black](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Black)

#### [White with outline](https://developer.apple.com/design/human-interface-guidelines/apple-pay#White-with-outline)

#### [White](https://developer.apple.com/design/human-interface-guidelines/apple-pay#White)

### [Button size and position](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Button-size-and-position)

**Prominently display the Apple Pay button.**

**Position the Apple Pay button correctly in relation to an Add to Cart button.**

**Adjust the corner radius to match the appearance of other buttons.**

**Maintain the minimum button size and margins around the button.**

### [Apple Pay mark](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Apple-Pay-mark)

**Use only the artwork provided by Apple, with no alterations other than height.**

**Maintain a minimum clear space around the mark of 1/10 of its height.**

## [Referring to Apple Pay](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Referring-to-Apple-Pay)

**Capitalize Apple Pay in text as it appears in the Apple Trademark list.**

**Never use the Apple logo to represent the name _Apple_ in text.**

**Coordinate the font face and size with your app.**

**Don’t translate _Apple Pay_ or any other Apple trademark.**

**In a payment selection context, you can display a text-only description of Apple Pay only when all payment options have text-only descriptions.**

**When promoting your app’s use of Apple Pay, follow App Store guidelines.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/apple-pay

