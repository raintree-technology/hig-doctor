# HIG Doctor brand system

The HIG Doctor identity uses the **Alignment Seam** mark: two solid modules
separated by a precise registration gap. The same geometry is used from the
16 px favicon through app icons, documentation, video, and social artwork.

## Palette

| Role | Value |
|---|---|
| Cobalt | `#3157C8` |
| Dark-UI cobalt tint | `#6686F0` |
| Near-black | `#111318` |
| Warm white | `#F5F2EA` |

Use cobalt on light neutral backgrounds. Use warm white on near-black or
cobalt backgrounds. The mark must also work in solid black.

## Assets

| Asset | Use |
|---|---|
| [`hig-doctor-mark.svg`](hig-doctor-mark.svg) | Primary cobalt symbol |
| [`hig-doctor-mark-black.svg`](hig-doctor-mark-black.svg) | Monochrome light-background use |
| [`hig-doctor-mark-white.svg`](hig-doctor-mark-white.svg) | Reversed dark-background use |
| [`hig-doctor-app-icon.svg`](hig-doctor-app-icon.svg) | Square app/profile icon source |
| [`.github/social-preview.png`](../.github/social-preview.png) | 1200 × 630 GitHub/social preview |

## Usage

- Keep clear space equal to at least one quarter of the mark's width.
- Use the complete mark at 16 px and larger; don't remove either module.
- Preserve the path geometry and the negative-space seam.
- Don't add gradients, shadows, outlines, or severity colors to the mark.
- Keep audit-state colors separate from the cobalt product identity.

The production React implementation is in
[`website/components/BrandMark.tsx`](../website/components/BrandMark.tsx).
