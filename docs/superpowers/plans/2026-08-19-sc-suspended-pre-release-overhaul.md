# SC Suspended Pre-release Page Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing SC Suspended launch page around sound, concept, and interaction while preserving Astro routing, EN/JA localization, existing media plumbing, and pre-release safety gates.

**Architecture:** Keep `src/data/products.ts` as the single product source of truth and extend its `launch` record with a single release configuration and localized editorial sections. Keep `ProductLaunch.astro` as the page composition layer; reuse and tighten the existing AudioComparison, VideoSlot, NewsletterForm, analytics, support, and SEO components rather than adding new dependencies or routes.

**Tech Stack:** Astro 5, TypeScript, Vitest, Playwright, existing CSS tokens, existing Plausible and newsletter hooks.

**Spec:** `docs/superpowers/specs/2026-08-19-sc-suspended-pre-release-overhaul-design.md`

## Global Constraints

- Public state remains `releaseState: 'pre-release'`, `showPrice: false`, `showBuyButton: false`, and `showNewsletterCTA: true`.
- Do not publish fake audio, video, release dates, checkout URLs, prices, compatibility claims, or placeholder media.
- English and Japanese product routes must render complete localized copy without English fallback in Japanese SC Suspended sections.
- Preserve existing routes, skip link, focus styles, 44px targets, reduced-motion behavior, and no new runtime dependency.
- Do not change unrelated page designs or publish Traces/Tendril collections.

### Task 1: Lock release state and editorial data with tests

**Files:**
- Modify: `src/data/products.ts`
- Test: `tests/unit/product-status.test.ts`
- Test: `tests/unit/product.test.ts`

**Interfaces:**
- Produces `Product.launch.release` with the exact public release flags and optional commercial/media gates consumed by later tasks.
- Produces localized `launch.sound`, `launch.video`, `launch.concept`, `launch.coreIdeas`, `launch.interface`, `launch.freezeRelease`, `launch.presets`, `launch.uses`, `launch.difference`, `launch.specifications`, `launch.developmentStatus`, and CTA/support copy.

- [ ] **Step 1: Write failing state assertions**

Add tests that retrieve `getProductBySlug('suspended')` and assert:

```ts
expect(suspended?.launch?.release).toMatchObject({
  releaseState: 'pre-release',
  showPrice: false,
  showBuyButton: false,
  showNewsletterCTA: true,
  audioDemosEnabled: true,
  videoEnabled: true,
});
expect(suspended?.launch?.presets).toEqual([
  'Almost Motionless', 'Frozen Distance', 'Fine Particles', 'Large Breath',
  'Glass Suspension', 'Sudden Opening', 'Fragile Continuum', 'A Sound Held in Air',
]);
```

Add a unit assertion for the approved English concept and Japanese tagline.

- [ ] **Step 2: Run the focused tests and verify they fail for missing fields**

Run: `npm.cmd test -- tests/unit/product-status.test.ts tests/unit/product.test.ts`

Expected: TypeScript/test failure because the new release/editorial fields do not exist yet.

- [ ] **Step 3: Add the minimal data types and data**

Extend `LaunchContent` with the release object and localized section types. Populate SC Suspended with the approved EN/JA copy, exact eight preset names, confirmed VST3/stereo/live-capture specifications, and no new media paths. Keep existing `supportedPlatforms` truthful to current repo evidence (`Windows Beta`) until a verified build matrix exists.

- [ ] **Step 4: Run the focused tests and existing product tests**

Run: `npm.cmd test -- tests/unit/product-status.test.ts tests/unit/product.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the data contract**

```powershell
git add src/data/products.ts tests/unit/product-status.test.ts tests/unit/product.test.ts
git commit -m "feat: define suspended pre-release release state"
```

### Task 2: Add missing-asset checklist and safe media behavior tests

**Files:**
- Create: `docs/suspended-release-assets.md`
- Modify: `src/components/AudioComparison.astro`
- Modify: `src/components/VideoSlot.astro`
- Modify: `src/scripts/audio-comparison.ts`
- Test: `tests/render/newsletter.test.ts`
- Test: `tests/browser/media.e2e.ts`

**Interfaces:**
- `AudioComparison` renders nothing when no valid source pairs exist and emits accessible controls when a pair exists.
- `VideoSlot` renders a video only for a ready source or a poster-only figure; it renders nothing for missing media.

- [ ] **Step 1: Write failing render assertions**

Update existing media tests so missing audio/video output does not contain `Audio comparison in production` or `Demonstration video in production`, and add assertions that a configured audio pair uses `preload="metadata"` and a configured video uses `preload="metadata"`.

- [ ] **Step 2: Run focused tests and verify the old placeholder behavior fails**

Run: `npm.cmd test -- tests/render/newsletter.test.ts`

Expected: FAIL because current components publish placeholder strings.

- [ ] **Step 3: Implement conditional media rendering**

Return `null`/empty markup when no source exists. Keep native audio/video controls, explicit dimensions/aspect-ratio wrappers, `loading="lazy"` for poster images, `preload="metadata"`, and no autoplay. Add `ended` handling in the audio script to emit the completion event once per playback.

- [ ] **Step 4: Add the exact asset checklist**

Document all requested asset names under `public/audio/products/suspended/` and `public/video/products/suspended/`, recommended WAV/MP4/WebM/VTT formats, dimensions, and optimization notes.

- [ ] **Step 5: Run media tests**

Run: `npm.cmd test -- tests/render/newsletter.test.ts`; then `npm.cmd run test:browser -- tests/browser/media.e2e.ts`.

Expected: PASS; browser test confirms paused start, keyboard play, exclusive playback, and no autoplay.

- [ ] **Step 6: Commit media safety changes**

```powershell
git add docs/suspended-release-assets.md src/components/AudioComparison.astro src/components/VideoSlot.astro src/scripts/audio-comparison.ts tests/render/newsletter.test.ts tests/browser/media.e2e.ts
git commit -m "fix: hide missing suspended media safely"
```

### Task 3: Recompose the EN/JA page and newsletter CTA

**Files:**
- Modify: `src/components/ProductLaunch.astro`
- Modify: `src/components/NewsletterForm.astro`
- Modify: `src/scripts/newsletter.ts`
- Modify: `src/styles/global.css`
- Test: `tests/render/routes.test.ts`
- Test: `tests/render/cta.test.ts`
- Test: `tests/render/newsletter.test.ts`

**Interfaces:**
- `ProductLaunch` consumes the new data contract and renders the fixed editorial order with conditional media and release gates.
- `NewsletterForm` accepts an optional `source` prop and serializes `source=suspended_product_page` without changing consent/error behavior.

- [ ] **Step 1: Write failing route/order assertions**

Add render assertions for both `/products/suspended/` and `/ja/products/suspended/` covering:

```ts
expect(html.indexOf('Sound in suspension. A body still in motion.')).toBeLessThan(html.indexOf('Hear what stays in motion.'));
expect(html.indexOf('Hear what stays in motion.')).toBeLessThan(html.indexOf('Hold a sound without stopping its time.'));
expect(html).toContain('Freeze. Hold. Transform. Release.');
expect(html).toContain('A small set of controls. A wide internal space.');
expect(html).toContain('Be notified when Suspended is released.');
expect(html).not.toContain('Audio comparison in production');
expect(html).not.toContain('Demonstration video in production');
expect(html).not.toContain('$19');
expect(html).not.toContain('Buy');
```

Assert the Japanese route contains the Japanese hero and CTA copy and no English section heading.

- [ ] **Step 2: Run route/CTA tests and verify failure**

Run: `npm.cmd test -- tests/render/routes.test.ts tests/render/cta.test.ts tests/render/newsletter.test.ts`

Expected: FAIL because the current component order and copy do not match.

- [ ] **Step 3: Replace page composition with the editorial order**

Implement semantic sections in `ProductLaunch.astro`: hero, conditional Sound First, conditional Video, concept, three ideas, interface, Freeze/Release, presets, uses, difference, specs, development status, dedicated notification CTA, and support link. Render prices and buy controls only when the release config allows both flag and URL. Keep the existing supplied mockup as the interface visual and use meaningful/empty alt text appropriately.

- [ ] **Step 4: Wire the source-aware newsletter form**

Add `source?: string` to the component props, render a hidden input only when provided, and pass `source="suspended_product_page"` from the dedicated CTA. Keep the main newsletter form behavior unchanged.

- [ ] **Step 5: Add the minimum editorial CSS**

Reuse `--paper`, `--ink`, `--muted`, `--rule`, and existing spacing. Add responsive grids for ideas/controls, compact audio rows, a video aspect wrapper, interface media, and a vertical mobile layout at 760px. Do not add rounded cards, gradients, autoplay, or new fonts.

- [ ] **Step 6: Run route/CTA tests**

Run: `npm.cmd test -- tests/render/routes.test.ts tests/render/cta.test.ts tests/render/newsletter.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit page composition**

```powershell
git add src/components/ProductLaunch.astro src/components/NewsletterForm.astro src/scripts/newsletter.ts src/styles/global.css tests/render/routes.test.ts tests/render/cta.test.ts tests/render/newsletter.test.ts
git commit -m "feat: reframe suspended page around sound"
```

### Task 4: Add analytics events and metadata assertions

**Files:**
- Modify: `src/lib/analytics.ts`
- Modify: `src/components/ProductLaunch.astro`
- Modify: `src/scripts/audio-comparison.ts`
- Modify: `src/scripts/newsletter.ts`
- Test: `tests/unit/analytics.test.ts`
- Test: `tests/render/seo.test.ts`

**Interfaces:**
- `trackEvent` accepts the eight specified Suspended event names and only forwards `locale`, `demo_name`, `source`, and `release_state` values.
- Page view/interaction hooks include the current locale and release state; no buy event exists while buy markup is hidden.

- [ ] **Step 1: Write failing analytics allowlist tests**

Extend the existing privacy test with a permitted call such as `trackEvent('suspended_demo_play', { locale: 'ja', demo_name: 'piano', source: 'suspended_product_page', release_state: 'pre-release', email: 'x@y.z' })` and assert only the four allowed properties are forwarded. Add one test for `suspended_page_view`.

- [ ] **Step 2: Run the focused analytics test and verify failure**

Run: `npm.cmd test -- tests/unit/analytics.test.ts`

Expected: FAIL because the event union and property allowlist do not contain the new events.

- [ ] **Step 3: Extend the allowlist and hooks**

Add the event union and property sets. Update ProductLaunch view, notify, support, demo, video, and newsletter success hooks. Keep `trackEvent` a no-op unless the existing Plausible provider/id are configured.

- [ ] **Step 4: Update SEO tests and metadata only if needed**

Assert the approved Suspended title/description and OG image remain on both locales. Preserve existing canonical and guarded Product schema behavior.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm.cmd test -- tests/unit/analytics.test.ts tests/render/seo.test.ts`

Expected: PASS.

```powershell
git add src/lib/analytics.ts src/components/ProductLaunch.astro src/scripts/audio-comparison.ts src/scripts/newsletter.ts tests/unit/analytics.test.ts tests/render/seo.test.ts
git commit -m "feat: instrument suspended release interactions"
```

### Task 5: Full regression, responsive/accessibility inspection, and documentation

**Files:**
- Modify: `docs/SC_SUSPENDED_LAUNCH_GUIDE.md`
- Modify: `docs/VERIFICATION.md`
- Test: `tests/browser/responsive-accessibility.e2e.ts`
- Test: `tests/render/content-pages.test.ts`

- [ ] **Step 1: Update the launch guide**

Document the new release object fields, media paths, newsletter source, analytics events, and verified current support claim. Remove instructions that tell future maintainers to publish placeholder copy.

- [ ] **Step 2: Add responsive/accessibility assertions**

Use the existing Playwright setup to visit EN/JA product and support routes at 360px and 1440px, assert no horizontal overflow, visible skip link on focus, no autoplay media, and no public missing-media placeholder text.

- [ ] **Step 3: Run all verification commands sequentially**

```powershell
npm.cmd run check
npm.cmd test -- --hookTimeout=60000
npm.cmd run build
npm.cmd run test:browser
git diff --check
```

Expected: all commands exit 0; test output reports 0 failures; build reports all static routes generated.

- [ ] **Step 4: Inspect the requested viewport matrix**

Use the existing local server and browser tools to inspect `/products/suspended/`, `/ja/products/suspended/`, `/products/`, and `/support/suspended/` at 360, 390, 768, 1024, 1440, and 1920px. Confirm no horizontal overflow and correct section order.

- [ ] **Step 5: Commit docs and final tests**

```powershell
git add docs/SC_SUSPENDED_LAUNCH_GUIDE.md docs/VERIFICATION.md tests/browser/responsive-accessibility.e2e.ts tests/render/content-pages.test.ts
git commit -m "docs: update suspended release verification guide"
```

### Task 6: Publish and verify GitHub Pages

**Files:**
- No source changes; publish the verified commits.

- [ ] **Step 1: Confirm clean branch and commit history**

Run: `git status --short --branch` and `git log --oneline -5`.

- [ ] **Step 2: Push the feature branch and main**

```powershell
git push origin feat/audio-instruments-site
git fetch origin main
git push origin HEAD:main
```

- [ ] **Step 3: Verify the Pages workflow**

Poll the latest `Deploy GitHub Pages` run for the pushed SHA using the GitHub Actions API and require `status=completed` and `conclusion=success`.

- [ ] **Step 4: Verify public routes**

Request `https://www.studiocucurbits.com/products/suspended/` and `/ja/products/suspended/` and assert HTTP 200, approved hero copy, no price/buy text, and no missing-media placeholder strings.

- [ ] **Step 5: Record the final report**

Report changed UX/content/structure, changed files, current release state, missing assets, human pre-release checklist, and fresh verification evidence.
