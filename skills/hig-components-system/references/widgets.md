---
title: "Widgets | Apple Developer Documentation"
source: https://developer.apple.com/design/human-interface-guidelines/widgets

<!-- hig-doctor:attribution -->
> **Source**: Apple Inc. Canonical content at https://developer.apple.com/design/human-interface-guidelines/widgets.
> This file is a structured index of that content, snapshot 2025-02-02.
> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.


# Widgets

  * On the Home Screen and Lock Screen of their iPhone and iPad

  * On the desktop and Notification Center of their Mac

  * On a horizontal or vertical surface when they wear Apple Vision Pro

  * At a fixed position in the Smart Stack of Apple Watch

## [Anatomy](https://developer.apple.com/design/human-interface-guidelines/widgets#Anatomy)

  * The widget size to support

  * The context — devices and system experiences — in which the widget may appear

  * The rendering modes and color treatment that the widget receives based on the size and context

### [System family widgets](https://developer.apple.com/design/human-interface-guidelines/widgets#System-family-widgets)

  * Small 
  * Medium 
  * Large 
  * Extra large 
  * Extra large portrait 

### [Accessory widgets](https://developer.apple.com/design/human-interface-guidelines/widgets#Accessory-widgets)

  * Accessory circular 
  * Accessory corner 
  * Accessory inline 
  * Accessory rectangular 

### [Appearances](https://developer.apple.com/design/human-interface-guidelines/widgets#Appearances)

  * On the Home Screen of iPhone and iPad, people choose from different appearances for widgets: light, dark, clear, and tinted. In light and dark appearances, widgets have a full-color design. In a clear appearance, the system desaturates the widget and adds translucency, highlights, and the Liquid Glass material. In a tinted appearance, the system desaturates the widget and its content, then applies a person’s selected tint color.

  * On Apple Vision Pro, the widget appears as a 3D object, surrounded by a frame. It takes on a full-color appearance with a glass- or paper-like coating layer that responds to lighting conditions. Additionally, people can choose a tinted appearance that applies a color from a set of system-provided color palettes.

  * On the Lock Screen of iPad, the widget takes on a monochromatic appearance without a tint color.

  * On the Lock Screen of iPhone in StandBy, the widget appears scaled up in size with the background removed. When the ambient light falls below a threshold, the system renders the widget with a monochromatic red tint.

  * On the Lock Screen of iPhone and iPad, it takes on a monochromatic appearance without a tint color.

  * On Apple Watch, the widget can appear as a watch complication in both full-color and tinted appearances, and it can also appear in the Smart Stack.

  * iPhone Lock Screen 
  * Watch complication 
  * Smart Stack on Apple Watch 

  * The system uses the [full color](https://developer.apple.com/documentation/WidgetKit/WidgetRenderingMode/fullColor) rendering mode for system family widgets across all platforms to display your widget in full color. It doesn’t change the color of your views.

  * The system uses the [accented](https://developer.apple.com/documentation/WidgetKit/WidgetRenderingMode/accented) rendering mode for system family widgets across all platforms and for accessory widgets on Apple Watch. In the accented rendering mode, the system removes the background and replaces it with a tinted color effect for a tinted appearance and a Liquid Glass background for a clear appearance. Additionally, it divides the widget’s views into an accent group and a primary group, and then applies a solid color to each group.

  * The system uses the [vibrant](https://developer.apple.com/documentation/WidgetKit/WidgetRenderingMode/vibrant) rendering mode for widgets on the Lock Screen of iPhone and iPad, and on iPhone in StandBy in low-light conditions. It desaturates text, images, and gauges, and creates a vibrant effect by coloring your content appropriately for the Lock Screen background or a macOS desktop. Note that people can customize the Lock Screen with a tint color, and the system applies a red tint for widgets that appear on iPhone in StandBy in low-light conditions.

## [Best practices](https://developer.apple.com/design/human-interface-guidelines/widgets#Best-practices)

**Choose simple ideas that relate to your app’s main purpose.**

**Aim to create a widget that gives people quick access to the content they want.**

**Prefer dynamic information that changes throughout the day.**

**Look for opportunities to surprise and delight.**

**Offer widgets in multiple sizes when doing so adds value.**

**Balance information density.**

**Display only the information that’s directly related to the widget’s main purpose.**

**Use brand elements thoughtfully.**

**Choose between automatically displaying content and letting people customize displayed information.**

**Avoid mirroring your widget’s appearance within your app.**

**Let people know when authentication adds value.**

### [Updating widget content](https://developer.apple.com/design/human-interface-guidelines/widgets#Updating-widget-content)

**Keep your widget up to date.**

**Use system functionality to refresh dates and times in your widget.**

**Use animated transitions to bring attention to data updates.**

### [Adding interactivity](https://developer.apple.com/design/human-interface-guidelines/widgets#Adding-interactivity)

**Offer simple, relevant functionality and reserve complexity for your app.**

**Ensure that a widget interaction opens your app at the right location.**

**Offer interactivity while remaining glanceable and uncluttered.**

### [Choosing margins and padding](https://developer.apple.com/design/human-interface-guidelines/widgets#Choosing-margins-and-padding)

**In general, use standard margins to ensure legibility.**

**Coordinate the corner radius of your content with the corner radius of the widget.**

### [Displaying text in widgets](https://developer.apple.com/design/human-interface-guidelines/widgets#Displaying-text-in-widgets)

**Prefer using the system font, text styles, and SF Symbols.**

**Avoid very small font sizes.**

**Avoid rasterizing text.**

### [Using color](https://developer.apple.com/design/human-interface-guidelines/widgets#Using-color)

**Use color to enhance a widget’s appearance without competing with its content.**

**Convey meaning without relying on specific colors to represent information.**

**Use full-color images judiciously.**

## [Rendering modes](https://developer.apple.com/design/human-interface-guidelines/widgets#Rendering-modes)

### [Full-color](https://developer.apple.com/design/human-interface-guidelines/widgets#Full-color)

**Support light and dark appearances.**

### [Accented](https://developer.apple.com/design/human-interface-guidelines/widgets#Accented)

**Group widget components into an accented and a primary group.**

### [Vibrant](https://developer.apple.com/design/human-interface-guidelines/widgets#Vibrant)

**Offer enough contrast to ensure legibility.**

**Create optimized assets for the best vibrant effect.**

## [Previews and placeholders](https://developer.apple.com/design/human-interface-guidelines/widgets#Previews-and-placeholders)

**Design a realistic preview to display in the widget gallery.**

**Design placeholder content that helps people recognize your widget.**

**Write a succinct widget description.**

**Group your widget’s sizes together, and provide a single description.**

**Consider coloring the Add button.**

## [Platform considerations](https://developer.apple.com/design/human-interface-guidelines/widgets#Platform-considerations)

### [iOS, iPadOS](https://developer.apple.com/design/human-interface-guidelines/widgets#iOS-iPadOS)

**Support the Always-On display on iPhone.**

**Offer Live Activities to show real-time updates.**

#### [StandBy and CarPlay](https://developer.apple.com/design/human-interface-guidelines/widgets#StandBy-and-CarPlay)

**Limit usage of rich images or color to convey meaning in StandBy.**

  * Correct usage 
  * Incorrect usage 

### [visionOS](https://developer.apple.com/design/human-interface-guidelines/widgets#visionOS)

**Adapt your design and content for the spatial experience Apple Vision Pro provides.**

**Test your widgets across the full range of system color palettes and in different lighting conditions.**

#### [Thresholds and sizes](https://developer.apple.com/design/human-interface-guidelines/widgets#Thresholds-and-sizes)

**Design a responsive layout that shows the right level of detail for each of the two thresholds.**

**Offer widget family sizes that fit a person’s surroundings well.**

**Display content in a way that remains legible from a range of distances.**

#### [Mounting styles](https://developer.apple.com/design/human-interface-guidelines/widgets#Mounting-styles)

  * **[Elevated](https://developer.apple.com/documentation/WidgetKit/WidgetMountingStyle/elevated) style**. On horizontal surfaces — for example, on a desk — the widget always appears elevated and gently tilts backward, providing a subtle angle that improves readability, and casts a soft shadow that helps it feel grounded on the surface. On vertical surfaces — for example, on a wall — the widget either appears elevated, sitting flush on the surface and similar to how you mount a picture frame.

  * **[Recessed](https://developer.apple.com/documentation/WidgetKit/WidgetMountingStyle/recessed) style**. On vertical surfaces — for example, on a wall — the widget can appear recessed, with content set back into the surface, creating a depth effect that gives the illusion of a cutout in the surface. Horizontal surfaces don’t use the recessed mounting style.

**Choose the mounting style that fits your content and the experience you want to create.**

**Test your elevated widget designs with each system-provided frame width.**

#### [Treatment styles](https://developer.apple.com/design/human-interface-guidelines/widgets#Treatment-styles)

  * The [`paper`](https://developer.apple.com/documentation/WidgetKit/WidgetTexture/paper) style creates a more grounded, print-like style that feels solid and makes the widget feel like part of its surroundings. When lighting conditions change, widgets in the paper style become darker or lighter in response.

  * The [`glass`](https://developer.apple.com/documentation/WidgetKit/WidgetTexture/glass) style creates a lighter, layered look that adds depth and visual separation between foreground and background elements to emphasize clarity and contrast. The foreground elements always stay bright and legible, and don’t dim or brighten, even as ambient light changes.

**Choose the paper style for a print-like look that feels more like a real object in the room.**

**Choose the glass style for information-rich widgets.**

### [watchOS](https://developer.apple.com/design/human-interface-guidelines/widgets#watchOS)

**Provide a colorful background that conveys meaning.**

**Encourage the system to display or elevate the position of your watchOS widget in the Smart Stack.**

## [Specifications](https://developer.apple.com/design/human-interface-guidelines/widgets#Specifications)

### [iOS dimensions](https://developer.apple.com/design/human-interface-guidelines/widgets#iOS-dimensions)

### [iPadOS dimensions](https://developer.apple.com/design/human-interface-guidelines/widgets#iPadOS-dimensions)

* When Display Zoom is set to More Space.

### [visionOS dimensions](https://developer.apple.com/design/human-interface-guidelines/widgets#visionOS-dimensions)

### [watchOS dimensions](https://developer.apple.com/design/human-interface-guidelines/widgets#watchOS-dimensions)

## [Resources](https://developer.apple.com/design/human-interface-guidelines/widgets#Resources)

#### [Related](https://developer.apple.com/design/human-interface-guidelines/widgets#Related)

#### [Developer documentation](https://developer.apple.com/design/human-interface-guidelines/widgets#Developer-documentation)

#### [Videos](https://developer.apple.com/design/human-interface-guidelines/widgets#Videos)

## [Change log](https://developer.apple.com/design/human-interface-guidelines/widgets#Change-log)

---

<!-- hig-doctor:canonical-footer -->
For the complete guidance, including worked examples and illustrations, see the canonical page: https://developer.apple.com/design/human-interface-guidelines/widgets

