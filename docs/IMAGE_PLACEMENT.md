# Image placement guide

## Source status

The provided iCloud Shared Album could not be accessed from the build environment (the request was rejected by the network tunnel). No stock, generated, template, or legacy Barber images have been substituted. The hatched blocks in v0.1 are intentional placement slots and include draft accessible descriptions.

## Delivery

Export Theodore's approved originals as high-quality sRGB JPEG or WebP files. Retain full-resolution masters outside this repository. Place derivatives in `public/images/work/`; use lowercase descriptive names, not camera-generated filenames. Do not commit location metadata or other EXIF data.

For each placement, provide 640, 960, 1440, and (for the hero) 2200 pixel-wide variants. Target roughly 75–82 quality, check each export visually, and keep the hero under 400 KB where practical. Once files exist, replace each `.image-slot` with a `<picture>` using AVIF/WebP plus JPEG fallback, `srcset`, explicit `width` and `height`, and `sizes`. The hero should use `fetchpriority="high"`; gallery images should use `loading="lazy"` and `decoding="async"`.

| Slot | Preferred crop | Minimum master | Content direction | Draft alt-text structure |
| --- | --- | --- | --- | --- |
| Hero / featured frame | 16:9 or wider; safe subject area in center-left | 2400 × 1350 | Cinematic vehicle/environment image with room for typography | `[Vehicle/model if relevant] in [setting], photographed by Theodore Castro` |
| Work 01 / Form at Speed | 4:5 portrait | 1600 × 2000 | Dynamic automotive scene or decisive exterior detail | Describe vehicle, action, and setting; omit “image of” |
| Work 02 / Built Character | 4:3 landscape | 2000 × 1500 | Vehicle portrait with a strong silhouette | Describe visible subject and notable light/environment |
| Work 03 / Places with Pulse | 4:3 landscape | 2000 × 1500 | Venue, event, or branded commercial environment | Describe venue/activity and the meaningful visual detail |
| Open Graph share image | 1.91:1 | 1200 × 630 | Approved hero crop with legible DST identity | `Developer Studio Tampa — automotive and commercial image making` |

Alt text should describe what is visible and useful in context, not marketing claims. If an image is purely decorative, use an empty `alt` value. Confirm vehicle names, venue names, and usage rights before publishing.
