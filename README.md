# Studio Cucurbits

This folder contains the static Studio Cucurbits site, built with Astro.

## Files

- `src/` - Astro source files and TypeScript declarations.
- `public/` - static assets and the custom-domain CNAME file.
- `astro.config.mjs` - static build and site configuration.
- `package.json` - Astro scripts and dependencies.

## Local setup

```bash
npm ci
cp .env.example .env   # optional; every variable is optional
npx playwright install chromium   # only needed for npm run test:browser
npm run dev
```

Node 22 is the supported version — it is pinned in `.nvmrc`, read by CI through
`node-version-file`, and declared as the floor in `package.json` `engines`.
Newer Node releases currently pass the full gate, but 22 is what the deployed
build uses.

`.env` is git-ignored. Never put Paddle API keys or webhook secrets in website configuration. Client-side tokens are public by design.

Astro 7 starts `astro dev` as a background process when it detects an AI
coding agent (Claude Code, Cursor and similar). Use `astro dev status`,
`astro dev logs` and `astro dev stop` to manage it, or set
`ASTRO_DEV_BACKGROUND=0` to force the server to stay in the foreground.
A normal terminal and GitHub Actions are unaffected.

## Build-time configuration

Every variable in `.env.example` is optional. An unset value is read as "not
configured", and the site renders its safe fallback rather than a broken link
or an unsupported claim. `src/env.d.ts` documents which file reads each one.

In CI the values come from GitHub repository variables and secrets, wired in
`.github/workflows/deploy.yml`:

| Variable | Where it is set | Effect when unset |
| --- | --- | --- |
| `ANALYTICS_PROVIDER`, `ANALYTICS_ID` | repository variables | Plausible tracking stays off |
| `SUSPENDED_DEMO_URL`, `SUSPENDED_MANUAL_URL` | repository variables | Demo and manual links are omitted |
| `PADDLE_CLIENT_TOKEN` | repository variable; local sandbox environment | Product CTA stays on the newsletter route |
| `PADDLE_CHECKOUT_ENVIRONMENT` | local environment; CI pins `disabled` | Purchasing stays disabled |

Set them with:

```bash
gh variable set ANALYTICS_ID --body "www.studiocucurbits.com"
gh variable set PADDLE_CLIENT_TOKEN
```

### Sandbox storefront preview

Set `PADDLE_CHECKOUT_ENVIRONMENT=sandbox` and `PADDLE_CLIENT_TOKEN` to an existing
public sandbox client-side token (`test_…`) in the local `.env`, then run
`npm run build:sandbox` followed by `npm run preview:sandbox`.
Both languages use the same USD-base price;
Paddle displays the customer's final currency and applicable tax at checkout.
This preview writes to `dist-sandbox/`, never the
production deployment directory. On a purchase click, the site loads the
product-specific `/purchase/suspended/` page (also `/ja/purchase/suspended/`),
which loads the official Paddle.js CDN script and opens the inline form. It passes one
Suspended item, using the fixed environment-specific price in `src/lib/checkout.ts`;
both Paddle prices also enforce minimum and maximum quantity of one.
After a successful checkout, the buyer opens the same-language `/setup/` page
in the same tab to generate an activation code once fulfilment is ready. A
setup email provides a backup link. The download route still needs approved
installers before end-to-end acceptance or live sales. The site keeps only the
transaction ID and random setup secret in tab-local `sessionStorage`, without
customer or card details. Failed or stalled opening clears the quote and
presents a retry button.
When an agent shell triggers Astro's automatic background mode, set
`ASTRO_PREVIEW_BACKGROUND=0` before starting the preview: Astro 7.2.4's background
launcher drops the custom output directory.

Product media comes from the product catalogue. Set `PRODUCT_CATALOGUE_DIR` to its
checkout when running `npm run dev`, `npm run build` or `npm run build:sandbox`;
the build copies `products/<id>/media/*` to `public/catalogue-media/<id>/`.
The catalogue export decides whether box artwork, the interface image, videos
and audio samples appear on a product page.

Production builds reject sandbox tokens. Live sales additionally require an
approved catalogue release, approved public pricing, a live client-side token,
and changing CI's explicit `disabled` setting to `live`. Keep those gates closed
until production fulfilment/recovery acceptance, installers and final policies
are ready. This integration does not depend on hosted-checkout eligibility.
The inline page uses the website logo, typography and palette around Paddle's
native payment controls. The actual sandbox form has been visually verified;
payment and redirect acceptance are separate. The purchase page shows only
download/activation guidance when sales are disabled. It is not payment
confirmation or a recovery portal; a browser redirect never proves payment.

## Source basis

The draft uses the current Studio Cucurbits. page as the base, then expands it for a standalone studio site with clearer service descriptions, an explicit AI position, process, contexts, collaborator information, and inquiry flow.

Public links referenced in the page:

- https://www.sachiekobayashi.com/cucurbits/
- https://www.sachiekobayashi.com/
- https://frederik.bous.cc/
- https://www.impuls.cc/archivvor22/en/competition/composers-for-2023.html
- https://ressources.ircam.fr/en/media/x56d2a9_day-0-trans-instrumentalism-sachie-kobayas
- https://www.lefresnoy.net/en/exposition/2207/oeuvre/2256/

## Deployment

Pushes to `main` run `check`, tests, and a production build before deploying `dist/` to GitHub Pages. The custom domain is retained at `public/CNAME`; do not remove it from the deployment artifact. Run the same gate locally with `npm run verify`.

For the complete release gate, production-preview route checks, known content constraints, and the current verification record, see [docs/VERIFICATION.md](docs/VERIFICATION.md). Update catalogue content through [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md), rather than changing generated pages directly.

Download pages are generated for existing product and collection records only when the approved R2 current pointer or its history contains matching customer installers. Names, artwork and descriptions come from those records; no separate download-page registration is needed. An unpublished pointer (404) produces an empty overview; invalid metadata or other fetch failures stop the build rather than remove deployed pages.

On `main`, the Pages workflow checks the release pointer every 15 minutes (subject to GitHub scheduling delays) and rebuilds when it differs from `/download-state.json`. A manual workflow run also rebuilds immediately. This needs no R2 changes or cross-repository token. Build tests use `DOWNLOAD_RELEASE_SNAPSHOT` for offline fixtures; leave it unset for production builds. Development-only staging previews do not create production download pages.

## Asset migration

Legacy files in `assets/` now live in `public/images/brand/` and `public/images/studio/` with their original filenames. Product UI images belong in `public/images/products/<slug>/`.
