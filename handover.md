# Session handover — 3 July 2026

Read this first, then check `~/.claude/projects/-Users-iain-Desktop-Motion-Sensory-Imagery/memory/iain-portfolio-site.md` (kept current) for deeper history — search it for "THE COVER" and "Round 3" for everything below in full detail. Repo: `~/Desktop/Claude/Iain Portfolio Site/portfolio/`. Live production: [www.iainmcmullan.com](https://www.iainmcmullan.com) (untouched by this session). Staging: `portfolio-git-home-award-iain-mc-mullan-s-projects.vercel.app`.

## Headline state

Home, Skills, Experience, and Portfolio have been **completely redesigned and are on staging only**, branch `home-award`. This is a full identity change from the site's previous look: warm-ink dark ground replacing cream/black/yellow, a licensed serif (Zodiak) replacing Archivo as the display face. **Not merged to `main`. Production is untouched.** `main` is a fast-forward ancestor of `home-award`, so merging is a clean `git merge` whenever Iain gives the go-ahead — no conflicts to resolve.

Five pages are **not** part of this redesign and still run the old `theme-bold` system: `perspectives.html`, `lets-talk.html`, `recommendations.html`, `privacy.html`, `404.html`. Nobody has asked for those yet — don't assume it's wanted, ask first. (portfolio.html joined the redesign on 3 July 2026: rethemed as "The catalogue" — featured plate pair, metric-led index rows with a cursor-trailing image peek, recruiter-facing end-cap CTA. Its generate.mjs step was removed the same way skills.html's was — see below — so **portfolio.html is also hand-authored now, not Sanity-driven**.)

## The design journey this session (so you don't re-litigate)

Iain asked for a homepage redesign that "looks like an award-winning agency built it, cost no less than USD 35,000." Built as a Fable 5 model test, direction landed on a dark editorial monograph: warm-ink ground, cream serif type, paper spreads mid-scroll, case studies as sticky-stacked "Plates."

Two corrections from Iain shaped the final system, both worth knowing before touching this code:

1. **Type.** First pass used EB Garamond with gold-italic emphasis words in the hero. Iain flagged this as reading like an AI-default build. Swapped to **Zodiak** (a licensed foundry face via Fontshare, not a source AI tooling reaches for) and removed the italic-emphasis pattern from the hero entirely — one colour, roman, letting the writing carry the emphasis instead of colour-coding it.
2. **Scroll feel.** Lenis smooth-scroll was added for the "plates hold and settle" effect, then removed the same day — Iain called it "slow and sticky." Scroll is native everywhere now. The plate-hold effect itself is CSS `position:sticky`, unaffected by removing Lenis.

A third lesson came from a two-pass logo fix, worth internalising for any future "blend this into the background" request: **matching a colour exactly to its surroundings makes it invisible, not "blended."** Iain asked for the Emirates/EFTA logo box to be kept (not extracted) and recoloured neutral. First attempt matched the box fill to the exact page cream — which made it read as no box at all, the same visual result as the extraction he'd explicitly said not to do, just reached by a different route. He caught it immediately from a screenshot. Fixed by making the box solid white with a hairline outline — visible as a distinct chip, not blended away. If a future request says "blend into the page," confirm whether that means *invisible* or *neutral-but-present* before matching a fill exactly.

## The live design system (theme-award)

- **Type:** Zodiak (display, 400/700 + true italics, via Fontshare `<link>`) + IBM Plex Sans (body) + Archivo (small utility/label text, `--ff-util`). CSP in `vercel.json` extended for `api.fontshare.com`/`cdn.fontshare.com`.
- **Palette:** warm near-black ink ground `#14110B`, cream text `#EFE9DA`, gold `#F2B01E` (brightens to `#E9B949` for text-on-dark legibility). Paper spreads re-scope the same token names to cream `#F6F2E8`/near-black ink per section — scoped by element ID (`#position`, `#profile`, `#brands`, `#credentials`, `#off-the-clock`, `.rec-section`), not by a separate stylesheet, so components don't need per-page overrides to look right on either ground.
- **Cards:** squared corners (2px, not the old 14–16px rounded), no default shadow, border-colour shifts gold on hover/open rather than shadow growing. Consistent across the home page Plates, Skills clusters, Experience role cards and award cards.
- **Signature moment:** the six case studies render as sticky-stacked "Plates" (`position:sticky` core, `home-award.js` adds a GSAP opacity-settle as the next plate arrives — polish only, the stacking works without JS).
- **Logos:** every marquee/badge logo needs a light, visible chip behind it, regardless of the logo file's own native background — several source files (Emirates, EFTA, AHC, AIA, Malaysia Airlines, Motion, M&C Saatchi) are opaque with their own colour, and would clash or vanish against a dark card if placed directly on it. `.exp-node` and `.cred-logo` are pinned to a fixed white background regardless of page theme for this reason.
- **Files:** `assets/home-award.css` (scoped `body.theme-award`, ~800 lines, one block per section), `assets/home-award.js` (plate-settle scroll effect only, no smooth-scroll).

## How to work (branch + verify + push)

- **This machine's preview sandbox can't read `~/Desktop` directly** (macOS TCC sandboxing) — the `Claude_Preview` tool needs the site synced to the scratchpad first: `rsync -a --delete --exclude '.git' "portfolio/" "$SCRATCH/portfolio/"` before starting the server. Launch config already points there (`.claude/launch.json`, name `portfolio`, port 8951).
- **Screenshot tool is unreliable after JS-only scroll/DOM changes** — it repeatedly served stale/frozen frames in this session. Reliable fallback: read state via `getComputedStyle`/`getBoundingClientRect` through `javascript_tool` instead of trusting a screenshot; use the `claude-in-chrome` MCP (real mouse-wheel scroll, not `scrollTop =`) for anything that needs an actual rendered check.
- **Deployment protection is ON** — the `*.vercel.app` staging URL needs a logged-in Vercel session (SSO wall); plain `curl` gets a login redirect, not the page. Verify deploys through the Vercel MCP (`list_deployments` for build state, `get_deployment_build_logs` if `state:ERROR`) and through an authenticated browser tab, not `curl`.
- **Always check deployment state after pushing** — two pushes this session hit `state:ERROR` (see next section) while the branch alias kept quietly serving the previous successful build. A push landing in GitHub does not mean it shipped.
- Vercel project: `portfolio`, `projectId: prj_J7RwMyqDYgMJdakIrwvrZxPH7qBZ`, team `team_hMkqLCMRNKhIOw4aLxRkAEdW`. This is a **different** Vercel project from the older `iain-mcmullan-portfolio` project referenced in older history — don't confuse the two.
- Commit co-author line: `Co-Authored-By: Claude [model] <noreply@anthropic.com>`.

## IMPORTANT: the skills.html build breaker (already fixed, but know why)

`scripts/generate.mjs` had an undocumented step that regenerates skills.html's header/menu/spotlight/footer from a Sanity `skillsPage` singleton on every build, via `<!--SKGEN:*-->` HTML-comment anchors. The Skills page rebuild (six clusters) deleted the anchors along with the markup they bracketed, which broke the build twice ("Anchor not found for skills menu") before being caught. Fixed by deleting that generator step entirely rather than restoring the anchors — a working version would have silently overwritten the new hand-authored page on the next unrelated commit or Sanity webhook. **skills.html is hand-authored from now on, not editable via Sanity Studio.** If Sanity-driven editing is ever wanted back for that page, the full old generator code is in git history before commit `c494c88`.

## IMPORTANT: concurrent-session article WIP

`articles/tool.html` and `assets/img/perspectives/tool.jpg` belong to another Claude session's in-progress work (a new Perspectives article). Left untracked deliberately — always exclude them from `git add`, and never use `git add -A` in this repo (it swept them into a commit once already this session before being caught and reverted).

## QUEUED / NEXT STEPS

1. **Merge decision.** `home-award` is staged and fast-forward-safe against `main`. Merging is Iain's call, not a default next action.
2. **Accordion behaviour on Experience** (flagged, not actioned): currently single-open, meaning comparing two roles means closing one to open the other. Worth considering expanded-by-default on desktop with a collapse affordance, kept as an accordion on mobile.
3. **Scroll-hold JS on Experience** (flagged, not actioned): the open/close handler re-scrolls every animation frame to hold the clicked header in place during the height transition. Works, but a `scroll-margin-top` + one `scrollIntoView` call would do the same job in far less code.
4. **Five inner pages still on the old theme** (`perspectives.html`, `lets-talk.html`, `recommendations.html`, `privacy.html`, `404.html`) — not requested yet.

## Decisions that stay made (do NOT re-litigate)

- **Zodiak, not EB Garamond** — a licensed foundry face was a deliberate choice against AI-build pattern-matching. Don't swap back to a Google Fonts default without asking.
- **No gold-italic emphasis words in headlines** — reads as an AI tell. Italic is reserved for the POV epigraph and plate numerals specifically.
- **Native scroll, no smooth-scroll library** — Lenis was tried and explicitly rejected.
- **Logo chips must be visibly present, never colour-matched to invisibility** — see the two-pass lesson above.
- **skills.html is hand-authored, not Sanity-driven** — deliberate, not an oversight.
