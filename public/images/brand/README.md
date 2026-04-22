# Brand assets

Drop your master logo image here at **`public/images/brand/logo.png`** (or `.webp`).

The site expects the wide horizontal 6T4 Customs logo (bike icon + "6T4 CUSTOMS" wordmark + "PERFORMANCE CENTER" badge). Black background is fine — the site is black everywhere this logo renders.

Recommended export:
- Width: **1600 px** (retina-ready for the loader + hero)
- Format: **PNG** (lossless, keeps crisp edges on the wordmark) or **WebP** (smaller file)
- Background: Black or transparent — both work

## Where it's used

| Surface | Element | Size |
|---|---|---|
| Loader | Full logo fade-in after video | ~80% viewport width on mobile, ~40% on desktop |
| Navbar | Top-left of every page | ~40 px tall |
| Footer | Top of footer column | ~56 px tall |
| Admin top rail | Top-left of admin chrome | ~36 px tall |

## Fallback

If this file is missing, every surface falls back to the current text wordmark ("6T4/CUSTOMS"). The site never breaks — it just uses text until you add the file.
