# Studio Cucurbits

This folder contains the static Studio Cucurbits site, built with Astro.

## Files

- `src/` - Astro source files and TypeScript declarations.
- `public/` - static assets and the custom-domain CNAME file.
- `astro.config.mjs` - static build and site configuration.
- `package.json` - Astro scripts and dependencies.

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

## Asset migration

Legacy files in `assets/` now live in `public/images/brand/` and `public/images/studio/` with their original filenames. Product UI images belong in `public/images/products/<slug>/`.
