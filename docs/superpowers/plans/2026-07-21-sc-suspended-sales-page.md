# SC Suspended Sales Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish SC Suspended as the sole product sales page while keeping checkout and demo actions unconnected until their production URLs exist.

**Architecture:** Reuse the status-driven product model and dynamic route. Make only SC Suspended visible with public price metadata and `coming-soon` status so the existing CTA resolves to the newsletter rather than an empty checkout URL.

**Tech Stack:** Astro, TypeScript, Vitest, existing CSS and product helpers.

## Global Constraints

- Publish only SC Suspended; keep SC Vitreous, Traces, Tendril, and every other product route hidden.
- Show the supplied JPY/USD prices; do not invent checkout, demo, release-date, compatibility, or media data.
- Reuse the contrast-adjusted hero image and add no payment dependency.
- Keep the CTA as notification until valid HTTPS checkout URLs are configured.

### Task 1: Publish the SC Suspended product record

**Files:** `src/data/products.ts`, `tests/unit/product-status.test.ts`

- [ ] Add a failing test that finds `suspended`, expects status `coming-soon`, `publicPrice: true`, and `getProductCta(...).href` equal to `/newsletter/`.
- [ ] Run `npm.cmd test -- tests/unit/product-status.test.ts` and confirm it fails because the product is hidden.
- [ ] Change only SC Suspended to `coming-soon`, set public JPY/USD regular and introductory price data, retain null checkout/demo/manual URLs, and add supplied English/Japanese editorial copy and the existing contrast hero image.
- [ ] Re-run `npm.cmd test -- tests/unit/product-status.test.ts` and commit `feat: publish suspended product record`.

### Task 2: Render catalogue and product detail content

**Files:** `src/pages/products/index.astro`, `src/components/ProductHero.astro`, `src/components/ProductDetails.astro`, `src/styles/global.css`, `tests/render/routes.test.ts`, `tests/render/cta.test.ts`

- [ ] Add failing render tests for `/products/suspended/`: title, public price, hero image, and newsletter CTA; assert no empty or checkout link.
- [ ] Run `npm.cmd test -- tests/render/routes.test.ts tests/render/cta.test.ts` and confirm route output is absent.
- [ ] Restore the visible-products catalogue and use the existing product route/components. Add only data-backed concept, control, use-case, and artist-note sections; preserve the monochrome responsive layout.
- [ ] Re-run the route and CTA tests and commit `feat: add suspended sales page`.

### Task 3: Update SEO regression coverage and deploy

**Files:** `tests/render/seo.test.ts`, `tests/render/catalogue.test.ts`

- [ ] Add failing assertions for the SC Suspended canonical URL and sitemap entry.
- [ ] Run `npm.cmd test -- tests/render/seo.test.ts tests/render/catalogue.test.ts` and confirm failures caused by the hidden route.
- [ ] Update obsolete pre-launch assertions to expect the approved SC Suspended page while still excluding the other products and collections.
- [ ] Run `npm.cmd run check; npm.cmd run build; npm.cmd test; git diff --check`.
- [ ] Commit `test: cover suspended sales page`, push `HEAD:main`, and verify the GitHub Pages HTML contains the product canonical URL.
