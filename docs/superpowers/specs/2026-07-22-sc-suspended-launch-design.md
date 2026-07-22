# SC Suspended Launch Page Design

## Goal

Expand the existing SC Suspended announcement into a complete, public-facing coming-soon and Windows VST3 beta page while preserving Studio Cucurbits. as a multi-disciplinary studio. The page must be ready for future sales without exposing price, checkout, demo, audio, video, release date, or unverified compatibility information.

## Public scope

- Public routes: `/products/`, `/products/suspended/`, `/support/suspended/`, and their existing Japanese equivalents.
- Keep Traces and Tendril collection routes unpublished. SC Suspended may identify TRACES as its series without making the collection available.
- Retain English and Japanese as public locales. Product copy remains structured so French can be added later without modifying page components.
- Keep the homepage studio hero intact; add SC Suspended as a quiet instrument announcement in the existing editorial flow.

## Product data

The SC Suspended record is the single source of truth. It contains localized copy, identity, status, Windows Beta / VST3 / Stereo specifications, all seven controls, six uses, the eight supplied preset names, beta notice and public beta state, support guidance, credits, media, SEO, and optional commercial links.

The current state is `coming-soon`, beta enabled, `publicPrice: false`, and no public release date. Checkout remains prepared through the existing Stripe environment variables. A missing demo, checkout URL, manual, audio source, or playable video never renders a broken or disabled control. Video and audio sections remain absent until their assets are supplied.

The public hero copy is:

- Japanese: **浮遊する音。動き続ける身体。**
- English: **Sound in suspension. A body still in motion.**

Japanese description: SC Suspendedは、入力音を粒子状の音響体として空間に留め、その内側で微細な動きと変化を持続させるグラニュラー・エフェクトです。

English description: SC Suspended holds incoming audio as a granular sound body, preserving subtle motion and change within it.

## Page structure

The product page follows this editorial order:

1. Product hero: series, category, VST3 / Windows Beta / Coming Soon status, supplied SC Suspended mockup, approved tagline and concise description, notification CTA, and a non-media concept anchor.
2. Features: Freeze, Release, Grain / Density, Drift, Scatter / Fragility, Breath, and Release Tail.
3. Controls: the seven published parameters plus Freeze and Release operations.
4. Uses, followed by a two-column “What it is / What it is not” comparison.
5. Dedicated Freeze / Release explanation.
6. The supplied eight factory preset names, without invented descriptions.
7. Specifications, beta information, public beta acceptance state, and credits.
8. A final notification CTA and link to product support.

Feature layouts use typography, thin rules, the existing near-white palette, and generous space. There are no retail cards, gradients, countdowns, stock messaging, fake reviews, or unverified technical claims. The supplied `SC_Suspended_mockup_20260722.png` is the sole public product image until further approved assets arrive.

## Support, SEO, analytics, and accessibility

The product support page states only confirmed guidance: VST3 format, stereo operation, factory preset loading, rescanning, beta limitations, uninstallation, and the information needed for a bug report. It does not invent an installation path, compatible DAWs, or Windows versions.

The product page provides per-locale title, description, canonical and social image metadata, Organization and Breadcrumb schemas. Product Offer schema stays disabled until the product is available, has public pricing, and has a valid checkout URL.

Existing analytics plumbing receives only product-view and interaction event names; no form value or personal data is sent. Existing semantic structure, skip link, focus styles, reduced-motion rules, image dimensions, 44px controls, and responsive layouts remain mandatory.

## Release updates

The launch guide documents data and environment-variable changes for: enabling a release date, showing an introductory or regular price, adding Stripe checkout, demo, manual, video, audio comparisons, verified compatibility details, removing the beta label, enabling Product Offer schema, and publishing the Traces collection later. Page components are not edited for these updates.

## Validation

Automated tests cover public product and support routes, JP/EN copy and route parity, hidden collection routes, absent optional media and checkout links, hidden prices, all eight presets, beta content, structured-data safeguards, and notification fallback. Final verification includes type checking, production build, responsive inspection at 360px and 1440px, and screenshots of the product, products index, and support page.
