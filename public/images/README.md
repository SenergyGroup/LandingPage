# Widget thumbnail drop-zone

Each subfolder is a product slug (matches `products/{slug}/` in the main repo).

**To add or update a widget thumbnail:**

1. Find the folder that matches the product slug (e.g. `sku-legacy-01-windows95/`).
2. Drop exactly one `.png` (or `.jpg` / `.webp`) into that folder.
3. Canonical filename is `transparent_widget.png` (matches the capture pipeline), but the server uses whatever single image is in the folder — rename is optional.

SVG files at the root of this folder (`aurora-glass.svg`, `mono-tech.svg`, `signal-wave.svg`) are landing-page UI assets, not widget thumbnails. Leave them alone.

`_archive/` holds the pre-migration flat PNGs (kept for rollback; safe to delete once you're confident).
