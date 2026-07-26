# Deployment

The site is a static build (Vite + Vue) hosted on **Cloudflare Pages** as a
**direct-upload** project (no build runs on Cloudflare's side; it serves the files
you upload).

There is **no backend in production** — the app fetches live stats from the MLB
stats API directly in the browser, so a plain static host is all that's needed.
(The Express `server.js` / `/api/rosters` endpoint is for **local editing only**;
see below.)

> **Account-specific details** — which Cloudflare account owns the project, the
> project name, live URL, and the exact dashboard steps — live in
> **`DEPLOY.local.md`** (gitignored, not checked in). Keep that file up to date.

## Current process — manual upload

The build is done locally and the output folder is uploaded by hand.

1. Make sure your changes are in (e.g. roster edits — see
   [Applying roster changes](#applying-roster-changes)).
2. Build the static site:
   ```
   npm run build
   ```
   This runs `vite build` and writes the deployable site to the **`out/`** folder
   (configured in `vite.config.js`).
3. Upload the **contents of `out/`** to the Cloudflare Pages project as a new
   deployment. (Exact dashboard path is in `DEPLOY.local.md`.)

## Applying roster changes

Roster data lives in `src/data/rosters2026.json` and is imported at **build
time**, so any roster change requires a rebuild + redeploy to go live.

- Locally you can edit rosters through the `/admin` route (only available when
  running `npm run dev` — see the README), which writes back to the JSON via the
  Express API and backs up the previous file to `/bak`.
- You can also edit `src/data/rosters2026.json` directly.
- Either way: **rebuild (`npm run build`) and redeploy** for the change to appear
  on the live site.

## Verifying a deploy landed

Each `npm run build` produces a content-hashed JS bundle (e.g.
`assets/index-<hash>.js`). After uploading, view-source on the live site and
confirm it references the **new** hash from your latest build, not the previous
one.

## Planned: Git-connected auto-deploy

The next step is to connect the GitHub repo to Cloudflare Pages so pushes to the
default branch build and deploy automatically, replacing the manual upload above.
When that's set up, document here the build command (`npm run build`) and output
directory (`out`), plus which branch triggers a production deploy.
