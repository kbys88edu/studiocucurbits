# Studio Cucurbits. website redesign

## Purpose

Rebuild the existing single-page studio website as a static Astro site for GitHub Pages and `www.studiocucurbits.com`.

Studio Cucurbits. remains the parent brand. The VST3/AU catalogue is one business area, **Audio Instruments**, rather than the identity of the whole website. Current instrument announcements appear in the site's Latest area and link into the instrument catalogue.

## Information architecture

- `/`: Studio overview, Latest, the three business areas, statement, newsletter, and footer.
- `/work`: composition and sound-design work, prepared as editable studio content.
- `/about`: existing studio background, people, approach, and selected practice. Existing approved assets and content move here; corrupted Japanese source text is not carried forward as published copy.
- `/products`, `/collections`, `/collections/traces`, `/collections/tendril`: Audio Instruments catalogue and collection pages.
- `/products/[slug]`: data-generated individual instrument pages.
- `/support`, `/downloads`, `/license`, `/privacy`, `/terms`: editable support and draft legal pages.
- `/coming-soon`, `/beta`, `/newsletter`, `/press`: optional, status-gated campaign routes.

Primary navigation is Studio, Work, Audio Instruments, About, and Support. Product navigation stays within Audio Instruments.

## Homepage

1. Studio Cucurbits. hero and concise studio proposition.
2. Latest: a data-selected current item. Initially SC Suspended is featured as coming soon; later this can be any studio, work, or instrument announcement.
3. Business areas: Composition / Sound Design, Creative Technology / AI Audio, and Audio Instruments.
4. Studio sound-first statement.
5. Newsletter / release-notification form with privacy note.
6. Global footer.

## Technical architecture

- Astro with TypeScript, static output, and GitHub Pages deployment.
- Shared layout, navigation, footer, SEO, and page templates.
- Product, collection, latest-item, and site configuration data live in `src/data`.
- English and Japanese content live in editable dictionaries and content data. English is the default; French is structurally supported later.
- Current approved logo and visual assets are retained with an asset manifest. New product media follows an explicit product/collection directory scheme.
- Environment-variable-only configuration for newsletter, analytics, contact addresses, and future Lemon Squeezy links. No secrets are committed.

## Product and commerce rules

The product record supports identity, collection, status, editorial copy, prices, verified compatibility, media, demos, licensing, links, SEO, and relationships. Optional values are `null` or empty and must not produce empty UI sections.

Supported states are hidden, announcement, coming soon, beta, demo available, intro sale, available, and discontinued. State determines CTA behaviour. A missing checkout URL never produces a purchasable link; it falls back to notification or no CTA. Checkout is prepared but not activated.

Initial public instrument status:

- SC Suspended: coming soon, featured in Latest.
- SC Vitreous: announcement / coming soon, stand-alone rather than Traces.
- Traces and Tendril: forthcoming collections.

## Visual and interaction design

Retain the current monochrome, typographic, dot-matrix character: near-white ground, black and gray text, thin rules, generous space, precise alignment, restrained labels, and no glossy retail treatment. UI mockups are the primary product imagery. Video without supplied sources is a poster plus an in-production label, never a broken control.

Layouts are editorial on desktop and a readable single column on mobile. All controls have at least 44px targets. Reduced motion removes non-essential decorative movement.

Audio comparisons have no autoplay, expose clear keyboard-operable play/stop controls, show loading state, and prevent simultaneous playback. They are omitted cleanly until source audio is supplied.

## Quality baseline

- Semantic landmarks, heading hierarchy, visible focus, contrast, accessible errors, and reduced-motion support target WCAG 2.2 AA where practical.
- Per-page metadata, canonical links, Open Graph, sitemap, robots, organization and breadcrumb structured data are generated. Product schema appears only when a product is actually available.
- Tests cover data-generated routes, absent optional data, CTA/status logic, currencies, locale route preservation, newsletter validation, mobile navigation, media placeholders, and reduced motion.
- Build, type check, lint, unit tests, and an accessibility check run before release.

## Deliverables

The implementation includes `.env.example`, `docs/CONTENT_GUIDE.md`, deployment instructions, GitHub Pages workflow, asset manifest, and a final verification report with desktop/mobile screenshots and known limitations.
