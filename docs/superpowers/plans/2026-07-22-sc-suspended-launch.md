# SC Suspended Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing SC Suspended announcement into a complete data-driven Windows VST3 beta launch page while preserving the Studio Cucurbits site and keeping Traces/Tendril unpublished.

**Architecture:** Extend the existing `Product` record with a localized, optional launch-content object. A single reusable Astro launch component renders the ordered product sections from that object, while the existing generic product components remain available for other products. Add a slug-scoped support page and a small homepage announcement driven by the same product record.

**Tech Stack:** Astro 5 static output, TypeScript, existing CSS, Vitest, Playwright, GitHub Pages workflow.

## Global Constraints

- Public product state is `coming-soon` / Windows VST3 Beta.
- Traces and Tendril collection routes remain unpublished and excluded from the sitemap.
- Hero copy is Japanese `浮遊する音。動き続ける身体。` and English `Sound in suspension. A body still in motion.`
- Do not publish prices, release dates, checkout links, demo links, audio files, video controls, installation paths, DAW names, Windows versions, internal paths, logs, hashes, branch names, or tester information.
- Keep `publicPrice: false`; retain existing Stripe environment-variable names for future checkout configuration.
- Do not add dependencies or a CMS.
- Existing studio hero and business-area framing remain intact; Audio Instruments remains one studio area.
- Every new public control is keyboard accessible, has a 44px target, and respects reduced-motion preferences.

### Task 1: Extend product data and define public content

**Files:**
- Modify: `src/data/products.ts`
- Test: `tests/unit/product.test.ts`, `tests/render/routes.test.ts`

**Interfaces:**
- `Product.launch`: optional `LaunchContent` with localized hero, features, controls, uses, comparison, freeze/release, presets, specifications, beta text, acceptance lists, credits, and support topics.
- `ProductMedia.video.status` remains `in-production`/`ready` and optional source URLs remain nullable.

- [ ] Add types for localized launch copy and the optional launch object, preserving null-safe defaults in `product()`.
- [ ] Populate SC Suspended with the approved Japanese/English copy, seven parameters, Freeze/Release operations, six uses, five “what it is” items, five “what it is not” items, the supplied eight preset names, confirmed specifications, beta notice, public acceptance lists, credits, and support topic list.
- [ ] Set `supportedFormats: ['VST3']`, `supportedPlatforms: ['Windows Beta']`, `publicPrice: false`, `releaseDate: null`, `demoUrl: null`, `manualUrl: null`, empty audio, and `video.status: 'in-production'` without a poster.
- [ ] Add failing tests that assert the approved English/Japanese hero copy, seven controls, eight presets, hidden prices, and absence of checkout/demo media.
- [ ] Run `npm.cmd test -- tests/unit/product.test.ts tests/render/routes.test.ts` and confirm the new assertions fail before implementation.
- [ ] Implement the minimal data changes and rerun the targeted tests to green.
- [ ] Commit as `feat: add suspended launch content`.

### Task 2: Render the product launch and support routes

**Files:**
- Create: `src/components/ProductLaunch.astro`
- Create: `src/pages/support/[slug].astro`
- Create: `src/pages/ja/support/[slug].astro`
- Modify: `src/pages/products/[slug].astro`, `src/pages/ja/products/[slug].astro`, `src/components/ProductHero.astro`, `src/components/ProductCta.astro`
- Test: `tests/render/routes.test.ts`, `tests/render/content-pages.test.ts`

**Interfaces:**
- `ProductLaunch.astro` consumes `{ product, locale }` and renders only `product.launch` sections in the fixed order from the design spec.
- Support slug pages render `product.launch.support` and redirect unknown/hidden products to the locale product index.

- [ ] Add failing render assertions for Features, Controls, Uses, What it is/What it is not, Freeze / Release, Factory Presets, Specifications, Beta Information, Credits, `/support/suspended/`, and Japanese route parity.
- [ ] Build `ProductLaunch.astro` with semantic `section`, `h2`, `h3`, `ul`, `ol`, `dl`, and two-column comparison markup; keep media and CTA conditional on configured values.
- [ ] Update product pages to render `ProductLaunch` for a product with launch content and retain generic rendering for all other products.
- [ ] Add support slug pages with no invented installation path and include a bug-report checklist.
- [ ] Add the “Hear the concept” anchor as an internal link only; do not create a fake media player.
- [ ] Run targeted render tests and confirm all assertions pass.
- [ ] Commit as `feat: render suspended launch sections`.

### Task 3: Add homepage/products messaging and metadata safeguards

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/ja/index.astro`, `src/pages/products/index.astro`, `src/components/Header.astro`, `src/data/routes.ts`, `src/components/Seo.astro`, `src/lib/seo.ts`, `src/lib/analytics.ts`
- Test: `tests/render/navigation.test.ts`, `tests/render/seo.test.ts`, `tests/unit/analytics.test.ts`

**Interfaces:**
- Homepage announcement links to `/products/suspended/` and `/newsletter/` using the locale helper.
- `getProductOffer()` remains null unless the product is available, publicly priced, and has a valid HTTPS checkout URL.

- [ ] Add failing assertions for Products navigation, the `NEW INSTRUMENT` announcement, copy and CTAs in both locales, hidden collection links, and absence of Product Offer schema.
- [ ] Add the compact announcement block after the homepage hero using the existing mockup and locale copy without replacing the studio hero.
- [ ] Update Products copy to list only SC Suspended, Traces in development, Tendril in development, and SC Vitreous coming later; do not render hidden product cards.
- [ ] Ensure `publicRoutePaths` includes the new support route but not archived collections, and ensure SEO social image uses the product mockup without adding price data.
- [ ] Add non-PII event hooks through the existing analytics helper only where the helper is configured.
- [ ] Run navigation, SEO, and analytics tests.
- [ ] Commit as `feat: announce suspended across studio navigation`.

### Task 4: Style responsive launch sections and document updates

**Files:**
- Modify: `src/styles/global.css`, `src/components/NewsletterForm.astro`
- Create: `docs/SC_SUSPENDED_LAUNCH_GUIDE.md`
- Test: `tests/browser/responsive-accessibility.e2e.ts`, `tests/render/newsletter.test.ts`

**Interfaces:**
- Existing newsletter validation remains the safe fallback when API configuration is absent; the form receives a non-PII `interest` value for SC Suspended.

- [ ] Add failing browser assertions for 360px and 1440px layouts, no horizontal scrolling, visible focus, and reduced-motion behavior.
- [ ] Add concise grid/list styles for launch sections, readable mobile tables, 44px controls, and the existing near-white/monochrome visual language; do not add animation libraries.
- [ ] Add the optional interest field without sending email or personal data to analytics and retain honeypot/consent validation.
- [ ] Write the launch guide with exact environment variable names and data fields for prices, release, Stripe checkout, Demo, Manual, video, audio, compatibility, beta removal, Product schema, and later Traces publication.
- [ ] Run browser accessibility tests and newsletter tests.
- [ ] Commit as `docs: add suspended launch update guide`.

### Task 5: Verify locally and prepare handoff

**Files:**
- Modify: `docs/VERIFICATION.md` only if required by actual results.
- Artifacts: screenshots under `.codex/visualizations/2026/07/22/sc-suspended/`.

- [ ] Run `npm.cmd run check`, `npm.cmd test`, `npm.cmd run build`, and `git diff --check`.
- [ ] Start the local Astro server, inspect `/`, `/products/`, `/products/suspended/`, `/ja/products/suspended/`, and `/support/suspended/` at 360px and 1440px, and save desktop/mobile/products screenshots.
- [ ] Verify hidden `/collections/traces/` and `/collections/tendril/` remain unavailable and that no private paths or prices appear in built HTML.
- [ ] Run the final test suite again after screenshot verification.
- [ ] Commit any verification-only documentation changes and report the exact test/build results.
