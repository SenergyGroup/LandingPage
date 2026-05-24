# Guide PDF drop-zone

Each subfolder is a product slug (matches `products/{slug}/` in the main repo).

**To add or update a guide PDF for a widget:**

1. Find the folder that matches the product slug (e.g. `sku-legacy-01-windows95/`).
2. Drop exactly one `.pdf` into that folder.
3. Canonical filename is `{slug}-landing.pdf` (e.g. `sku-legacy-01-windows95-landing.pdf`), but the server uses whatever single PDF is in the folder — rename is optional.

The server also accepts `.zip` in the same slot (kept for legacy compatibility). Keep only one downloadable file per folder.

Missing PDF? The landing-page card still renders; clicking "Download" returns a "contact support" error. Empty is fine for staged-but-not-yet-published widgets.

`_archive/` holds the pre-migration flat files (kept for rollback; safe to delete once you're confident).
