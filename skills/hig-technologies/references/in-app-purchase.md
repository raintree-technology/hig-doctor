---
title: "In-app purchase | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/in-app-purchase

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/in-app-purchase.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# In-app purchase

  * _Consumable_ content like lives or gems in a game. After purchase, consumable content depletes as people use it, and people can purchase it again.

  * _Non-consumable_ content like premium features in an app. Purchased non-consumable content doesn’t expire.

  * _Auto-renewable subscriptions_ to virtual content, services, and premium features in your app on an ongoing basis. An auto-renewable subscription continues to automatically renew at the end of each subscription period until people choose to cancel it.

  * _Non-renewing subscriptions_ to a service or content that lasts for a limited time, like access to an in-game battle pass. People purchase a non-renewing subscription each time they want to extend their access to the service or content.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Best-practices)

**Let people experience your app before making a purchase.**

**Design an integrated shopping experience.**

**Use simple, succinct product names and descriptions.**

**Display the total billing price for each in-app purchase you offer, regardless of type.**

**Display your store only when people can make payments.**

**Use the default confirmation sheet.**

### [Supporting Family Sharing](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Supporting-Family-Sharing)

**Prominently mention Family Sharing in places where people learn about the content you offer.**

**Help people understand the benefits of Family Sharing and how to participate.**

**Aim to customize your in-app messaging so that it makes sense to both purchasers and family members.**

### [Providing help with in-app purchases](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Providing-help-with-in-app-purchases)

**Provide help that customers can view before they request a refund.**

**Use a simple title for the refund action, like “Refund” or “Request a Refund”.**

**Help people find the problematic purchase.**

**Consider offering alternative solutions.**

**Make it easy for people to request a refund.**

**Avoid characterizing or providing guidance on Apple’s refund policies.**

## [Auto-renewable subscriptions](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Auto-renewable-subscriptions)

**Call attention to subscription benefits during onboarding.**

**Offer a range of content choices, service levels, and durations.**

**Consider letting people try your content for free before signing up.**

  * Freemium app 
  * Metered paywall 
  * Free trial 

**Prompt people to subscribe at relevant times, like when they near their monthly limit of free content.**

**Encourage a new subscription only when someone isn’t already a subscriber.**

### [Making signup effortless](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Making-signup-effortless)

**Provide clear, distinguishable subscription options.**

**Simplify initial signup by asking only for necessary information.**

**In your tvOS app, help people sign up or authenticate using another device.**

**Give people more information in your app’s sign-up screen.**

  * The subscription name, duration, and the content or services provided during each subscription period

  * The billing amount, correctly localized for the territories and currencies where the subscription is available for purchase

  * A way for existing subscribers to sign in or restore purchases

**Clearly describe how a free trial works.**

**Include a sign-up opportunity in your app’s settings.**

### [Supporting offer codes](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Supporting-offer-codes)

  * A _one-time use code_ is a unique code you generate in App Store Connect. People can redeem a one-time use code through a [redemption URL](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-offer-codes/#distribute-offer-codes) (a shareable link), within your app (when you support redemption), or by entering it in the App Store, where they’re prompted to install your app if they haven’t already. Consider using one-time use codes when your distribution is small or when you need to restrict access to a code.

  * A _custom code_ is a code you create, such as NEWYEAR or SPRINGSALE. People can redeem a custom code through a redemption URL or within your app (when you support redemption). Consider using a custom code when you want to support a large campaign that requires a mass distribution of codes.

**Clearly explain offer details.**

**Follow guidelines for creating a custom code.**

**Tell people how to redeem a custom code.**

**Consider supporting offer redemption within your app.**

**Supply an engaging and informative promotional image.**

**Help people benefit from unlocked content as soon as they complete the redemption flow.**

### [Helping people manage their subscriptions](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Helping-people-manage-their-subscriptions)

**Provide summaries of the customer’s subscriptions.**

**Consider using the system-provided subscription-management UI.**

**Consider ways to encourage a subscriber to keep their subscription or resubscribe later.**

**Always make it easy for customers to cancel an auto-renewable subscription.**

**Consider creating a branded, contextual experience to complement the system-provided management UI.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Platform-considerations)

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#watchOS)

**Clearly describe the differences between versions of your app that run on different devices.**

**Consider using a modal sheet to display the required information.**

**Make subscription options easy to compare on a small screen.**

  * Display each option in a separate button. Using one button per payment option lets people start the signup process with one tap. In this design, it’s important to lock up each button with its description so that people can see how these elements are related, especially while scrolling.

  * Display a list of options, followed by a button people tap to start the signup process. Using a list to display one option per row gives you a compact design that minimizes scrolling while making subscription choices easy to scan and understand. In this design, the button’s title can update to reflect the chosen option.

## [Resources](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/in-app-purchase

