# Iain McMullan — Portfolio

Personal portfolio for Iain McMullan: brand strategy & marketing leadership, AI-accelerated.

**Live:** https://iainmcm-blip.github.io/iain-mcmullan-portfolio/

## Structure
- `index.html` — main portfolio
- `case-studies/` — six case-study pages
- `assets/` — compiled CSS (`site.css`), shared JS (`site.js`), local images
- `build/` — Tailwind standalone config + helper scripts (not needed at runtime)
- `src/` — raw Stitch exports kept for reference (not served)

> No downloadable CV by design — the key résumé information (experience, credentials,
> skills, contact) lives on the page itself.

## Editing
Pages are plain HTML using Tailwind utility classes. After changing markup, recompile CSS:

```
./build/tailwindcss -c build/tailwind.config.js -i build/input.css -o assets/site.css --minify
```

(binary: Tailwind v3.4.17 standalone, gitignored — re-download from
https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17 if missing)

## Notes
- Case study metrics are Iain's real figures, not the AI-generated placeholders the
  original Stitch import shipped with. Those were replaced or removed on 2026-06-14.
  See `CASE-STUDY-METRICS.md` for the per-page source list.
- The Malaysia Airlines case study was rebuilt from a full-page screenshot after the
  original Stitch HTML export 404'd. Hero and Strategy sections are transcribed
  verbatim; the Execution and Impact sections are reconstructions with no invented
  metrics.
## Round-two ideas (deferred)
Custom domain · "How I work" page · analytics · per-page OG images
