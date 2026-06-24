# Publishing — self-service from Sanity

This site's Perspectives content (the articles, the homepage strip, the tags) lives
in Sanity and is turned into static HTML by `scripts/generate.mjs`. Once the setup
below is done, you publish entirely from the Sanity studio, with no command line and
no Claude Code in the loop.

## The flow you end up with

1. Edit an article in the studio (https://iain-mcmullan-portfolio.sanity.studio/).
2. Open the **Deploy** tab, click **Deploy to staging**. Wait one to two minutes.
3. Open the staging URL and check your edit.
4. Happy? Click the article's **Publish** button. The live site rebuilds on its own,
   one to two minutes later.

Edit, preview, publish. That's it.

## How it works (plain version)

- **Staging** is a Vercel project that builds reading your *drafts*, so it shows
  work in progress. It rebuilds when you click the Deploy button in the studio.
- **Live** is a Vercel project that builds reading only *published* content. It
  rebuilds when Sanity fires a webhook on Publish.
- Both run the same `npm run generate`; only the `SANITY_MODE` env var differs
  (`staging` vs `live`).

---

## One-time setup

You do these once, in your own dashboards. Each is a few clicks. If any step
errors, copy the message back to Claude Code and it will help.

### 1. Create a Sanity read token (needed so staging can see drafts)

- Go to https://sanity.io/manage → project **Iain McMullan — Portfolio** (`yespk9j6`).
- **API → Tokens → Add API token**. Name it `Static site read`, permission **Viewer**.
- Copy the token somewhere safe for the next steps. (You will not see it again.)

### 2. Create the STAGING Vercel project

- In Vercel, **Add New → Project**, import the GitHub repo
  `iainmcm-blip/iain-mcmullan-portfolio`.
- **Framework Preset:** Other.
- **Build Command:** `npm run generate`
- **Output Directory:** `.` (a single dot — the site files sit at the repo root).
- **Environment Variables:**
  - `SANITY_MODE` = `staging`
  - `SANITY_READ_TOKEN` = *(the token from step 1)*
- Deploy. The `*.vercel.app` address it gives you is your **staging URL**.
  > If the page comes up blank or 404s, the Output Directory setting is the usual
  > cause. Tell Claude Code and it will sort it with you.

### 3. Create the staging deploy hook

- In the staging project: **Settings → Git → Deploy Hooks**.
- Create one named `studio-staging` on branch `main`. **Copy the hook URL.**

### 4. Wire the Deploy button into the studio

- In `portfolio-cms/`, create a file named `.env` containing:
  ```
  SANITY_STUDIO_STAGING_DEPLOY_HOOK=<the hook URL from step 3>
  ```
- Redeploy the studio: `npx sanity deploy` (run inside `portfolio-cms/`).
- The **Deploy** tab's button now triggers a staging build.

### 5. Point the LIVE project at the generator (the cutover)

Do this only once staging is working, so the live site is never in a half-built state.

- Open your existing production Vercel project (the one serving
  www.iainmcmullan.com) → **Settings → Build & Development Settings**.
- **Build Command:** `npm run generate`
- **Output Directory:** `.`
- **Environment Variables:** add `SANITY_MODE` = `live`.
- Redeploy once to confirm it builds and serves correctly.
- Then **Settings → Git → Deploy Hooks**: create one named `publish-live` on branch
  `main`. **Copy the hook URL.**

### 6. Make Publish trigger the live build

- https://sanity.io/manage → project → **API → Webhooks → Create webhook**.
- **Name:** `Deploy live on publish`.
- **URL:** the `publish-live` hook URL from step 5.
- **Dataset:** production. **Trigger on:** Create, Update, Delete.
- **Filter:** `_type == "article" || _type == "category"`
- **HTTP method:** POST. Save.

Sanity webhooks fire on *published* documents by default, so this runs when you hit
Publish, not while you are still drafting.

### 7. (Optional, later) Put iainmcm.com on Vercel too

Today www.iainmcm.com is served by GitHub Pages from `main`, which does not run the
generator, so it would fall out of date. To fix that, add `iainmcm.com` (and `www.`)
as domains on the production Vercel project (**Settings → Domains**), update the DNS
records as Vercel instructs, and disable GitHub Pages (repo **Settings → Pages**).
Then one live build feeds both domains. Until you do this, treat
**www.iainmcmullan.com** as the live site.

---

## Day-to-day, after setup

- **Preview a change:** edit in the studio → **Deploy** tab → **Deploy to staging** →
  check the staging URL.
- **Go live:** click **Publish** on the article. Live rebuilds itself.
- **New article:** create it in the studio (set its `Homepage position` if it should
  sit in the strip), preview on staging, then Publish.

## If something looks wrong

- **Build failed:** Vercel → the project → **Deployments** → open the latest →
  **Logs**. The usual cause is a missing env var (token or mode).
- **Staging shows old content:** the build may still be running, or you edited but did
  not click **Deploy to staging** afterwards.
- **Button says "No deploy hook configured":** the `.env` value in step 4 was not set
  before `npx sanity deploy`. Set it and redeploy the studio.

## Running it by hand (fallback)

The generator still runs locally if you ever need it:

```
cd portfolio
npm install
npm run generate                    # live (published) content
# or, to render drafts:
SANITY_MODE=staging SANITY_READ_TOKEN=xxx npm run generate
```
