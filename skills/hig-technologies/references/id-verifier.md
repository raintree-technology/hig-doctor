---
title: "ID Verifier | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/id-verifier

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/id-verifier.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# ID Verifier

  * Customers only present the minimum data needed to prove their age or identity, without handing over their ID card or showing their device.

  * Apple provides the key components of the certificate issuance, management, and validation process, simplifying app development and enabling a consistent and trusted ID verification experience.

  * **Display Only request.** Use a Display Only request to display data — such as a person’s name or age alongside their photo portrait — within system-provided UI on the requester’s iPhone, so the requester can visually confirm the person’s identity. When you make a Display Only request, the customer’s data remains within the system-provided UI and isn’t transmitted to your app. For developer guidance, see [`MobileDriversLicenseDisplayRequest`](https://developer.apple.com/documentation/ProximityReader/MobileDriversLicenseDisplayRequest).

  * **Data Transfer request.** Use a Data Transfer request only when you have a legal verification requirement and you need to store or process information like a person’s address or date of birth. You must request an additional entitlement to make a Data Transfer request. To learn more, see [Get started with ID Verifier](https://developer.apple.com/wallet/id-verifier/); for developer guidance, see [`MobileDriversLicenseDataRequest`](https://developer.apple.com/documentation/ProximityReader/MobileDriversLicenseDataRequest) and [`MobileDriversLicenseRawDataRequest`](https://developer.apple.com/documentation/ProximityReader/MobileDriversLicenseRawDataRequest).

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Best-practices)

**Ask only for the data you need.**

**If your app qualifies for Apple Business Register, register for ID Verifier to ensure that people can view essential information about your organization when you make a request.**

**Provide a button that initiates the verification process.**

**In a Display Only request, help the person using your app provide feedback on the visual confirmation they perform.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Platform-considerations)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/id-verifier#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/id-verifier

