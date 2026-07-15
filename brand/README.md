# HIG Doctor brand system

The HIG Doctor identity uses the **Alignment Seam** mark: two solid modules
separated by a precise registration gap. The same geometry is used from the
16 px favicon through app icons, documentation, video, and social artwork.

## Palette

| Role | Value |
|---|---|
| Near-black | `#111318` |
| Warm white | `#F5F2EA` |

The logo is always monochrome. Use near-black on light backgrounds and warm
white on dark backgrounds. Never use interface accent or status colors in the
mark.

## Assets

| Asset | Use |
|---|---|
| [`hig-doctor-mark.svg`](hig-doctor-mark.svg) | Adaptive light/dark symbol |
| [`hig-doctor-mark-black.svg`](hig-doctor-mark-black.svg) | Monochrome light-background use |
| [`hig-doctor-mark-white.svg`](hig-doctor-mark-white.svg) | Reversed dark-background use |
| [`hig-doctor-app-icon.svg`](hig-doctor-app-icon.svg) | Square app/profile icon source |
| [`.github/social-preview.png`](../.github/social-preview.png) | 1200 × 630 GitHub/social preview |

## Usage

- Keep clear space equal to at least one quarter of the mark's width.
- Use the complete mark at 16 px and larger; don't remove either module.
- Preserve the path geometry and the negative-space seam.
- Don't add gradients, shadows, outlines, or severity colors to the mark.
- Keep interface accent and audit-state colors separate from the mark.

The production React implementation is in
[`website/components/BrandMark.tsx`](../website/components/BrandMark.tsx).
