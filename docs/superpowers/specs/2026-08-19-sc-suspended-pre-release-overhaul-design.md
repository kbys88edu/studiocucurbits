# SC Suspended Pre-release Product Page Overhaul

## Goal

Reframe the existing SC Suspended product page around listening first while preserving the existing Astro routes, EN/JA locale structure, Studio Cucurbits. visual language, and data-driven product model.

## Scope

- Update `/products/suspended/` and `/ja/products/suspended/` only, plus shared media, newsletter, analytics, styling, documentation, and tests required by that page.
- Keep `/products/`, `/support/suspended/`, and all unrelated routes compatible.
- Keep Traces and Tendril unpublished.
- Do not add audio, video, checkout URLs, compatibility claims, release dates, or placeholder media that do not exist in `public/`.
- Keep the public release state as `pre-release`, with prices and purchase controls hidden.

## Current architecture

- Astro 5 static build with route files at `src/pages/products/[slug].astro` and `src/pages/ja/products/[slug].astro`.
- `src/data/products.ts` is the product record and contains localized launch copy, media, commercial fields, SEO, and support data.
- `ProductLaunch.astro` owns the current SC Suspended page markup.
- `AudioComparison.astro`, `VideoSlot.astro`, `NewsletterForm.astro`, `src/scripts/audio-comparison.ts`, `src/scripts/newsletter.ts`, and `src/lib/analytics.ts` are reusable existing plumbing.
- `BaseLayout.astro` and `Seo.astro` already emit canonical, alternate-language, Open Graph, breadcrumb, and guarded Product schema metadata.

## Design

### 1. Single release configuration

Extend the SC Suspended launch data with one `release` object:

```ts
{
  releaseState: 'pre-release',
  version: null,
  releaseDate: null,
  showPrice: false,
  showBuyButton: false,
  showNewsletterCTA: true,
  introPrice: { JPY: 2900, USD: 19 },
  regularPrice: { JPY: 4400, USD: 29 },
  currency: { ja: 'JPY', en: 'USD' },
  checkoutUrl: { JPY: null, USD: null },
  audioDemosEnabled: true,
  videoEnabled: true,
}
```

The product record remains the source of truth. Existing price and checkout fields remain available for generic product code, but the Suspended launch component reads the release object for public display gates. A price or buy link renders only when its corresponding flag and URL are both valid.

### 2. Editorial page order

`ProductLaunch.astro` renders these sections in this exact order:

1. Hero: `SC SUSPENDED`, `TRACES — Granular Audio Effect`, `PRE-RELEASE`, English/Japanese tagline, short description, `Hear Suspended` anchor, and release-notification CTA.
2. Sound First: `Hear what stays in motion.` and one `AudioComparison` per configured demo. The section is omitted when no valid demo pair exists.
3. Short Video: `Freeze. Hold. Transform. Release.` and `VideoSlot`. The section is omitted when no ready video or poster exists.
4. Product Concept: `Hold a sound without stopping its time.` with the approved two paragraphs.
5. Three Core Ideas: HOLD, MOTION, RELEASE in an editorial three-column layout that stacks on mobile.
6. Interface: `A small set of controls. A wide internal space.` with the supplied product visual and the seven concise control descriptions.
7. Freeze / Release: `Capture and let go.` with separate Freeze and Release explanations.
8. Presets: `Eight starting points` and the eight supplied names as a quiet ordered list.
9. Uses: `Made for material, not genre.` and the approved use cases.
10. Difference: `Not another static freeze.` with the short approved explanation and one restrained contrast sentence.
11. Factory Specifications: confirmed VST3, stereo, live capture, Freeze/Release, seven parameters, and eight presets only.
12. Pre-release note: `Development status` after specifications; no mixed Alpha/Coming Soon labels.
13. Dedicated notification CTA: `Be notified when Suspended is released.` with existing form/backend and `source=suspended_product_page`.
14. Installation & Support link to the existing localized support route.

### 3. Media behavior

- Hero product mockup continues using the existing supplied file.
- Audio demos use explicit pairs with `preload="metadata"`; no autoplay; one audio element pauses others; play, pause, progress, and accessible labels are native/semantic.
- Video uses `preload="metadata"`, native controls, optional poster/captions, and renders only if a source exists. A poster-only video is allowed; a missing source and missing poster render no public section.
- No public strings such as “in production”, “placeholder”, “TODO”, or “coming soon” are emitted by media components.
- `docs/suspended-release-assets.md` records the missing asset checklist and exact paths.

### 4. Newsletter and analytics

- The existing `NewsletterForm` is reused with a hidden `source` field set to `suspended_product_page` for the product CTA.
- Existing consent, honeypot, endpoint, unavailable, success, and error behavior remains unchanged.
- Extend the allowlisted analytics event union with:
  `suspended_page_view`, `suspended_demo_play`, `suspended_demo_complete`, `suspended_video_play`, `suspended_notify_click`, `suspended_notify_success`, `suspended_support_click`, and `suspended_buy_click`.
- Allowed properties are limited to `locale`, `demo_name`, `source`, and `release_state`; no form values or personal data are sent.
- Buy events are wired only to a rendered buy control, which is absent in the current state.

### 5. Localization and SEO

- Provide complete EN and JA copy for every rendered section; no English fallback should appear in the JA page for SC Suspended.
- Keep existing route and locale helpers intact so future French additions are unaffected.
- Update the Suspended SEO title/description to the approved concept-led metadata while retaining the existing canonical, alternate, OG image, and guarded Product schema behavior.

### 6. Styling and responsive behavior

- Extend `src/styles/global.css` using existing variables, near-white palette, thin rules, and typography.
- Use responsive grids for core ideas, controls, and media; stack content at the existing mobile breakpoint with no horizontal overflow at 360px and 390px.
- Preserve skip link, visible focus styles, 44px controls, meaningful alt text, and reduced-motion behavior.

## Files to change

- Modify `src/data/products.ts`.
- Modify `src/components/ProductLaunch.astro`.
- Modify `src/components/AudioComparison.astro` and `src/components/VideoSlot.astro`.
- Modify `src/components/NewsletterForm.astro`, `src/scripts/newsletter.ts`, and `src/lib/analytics.ts`.
- Modify `src/scripts/audio-comparison.ts`.
- Modify `src/styles/global.css`.
- Modify `src/components/Seo.astro` only if metadata needs no new architecture; otherwise keep it unchanged.
- Add `docs/suspended-release-assets.md`.
- Update unit, render, and browser tests covering order, copy, gates, media absence, analytics properties, source tagging, and route regression.

## Verification

- `npm.cmd run check`
- `npm.cmd test -- --hookTimeout=60000`
- `npm.cmd run build`
- `npm.cmd run test:browser` with the existing local server configuration.
- Inspect EN and JA product/support routes at 360, 390, 768, 1024, 1440, and 1920px; confirm no horizontal overflow, keyboard focus, reduced motion, and absence of missing-media placeholder copy.
- Confirm `git diff --check` and the GitHub Pages deployment after push.

## Explicit non-goals

- No framework migration, new analytics dependency, new checkout integration, unrelated route redesign, fake audio/video, fake pricing/release date, or publication of unverified OS/DAW compatibility.
