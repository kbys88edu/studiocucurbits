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

`.env` is git-ignored. Do not commit real endpoints or payment links.

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
| `STRIPE_SUSPENDED_PAYMENT_LINK_JPY`, `..._USD` | repository secrets | Product CTA stays on the newsletter route |

Set them with:

```bash
gh variable set ANALYTICS_ID --body "www.studiocucurbits.com"
gh secret set STRIPE_SUSPENDED_PAYMENT_LINK_JPY
```

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

## Asset migration

Legacy files in `assets/` now live in `public/images/brand/` and `public/images/studio/` with their original filenames. Product UI images belong in `public/images/products/<slug>/`.
