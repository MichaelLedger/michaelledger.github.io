# iPhone & iPad Zoom Mode: paths and option differences

Updated: 2026-10-28. English Settings labels. Availability depends on device model and OS/runtime.

## Current entry: iOS / iPadOS 27

Open **Settings → Appearance → Display Zoom**.

*Note: small size iPad (e.g. 11-inch) do not has the `Larger Text` option!*

| Device / observed configuration | Options | To enlarge the interface | To fit more content |
| --- | --- | --- | --- |
| Supported iPhone | Default; Larger Text | Select Larger Text | Return to Default |
| Large iPad with all three options\*, as shown in the supplied screenshot | Larger Text; Default; More Space | Select Larger Text | Select More Space |
| Small size(11-inch) iPads with the two-option layout, no Larger Text option | Default; More Space | No Larger Text option in this layout | Select More Space |

Select the desired option, tap the confirmation control (the blue checkmark in the supplied iPad screenshot), and accept any confirmation prompt. To disable enlarged Display Zoom, choose Default. To leave More Space, also choose Default.

Apple documents the OS 27 Appearance entry for [iPhone](https://support.apple.com/guide/iphone/iphd6804774e/27/ios/27) and [iPad](https://support.apple.com/guide/ipad/ipadbfb08e0a/27/ipados/27). Its iPad guide describes More Space on supported models; it does not provide a complete table of every model’s available choices.

### iPad-specific difference

- **Larger Text:** enlarges the interface and reduces the amount of content that fits onscreen.
- **Default:** the normal display layout.
- **More Space:** makes text and controls smaller so that more content fits onscreen.

The user’s testing found Larger Text only on large iPads, with Default and More Space on the other tested supported iPads. The supplied screenshot directly confirms the three-option layout and the Appearance entry. It does not identify the exact iPad model or OS build. Treat this size distinction as an observation from the tested configurations, not a verified compatibility rule for every iPad generation. Some models may not expose Display Zoom at all.

## Entry paths by OS version

These are the documented user-facing Settings paths. Simulator-specific differences are covered below.

| Platform / version | Display Zoom entry | Selection / confirmation | Evidence |
| --- | --- | --- | --- |
| iPhone, iOS 15 | Settings → Display & Brightness → View, under Display Zoom | Zoomed → Set; Standard restores normal layout | [Apple iOS 15 guide](https://support.apple.com/guide/iphone/iphd6804774e/15.0/ios/15.0) |
| iPhone, iOS 16 | Settings → Display & Brightness → Display Zoom | Larger Text → Done → Use Zoomed | [Apple iOS 16 guide](https://support.apple.com/guide/iphone/iphd6804774e/16.0/ios/16.0) |
| iPhone, iOS 18 | Settings → Display & Brightness → Display Zoom | Larger Text → Done → Use Zoomed | [Apple iOS 18 guide](https://support.apple.com/guide/iphone/iphd6804774e/18.0/ios/18.0) |
| iPhone, iOS 26 | Settings → Display & Brightness → Display Zoom | Larger Text → Done → Use Zoomed | [Apple iOS 26 guide](https://support.apple.com/guide/iphone/iphd6804774e/26/ios/26) |
| iPhone, iOS 27 | Settings → Appearance → Display Zoom | Larger Text → Done → Use Zoomed | [Apple iOS 27 guide](https://support.apple.com/guide/iphone/iphd6804774e/27/ios/27) |
| iPad, iPadOS 15 | Settings → Display & Brightness → View, under Display Zoom | Zoomed → Set; guide specifically names iPad Pro 12.9-inch | [Apple iPadOS 15 guide](https://support.apple.com/guide/ipad/ipadbfb08e0a/15.0/ipados/15.0) |
| iPad, iPadOS 16 | Settings → Display & Brightness → View, under Display Zoom, in Apple’s archived enlargement instructions | Zoomed → Set; archived page names iPad Pro 12.9-inch and is not a complete account of More Space support | [Apple iPadOS 16 guide](https://support.apple.com/guide/ipad/ipadbfb08e0a/16.0/ipados/16.0) |
| iPad, iPadOS 18 | Settings → Display & Brightness → Display Zoom | More Space → Done → Use More Space, on supported models | [Apple iPadOS 18 guide](https://support.apple.com/guide/ipad/ipadbfb08e0a/18.0/ipados/18.0) |
| iPad, iPadOS 26 | Settings → Display & Brightness → Display Zoom | More Space → Done → Use More Space, on supported models | [Apple iPadOS 26 guide](https://support.apple.com/guide/ipad/ipadbfb08e0a/26/ipados/26) |
| iPad, iPadOS 27 | Settings → Appearance → Display Zoom | Model-dependent options; supplied screenshot shows Larger Text / Default / More Space | [Apple iPadOS 27 guide](https://support.apple.com/guide/ipad/ipadbfb08e0a/27/ipados/27) and supplied screenshot |

The main recent path change is **Display & Brightness → Appearance in OS 27**. Older guides use **View** and **Zoomed**; newer interfaces use **Display Zoom** and **Larger Text** for enlargement. The table lists versions checked directly, rather than asserting every intermediate release has identical labels.

## Xcode Simulator notes

For the iPadOS 27 configuration shown by the user, use **the simulated iPad’s Settings → Appearance → Display Zoom**. The absence of Larger Text can reflect the selected iPad’s available modes; a two-option Default / More Space screen is not missing an enlargement toggle that must be enabled under Developer.

Older iPhone simulator reports describe **Settings → Developer → View**, and later reports describe **Settings → Developer → Display Zoom → View**. Those paths are historical, device/runtime-specific observations, not a universal iPadOS 27 instruction. See [Apple Developer Forums: iPhone simulator](https://developer.apple.com/forums/thread/672792) and [later simulator report](https://developer.apple.com/forums/thread/807280).

Correction to the earlier chat advice: the supplied iPad screenshot demonstrates that Display Zoom is available in this configuration. The missing Developer option alone is not evidence that a physical device is required.

## Do not confuse these controls

| Control | Purpose |
| --- | --- |
| Display Zoom | Changes the overall display layout and apparent size of the interface |
| Text Size / Dynamic Type | Adjusts text in apps that support the setting; does not reproduce every effect of Display Zoom |
| Settings → Accessibility → Zoom | Provides screen magnification as an accessibility feature |
| Simulator / Device Hub canvas zoom | Changes how large the simulated device preview appears on the Mac |

For layout testing, record the iPad model, OS build, Xcode version, and selected mode. Test each Display Zoom option actually offered by that configuration, and test Dynamic Type separately.
