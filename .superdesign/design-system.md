# Studio Cucurbits Design System

Derived from the live site (`src/styles/global.css`, redesign after brunocis.co, 2026-09) — not an aspiration.

## Product context

Studio Cucurbits. is a two-person music and creative-technology studio (Sachie Kobayashi, composer; Frederik Bous) selling artist-designed audio plug-ins. The shop (/products) sells one-time licences via Paddle; installers are free demos. First product for sale: **Suspended**, a granular audio effect (Freeze / Release, drift, density, scatter). English and Japanese pages are equal citizens (`/ja/` twins).

Key journey on a product page: understand the sound → hear/see it → buy a licence (BUY pill → /purchase/suspended/ → Paddle → /setup/ licence setup) → download the installer for your OS → setup & support.

## Colour

- Page: grey paper `#e9e9e7`; lighter panel `#f3f3f1`.
- Ink `#0b0b0b`; muted `#5d5d5a`; hairline rules `rgba(11,11,11,.16)`, always 1px.
- Night bands (full-bleed black sections): bg `#0b0b0b`, text `#eeeeec`, muted `#94948f`.
- Monochrome only. No accent colour, no gradients, no glass, no shadows.

## Typography

- One family: Inter Tight (variable), Japanese fallback Hiragino Sans / Noto Sans JP. Gothic everywhere — the owner rejected serif and italic accents.
- Display: very large, weight 500, tight leading (~0.95–1.05), slight negative tracking.
- Eyebrows / labels: small uppercase, letter-spaced (e.g. `GRANULAR AUDIO EFFECT`, `SYSTEM REQUIREMENTS`).
- Body ~17px, weight 450.

## Visual grammar

- Editorial grid, generous white space, content max-width 100rem, gutter `clamp(1.25rem, 2.6vw, 3rem)`.
- Ruled tables (1px rules between rows) for offers and specifications.
- Buttons: black pill (`BUY  $29`) or full-width black band with icon (`Download for macOS  ↓`); secondary actions are small underlined text links with `→`.
- Imagery: greyscale product box renders and plain interface captures; no decorative illustration.
- Logo: dot-matrix Studio Cucurbits wordmark (supplied asset), never redrawn.

## Shop product page decisions (OP#201)

- Eyebrow `GRANULAR AUDIO EFFECT`; product name `SUSPENDED` (never "SC Suspended"; no "Traces").
- Price presentation is still open; show the Suspended licence at USD 29 as placeholder.
- Media sections (video, sound samples) appear only when supplied.
- Layout: catalogue sheet of ruled rows (label column + content), box art right. No (01)/(02) row numbering on any page.
- Buy licence is the only black band; the download is a text link to the free demo. No large standalone price.
- Cart page (/purchase/suspended/) uses the same ruled rows: item, total, after payment; Paddle form on the right.

## Responsive

- Desktop: two columns in the hero (copy + purchase left, box art right).
- Mobile: single column, image after the headline, full-width buttons, no horizontal scroll.
