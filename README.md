# Iain McMullan — Portfolio

Personal portfolio for Iain McMullan: brand strategy & marketing leadership, AI-accelerated.

**Live:** https://iainmcm-blip.github.io/iain-mcmullan-portfolio/

## Structure
- `index.html` — main portfolio
- `case-studies/` — six case-study pages
- `assets/` — compiled CSS (`site.css`), shared JS (`site.js`), local images
- `build/` — Tailwind standalone config + helper scripts (not needed at runtime)
- `cv/` — drop `iain-mcmullan-cv.pdf` here, then point the `data-todo="cv"` links at it
- `src/` — raw Stitch exports kept for reference (not served)

## Editing
Pages are plain HTML using Tailwind utility classes. After changing markup, recompile CSS:

```
./build/tailwindcss -c build/tailwind.config.js -i build/input.css -o assets/site.css --minify
```

(binary: Tailwind v3.4.17 standalone, gitignored — re-download from
https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17 if missing)

## Notes
- The Malaysia Airlines case study was rebuilt from a full-page screenshot after the
  original Stitch HTML export 404'd. Hero + Strategy sections are transcribed verbatim;
  the Execution and Impact sections are reconstructions (no invented metrics) — review
  before sharing widely.
- All "Download CV" links carry `data-todo="cv"` and currently point at LinkedIn.
  When the PDF exists, swap hrefs to `cv/iain-mcmullan-cv.pdf` (`../cv/...` from case-studies/).

## Round-two ideas (deferred)
Custom domain · "How I work" page · case-study PDFs · analytics · per-page OG images · printable one-page CV
