---
title: "Tap to Pay on iPhone | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Tap to Pay on iPhone

## [Enabling Tap to Pay on iPhone](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Enabling-Tap-to-Pay-on-iPhone)

**Help merchants accept Tap to Pay on iPhone terms and conditions before they begin interacting with their customers.**

**Present Tap to Pay on iPhone terms and conditions only to an administrative user.**

**If necessary, help merchants make sure their device is up to date.**

## [Educating merchants](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Educating-merchants)

**Provide a tutorial that describes the supported payment types and shows how to use Tap to Pay on iPhone to accept each type.**

  * Including it in a Learn More option in your in-app messaging

  * Automatically presenting it after merchants accept the Tap to Pay on iPhone terms and conditions

  * Automatically presenting it to new users of your app

  * Making it easy to find in a consistent place like your app’s help content or settings area

  * Launch a checkout flow for each type of payment

  * Help a customer position their contactless card or digital wallet on the merchant’s device for payment

  * Handle PIN entry for a card, including accessibility mode

## [Checking out](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Checking-out)

  * Offer payment options in addition to Tap to Pay on iPhone, as necessary

  * Respond quickly if a merchant initiates checkout before enabling Tap to Pay on iPhone

  * Help merchants perform checkout even if device configuration is still in progress

  * Present pre-payment actions that affect the final total before checkout completes

**Provide Tap to Pay on iPhone as a checkout option whether the feature is enabled or not.**

**Avoid making merchants wait to use Tap to Pay on iPhone.**

**Make sure the Tap to Pay on iPhone checkout option is available even if configuration is continuing in the background.**

**If your app supports multiple payment-acceptance methods, make the Tap to Pay on iPhone button easy to find.**

**Make it easy for merchants to switch between Tap to Pay on iPhone and the hardware accessories you support.**

**Design your Tap to Pay on iPhone button to match the other buttons in your app.**

**Determine the final amount that customers need to pay before merchants initiate the Tap to Pay on iPhone experience.**

**If you support pre-payment options in your checkout flow, display them before the Tap to Pay on iPhone screen.**

## [Displaying results](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Displaying-results)

**Start processing a transaction as soon as possible.**

**Display a progress indicator while payment is authorizing before you show your transaction result screen.**

**Clearly display the result of a transaction, whether it’s declined or successful.**

**Help merchants complete the checkout flow when a payment can’t complete with Tap to Pay on iPhone.**

  * Present a new screen or reuse your checkout screen, letting merchants accept an alternate form of payment, like cash

  * Support checkout with a different method, like external hardware or a payment link

  * Relaunch Tap to Pay on iPhone, if a customer has another card they want to try

  * Some regions require Strong Customer Authentication (SCA) support, which means that although the payment card might not require a card PIN during a tap, the bank that issues the card can request a PIN after receiving the transaction processing request. In this scenario, your app may need to display the PIN entry screen instead of the transaction result.

  * In some regions your app may need to meet additional requirements to address the limitations of some cards, such as those in Offline PIN markets. Some PSPs support additional PIN fallback functionality to collect partial data from a tap, letting merchants continue the payment with another method such as a payment link.

**If the system returns an error that the merchant must address, display a clear description of the problem and recommend an appropriate resolution.**

**Make it easy for merchants to get help with issues they can’t resolve.**

## [Additional interactions](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Additional-interactions)

**Use a generic label in a button that opens the Tap to Pay on iPhone screen to read a payment card when there’s no transaction amount.**

**If your app supports an independent loyalty card transaction, distinguish this flow from a payment-acceptance flow that uses Tap to Pay on iPhone.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Developer-documentation)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone

