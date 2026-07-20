# Release verification

Verified on 2026-07-20 from the `feat/audio-instruments-site` worktree.

## Commands and results

The standard local gate is:

```powershell
npm.cmd ci
npm.cmd run verify
$env:CI = '1'; npm.cmd run test:browser
```

For this verification, Windows kept `node_modules/@rollup/rollup-win32-x64-msvc/rollup.win32-x64-msvc.node` locked in the worktree, so `npm.cmd ci` could not unlink it. A clean, same-lockfile copy at `C:\tmp\studio-cucurbits-release-verification` was used instead. No source changes were made in that copy.

Results in that isolated copy:

- `npm.cmd run verify` passed: `astro check` reported 0 errors, 0 warnings, and 0 hints; Vitest passed 14 files / 45 tests; `astro build` generated 36 static pages.
- `$env:CI = '1'; npm.cmd run test:browser` passed: 11 Playwright browser and accessibility tests.
- The browser test was run with `CI=1` to avoid reusing a stale development server on port 49283. The stale server was stopped before the clean retry.

## Production-preview review

The generated `dist/` was served with:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4322
```

The following paths returned HTTP 200 from that production preview:

- `/`
- `/collections/traces/`
- `/collections/tendril/`
- `/products/suspended/`
- `/products/vitreous/`
- `/sitemap-index.xml`
- `/robots.txt`

Review captures were generated from that preview and deliberately stored outside the site source tree at `C:\tmp\studio-cucurbits-validation-artifacts`:

- `home-desktop.png` (1440 px)
- `home-mobile.png` (390 px)
- `collection-traces.png`
- `collection-tendril.png`
- `product-sc-suspended.png`
- `product-sc-vitreous.png`

## Public state at verification time

- Studio Cucurbits remains the parent studio. Audio Instruments is presented as one studio area, not the site-wide identity.
- SC Suspended is `coming-soon`; SC Vitreous is an `announcement`; Traces and Tendril are `forthcoming` collections.
- Neither currently public product has `publicPrice` enabled or a checkout URL. The resulting product CTA is the internal newsletter notification route, not a purchase flow.
- No product has supplied final image, video, or audio assets. The visible media placeholders state that previews will be published when supplied; no fictional media, compatibility, reviews, or availability claims are emitted.
- Newsletter delivery requires `NEWSLETTER_API_ENDPOINT` or `NEWSLETTER_FORM_ACTION`; without either, the form remains safely unavailable instead of submitting personal data elsewhere.

## Deployment and discovery checks

- `public/CNAME` was included in `dist/` with `www.studiocucurbits.com`.
- `robots.txt` allows crawling and points at `https://www.studiocucurbits.com/sitemap-index.xml`.
- `sitemap-index.xml` uses the canonical custom domain and includes only the public static routes.
- `.github/workflows/deploy.yml` runs `npm ci`, check, unit tests, and static build before uploading `dist/` to GitHub Pages on `main`.

## Lighthouse

No Lighthouse score is recorded. The `lighthouse` command is not installed in this environment, and no performance result was fabricated. Run Lighthouse against the deployed HTTPS custom domain after GitHub Pages is enabled and production media is supplied.

## Before publishing new content

Follow [CONTENT_GUIDE.md](CONTENT_GUIDE.md) when changing visibility, price, checkout URLs, media, compatibility, or translations. In particular, publish checkout URLs and public prices together only after they are approved and verified.
