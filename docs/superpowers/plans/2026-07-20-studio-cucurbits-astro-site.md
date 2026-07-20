# Studio Cucurbits. Astro Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current static studio page with an Astro site that presents Studio Cucurbits. as a three-area studio and provides a safe, data-driven Audio Instruments catalogue.

**Architecture:** Astro statically generates studio, product, collection, support, and legal routes for GitHub Pages. Typed content data drives product state, Latest, prices, translations, and media availability; shared templates derive CTA and visible sections from that data.

**Tech Stack:** Astro, TypeScript, plain CSS, Vitest, Playwright with axe-core, GitHub Actions, GitHub Pages.

## Global Constraints

- Keep Studio Cucurbits. as the parent brand; Audio Instruments is one of three business areas.
- Preserve approved logo/assets and move existing studio context to `/about`; do not publish corrupted Japanese source text.
- Never invent compatibility, features, reviews, release dates, prices, checkout URLs, legal claims, or product media.
- Default locale is English; Japanese content is editable data; French is not implemented but must be addable without page duplication.
- A null checkout URL must never yield a purchase link.
- Use static output and keep client JavaScript dependency-free unless browser media interaction requires a small local script.
- Target WCAG 2.2 AA where practical; honor `prefers-reduced-motion`.
- Commit `package-lock.json`; use `npm` consistently.

---

## Planned file structure

| Path | Responsibility |
| --- | --- |
| `src/data/products.ts` | Typed products, collections, pricing, release state, media and CTA inputs. |
| `src/data/site.ts` | Parent-brand areas, Latest selection, contacts, social links, and site settings. |
| `src/i18n/{en,ja}.ts` | Editable interface and editorial translations. |
| `src/lib/{product,locale,analytics}.ts` | Status-to-CTA, currency/date presentation, locale lookup, optional analytics events. |
| `src/layouts/BaseLayout.astro` | Metadata, language, global shell, canonical and structured data. |
| `src/components/` | Focused navigation, footer, cards, media, form, and product sections. |
| `src/pages/` | File-based route definitions and static product/collection generation. |
| `public/images/` | Approved assets and future product media, organized by brand/collections/products. |
| `tests/` | Unit, rendering, and browser tests. |
| `.github/workflows/deploy.yml` | Validate and deploy static output to GitHub Pages. |

### Task 1: Establish the Astro project and retain source assets

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `.gitignore`
- Create: `public/images/brand/`, `public/images/studio/`, `public/images/products/`, `public/CNAME`
- Modify: `README.md`
- Remove after verified migration: root `index.html`, `styles.css`, `script.js`, `CNAME`, `assets/`

- [ ] **Step 1: Capture the legacy-page baseline before modifying files**

Run: `git show HEAD:index.html > legacy-index.html && git show HEAD:styles.css > legacy-styles.css && git show HEAD:script.js > legacy-script.js`

Expected: three local baseline files exist for comparison and are deleted before committing this task.

- [ ] **Step 2: Scaffold a static Astro project in the repository root**

Run: `npm create astro@latest . -- --template minimal --typescript strict --install --git false`

Expected: `package.json`, `astro.config.mjs`, `src/`, and `public/` exist; no framework renderer is installed.

- [ ] **Step 3: Configure the production site identity**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.studiocucurbits.com',
  output: 'static',
  trailingSlash: 'always',
});
```

- [ ] **Step 4: Move approved assets without renaming their filenames**

```powershell
New-Item -ItemType Directory -Force public/images/brand, public/images/studio | Out-Null
Move-Item assets/studio-cucurbits-logo.png public/images/brand/studio-cucurbits-logo.png
Move-Item assets/studio_cucurbits_logo_vector.svg public/images/brand/studio_cucurbits_logo_vector.svg
Move-Item assets/* public/images/studio/
Move-Item CNAME public/CNAME
```

- [ ] **Step 5: Add the asset manifest and migration note to `README.md`**

```md
## Asset migration

Legacy files in `assets/` now live in `public/images/brand/` and `public/images/studio/` with their original filenames. Product UI images belong in `public/images/products/<slug>/`.
```

- [ ] **Step 6: Verify the starter build, then remove replaced legacy root files**

Run: `npm run build`

Expected: `dist/` is created with exit code 0.

Run: `Remove-Item index.html, styles.css, script.js, legacy-index.html, legacy-styles.css, legacy-script.js`

- [ ] **Step 7: Commit the migration baseline**

Run: `git add package.json package-lock.json astro.config.mjs tsconfig.json src public README.md .gitignore && git rm index.html styles.css script.js CNAME assets -r && git commit -m "feat: establish Astro site foundation"`

### Task 2: Add typed site, localization, and product data

**Files:**
- Create: `src/data/products.ts`, `src/data/site.ts`, `src/i18n/en.ts`, `src/i18n/ja.ts`, `src/i18n/index.ts`
- Create: `src/lib/product.ts`, `src/lib/locale.ts`, `tests/unit/product.test.ts`

**Interfaces:**
- Produces: `Product`, `Collection`, `ProductStatus`, `getProductBySlug(slug)`, `getProductCta(product, today)`, `formatPrice(amount, currency, locale)`.

- [ ] **Step 1: Write failing status and price tests**

```ts
import { describe, expect, it } from 'vitest';
import { getProductCta, formatPrice } from '../../src/lib/product';

describe('product CTA', () => {
  it('uses notification when a coming-soon product has no checkout URL', () => {
    expect(getProductCta({ status: 'coming-soon', checkoutUrlUSD: null } as any, new Date('2026-07-20')))
      .toEqual({ label: 'notify', href: '/newsletter/', disabled: false });
  });
});

it('formats configured JPY without conversion', () => {
  expect(formatPrice(4400, 'JPY', 'en')).toBe('¥4,400');
});
```

- [ ] **Step 2: Confirm the tests fail**

Run: `npx vitest run tests/unit/product.test.ts`

Expected: FAIL because the data and helpers do not exist.

- [ ] **Step 3: Define the core data model and safe CTA helper**

```ts
export type ProductStatus = 'hidden' | 'announcement' | 'coming-soon' | 'beta' | 'demo-available' | 'intro-sale' | 'available' | 'discontinued';
export type Currency = 'JPY' | 'USD';
export interface Product { slug: string; name: string; collection: string | null; status: ProductStatus; checkoutUrlJPY: string | null; checkoutUrlUSD: string | null; regularPriceJPY: number | null; regularPriceUSD: number | null; introPriceJPY: number | null; introPriceUSD: number | null; introSaleEndDate: string | null; demoUrl: string | null; video: { status: 'in-production' | 'ready'; poster: string | null; mp4: string | null; webm: string | null; captions: string | null }; }

export function getProductCta(product: Product, today: Date) {
  if (product.status === 'hidden' || product.status === 'discontinued') return null;
  if (product.status === 'announcement' || product.status === 'coming-soon') return { label: 'notify', href: '/newsletter/', disabled: false };
  const url = product.checkoutUrlUSD;
  if ((product.status === 'available' || product.status === 'intro-sale') && url) return { label: product.status === 'intro-sale' ? 'buy-intro' : 'buy', href: url, disabled: false };
  return product.demoUrl ? { label: 'demo', href: product.demoUrl, disabled: false } : { label: 'notify', href: '/newsletter/', disabled: false };
}
```

- [ ] **Step 4: Populate only supplied product facts**

Create records for all named products with unknown fields set to `null` or `[]`; set SC Suspended to `coming-soon`, SC Vitreous to `announcement`, and collections to forthcoming. Store the supplied prices but gate unreleased price display with `publicPrice: false`.

- [ ] **Step 5: Add English/Japanese dictionaries and locale resolver**

```ts
export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
```

- [ ] **Step 6: Run unit tests and type checks**

Run: `npx vitest run tests/unit/product.test.ts && npx astro check`

Expected: PASS with no TypeScript diagnostics.

- [ ] **Step 7: Commit**

Run: `git add src/data src/i18n src/lib tests/unit && git commit -m "feat: add typed studio and product data"`

### Task 3: Build the global shell and parent-brand navigation

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/{Header,Footer,LanguageSwitch,Seo}.astro`, `src/styles/global.css`
- Create: `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/work.astro`
- Test: `tests/render/navigation.test.ts`

- [ ] **Step 1: Write a failing render test for parent-brand navigation**

```ts
expect(html).toContain('Audio Instruments');
expect(html).toContain('href="/about/"');
expect(html).not.toContain('Buy now');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/render/navigation.test.ts`

Expected: FAIL because the layout and routes do not exist.

- [ ] **Step 3: Implement `BaseLayout.astro` with explicit metadata props**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
interface Props { title: string; description: string; canonicalPath: string; locale?: 'en' | 'ja'; }
const { title, description, canonicalPath, locale = 'en' } = Astro.props;
const canonical = new URL(canonicalPath, Astro.site);
---
<!doctype html><html lang={locale}><head><title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={canonical} /></head><body><Header /><main><slot /></main><Footer /></body></html>
```

- [ ] **Step 4: Implement the Home, About, and Work page content boundaries**

Use data-driven `BusinessArea` cards on Home. Put existing approved studio biography and credits in About; do not copy any garbled Japanese strings. Use existing studio assets only where their current meaning remains accurate.

- [ ] **Step 5: Run render test and build**

Run: `npx vitest run tests/render/navigation.test.ts && npm run build`

Expected: PASS; routes `/`, `/about/`, and `/work/` appear in `dist/`.

- [ ] **Step 6: Commit**

Run: `git add src/layouts src/components src/pages src/styles tests/render && git commit -m "feat: add Studio Cucurbits global site shell"`

### Task 4: Implement the Latest system and Audio Instruments catalogue

**Files:**
- Create: `src/components/{LatestItem,ProductCard,CollectionCard,StatusLabel}.astro`
- Create: `src/pages/products/index.astro`, `src/pages/collections/index.astro`
- Modify: `src/data/site.ts`, `src/data/products.ts`, `src/pages/index.astro`
- Test: `tests/render/catalogue.test.ts`

- [ ] **Step 1: Write failing tests for Latest and hidden-product exclusion**

```ts
expect(homeHtml).toContain('SC Suspended');
expect(productsHtml).not.toContain('Hidden prototype');
expect(productsHtml).toContain('Coming soon');
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/render/catalogue.test.ts`

Expected: FAIL because no catalogue templates exist.

- [ ] **Step 3: Add the parent-brand Latest item model**

```ts
export interface LatestItem { type: 'instrument' | 'studio' | 'work'; title: string; summary: string; href: string; status: string | null; image: string | null; }
export const latestItem: LatestItem = { type: 'instrument', title: 'SC Suspended', summary: 'A held sound that appears motionless while time continues to move inside it.', href: '/products/suspended/', status: 'coming soon', image: null };
```

- [ ] **Step 4: Implement cards with media and status fallbacks**

```astro
{product.heroImage ? <img src={product.heroImage} alt={product.name} width="1200" height="800" loading="lazy" /> : <div class="media-placeholder" aria-hidden="true" />}
<p class="eyebrow">{statusLabel(product.status)}</p>
<h2><a href={`/products/${product.slug}/`}>{product.name}</a></h2>
```

- [ ] **Step 5: Verify tests and generated catalogue pages**

Run: `npx vitest run tests/render/catalogue.test.ts && npm run build`

Expected: PASS and `dist/products/index.html` plus `dist/collections/index.html` exist.

- [ ] **Step 6: Commit**

Run: `git add src/components src/data src/pages tests/render && git commit -m "feat: add latest and Audio Instruments catalogue"`

### Task 5: Add collection and data-generated product routes

**Files:**
- Create: `src/pages/collections/[slug].astro`, `src/pages/products/[slug].astro`
- Create: `src/components/{CollectionHero,ProductHero,ProductDetails,RelatedProducts}.astro`
- Test: `tests/render/routes.test.ts`, `tests/unit/optional-data.test.ts`

- [ ] **Step 1: Write failing route and empty-data tests**

```ts
expect(productSlugs).toContain('suspended');
expect(productSlugs).toContain('vitreous');
expect(renderedHtml).not.toContain('Compatibility</h2>');
expect(renderedHtml).not.toContain('href=""');
```

- [ ] **Step 2: Run them to verify failure**

Run: `npx vitest run tests/render/routes.test.ts tests/unit/optional-data.test.ts`

Expected: FAIL until static paths and conditional sections are implemented.

- [ ] **Step 3: Generate static paths from visible records**

```astro
---
import { products, getProductBySlug } from '../../data/products';
export function getStaticPaths() {
  return products.filter((product) => product.status !== 'hidden').map((product) => ({ params: { slug: product.slug } }));
}
const product = getProductBySlug(Astro.params.slug!);
if (!product) return Astro.redirect('/products/');
---
```

- [ ] **Step 4: Implement SC Suspended and SC Vitreous editorial data**

Add only supplied copy: SC Suspended's hold/suspension concept and SC Vitreous's input-derived fracture, no prerecorded glass samples, no AI/cloud processing statements. Leave compatibility, demos, videos, and checkout URLs null until supplied.

- [ ] **Step 5: Render optional sections only with data**

```astro
{product.supportedFormats.length > 0 && <section aria-labelledby="compatibility"><h2 id="compatibility">Compatibility</h2><ul>{product.supportedFormats.map((format) => <li>{format}</li>)}</ul></section>}
```

- [ ] **Step 6: Run tests and static build**

Run: `npx vitest run tests/render/routes.test.ts tests/unit/optional-data.test.ts && npm run build`

Expected: PASS and every non-hidden product produces a `dist/products/<slug>/index.html` file.

- [ ] **Step 7: Commit**

Run: `git add src/pages src/components src/data tests && git commit -m "feat: add data-generated instrument routes"`

### Task 6: Add status-driven price and CTA presentation

**Files:**
- Create: `src/components/{PriceBlock,ProductCta}.astro`
- Modify: `src/lib/product.ts`, `src/components/ProductHero.astro`
- Test: `tests/unit/product-status.test.ts`, `tests/render/cta.test.ts`

- [ ] **Step 1: Write failing date-bound intro-price and no-checkout tests**

```ts
expect(getDisplayPrice(introProduct, new Date('2026-08-01'), 'USD')).toEqual({ amount: 49, kind: 'intro' });
expect(getDisplayPrice(introProduct, new Date('2026-08-16'), 'USD')).toEqual({ amount: 69, kind: 'regular' });
expect(availableWithoutUrlCta.label).toBe('notify');
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npx vitest run tests/unit/product-status.test.ts tests/render/cta.test.ts`

Expected: FAIL until date logic and CTA component exist.

- [ ] **Step 3: Implement explicit, non-converting price selection**

```ts
export function getDisplayPrice(product: Product, today: Date, currency: Currency) {
  const introEnds = product.introSaleEndDate ? new Date(`${product.introSaleEndDate}T23:59:59Z`) : null;
  const useIntro = product.status === 'intro-sale' && introEnds !== null && today <= introEnds;
  const amount = useIntro ? (currency === 'JPY' ? product.introPriceJPY : product.introPriceUSD) : (currency === 'JPY' ? product.regularPriceJPY : product.regularPriceUSD);
  return amount === null ? null : { amount, kind: useIntro ? 'intro' : 'regular' };
}
```

- [ ] **Step 4: Render price only when `publicPrice` and an amount are available**

```astro
{product.publicPrice && price && <p class="price"><span>{price.kind === 'intro' ? copy.introPrice : copy.price}</span>{formatPrice(price.amount, currency, locale)}</p>}
```

- [ ] **Step 5: Add development-only missing-checkout warning**

```ts
if (import.meta.env.DEV && (product.status === 'available' || product.status === 'intro-sale') && !product.checkoutUrlUSD) console.warn(`Missing checkout URL for ${product.slug}`);
```

- [ ] **Step 6: Run focused tests and commit**

Run: `npx vitest run tests/unit/product-status.test.ts tests/render/cta.test.ts && git add src/lib src/components tests && git commit -m "feat: add safe pricing and status CTAs"`

### Task 7: Add newsletter, analytics, and media placeholders

**Files:**
- Create: `src/components/{NewsletterForm,VideoSlot,AudioComparison}.astro`, `src/scripts/{newsletter,audio-comparison}.ts`
- Create: `src/lib/analytics.ts`, `.env.example`, `src/pages/newsletter.astro`
- Test: `tests/unit/newsletter.test.ts`, `tests/browser/media.spec.ts`

- [ ] **Step 1: Write failing form validation and media-state tests**

```ts
expect(validateNewsletter({ email: 'bad', interest: 'all' }).email).toBeDefined();
await expect(page.getByRole('button', { name: 'Play dry' })).toBeVisible();
await expect(page.getByText('Demonstration video in production')).toBeVisible();
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/unit/newsletter.test.ts && npx playwright test tests/browser/media.spec.ts`

Expected: FAIL because no newsletter or media components exist.

- [ ] **Step 3: Add environment names without values**

```dotenv
SITE_URL=
DEFAULT_LOCALE=en
NEWSLETTER_PROVIDER=
NEWSLETTER_FORM_ACTION=
NEWSLETTER_API_ENDPOINT=
LEMON_SQUEEZY_STORE_URL=
ANALYTICS_PROVIDER=
ANALYTICS_ID=
SUPPORT_EMAIL=
PRESS_EMAIL=
```

- [ ] **Step 4: Implement provider-agnostic client submission**

```ts
export async function submitNewsletter(form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint;
  if (!endpoint) throw new Error('Newsletter is not configured.');
  const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Subscription could not be confirmed.');
}
```

- [ ] **Step 5: Implement safe video and audio branches**

```astro
{video.status === 'ready' && (video.mp4 || video.webm) ? <video controls preload="metadata" poster={video.poster ?? undefined}><source src={video.mp4 ?? video.webm!} /><track kind="captions" src={video.captions ?? undefined} /></video> : video.poster && <figure><img src={video.poster} alt="" loading="lazy" /><figcaption>Demonstration video in production</figcaption></figure>}
```

- [ ] **Step 6: Ensure one audio element plays at a time**

```ts
document.addEventListener('play', (event) => document.querySelectorAll('audio').forEach((audio) => { if (audio !== event.target) audio.pause(); }), true);
```

- [ ] **Step 7: Run tests, build, and commit**

Run: `npx vitest run tests/unit/newsletter.test.ts && npx playwright test tests/browser/media.spec.ts && npm run build && git add src .env.example tests && git commit -m "feat: add announcement media and newsletter foundation"`

### Task 8: Add collections, support, and legal content routes

**Files:**
- Create: `src/pages/{support,downloads,license,privacy,terms,coming-soon,beta,press}.astro`
- Create: `src/components/{Faq,SupportGuide,LegalDraftNotice}.astro`
- Modify: `src/pages/collections/[slug].astro`, `src/data/products.ts`
- Test: `tests/render/content-pages.test.ts`

- [ ] **Step 1: Write failing route and draft-notice tests**

```ts
for (const route of ['/support/', '/license/', '/privacy/', '/terms/']) expect(routes).toContain(route);
expect(legalHtml).toContain('Draft content requiring final review');
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/render/content-pages.test.ts`

Expected: FAIL because the content pages are absent.

- [ ] **Step 3: Implement collection content from collection data**

Include exact supplied Traces and Tendril copy, current status, included products, supplied bundle prices, explanatory text for the 14-day intro period, media placeholders, and no checkout for incomplete collections.

- [ ] **Step 4: Implement support content with only generic, editable guidance**

Include installation, plugin scan, Apple Silicon, common VST3/AU paths, and bug-report fields. Do not assert unverified product compatibility.

- [ ] **Step 5: Implement legal pages with the mandatory draft notice**

```astro
<aside class="draft-notice" role="note">Draft content requiring final review before publication.</aside>
```

- [ ] **Step 6: Run tests and commit**

Run: `npx vitest run tests/render/content-pages.test.ts && npm run build && git add src/pages src/components src/data tests && git commit -m "feat: add collection support and legal routes"`

### Task 9: Complete styling, localization switching, and asset performance

**Files:**
- Create: `src/styles/{tokens,layout,components}.css`, `src/components/LocalizedLink.astro`
- Modify: `src/styles/global.css`, `src/components/LanguageSwitch.astro`, every route layout call
- Test: `tests/browser/{responsive,locale,a11y}.spec.ts`

- [ ] **Step 1: Write failing browser tests for locale, mobile nav, and reduced motion**

```ts
await page.setViewportSize({ width: 390, height: 844 });
await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
await page.emulateMedia({ reducedMotion: 'reduce' });
await expect(page.locator('[data-decorative-motion]')).toHaveCSS('animation-name', 'none');
```

- [ ] **Step 2: Run browser tests to verify failure**

Run: `npx playwright test tests/browser/responsive.spec.ts tests/browser/locale.spec.ts tests/browser/a11y.spec.ts`

Expected: FAIL until styles and controls are complete.

- [ ] **Step 3: Define monochrome design tokens and reduced-motion defaults**

```css
:root { --paper: #fbfbfa; --ink: #111; --muted: #656565; --rule: #d8d8d4; --space: clamp(1.25rem, 3vw, 4rem); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
```

- [ ] **Step 4: Implement responsive source media and dimensions**

Use `width`, `height`, `loading="lazy"`, and `decoding="async"` on non-hero images. Add `srcset` only for supplied alternate files; do not manufacture low-quality UI images.

- [ ] **Step 5: Add locale preservation through `?lang=ja`**

```ts
export function localizedPath(path: string, locale: Locale) { return locale === defaultLocale ? path : `${path}?lang=${locale}`; }
```

- [ ] **Step 6: Run viewport and accessibility tests**

Run: `npx playwright test tests/browser/responsive.spec.ts tests/browser/locale.spec.ts tests/browser/a11y.spec.ts`

Expected: PASS at 360, 390, 768, 1024, 1440, and 1920px; axe reports no serious or critical violations.

- [ ] **Step 7: Commit**

Run: `git add src/styles src/components src/lib tests/browser && git commit -m "feat: complete responsive accessible visual system"`

### Task 10: Add SEO, sitemap, tests, and GitHub Pages delivery

**Files:**
- Create: `public/robots.txt`, `src/pages/sitemap-index.xml.ts`, `.github/workflows/deploy.yml`, `docs/CONTENT_GUIDE.md`
- Modify: `astro.config.mjs`, `README.md`, `package.json`
- Test: `tests/render/seo.test.ts`, `tests/browser/a11y.spec.ts`

- [ ] **Step 1: Write failing SEO tests**

```ts
expect(pageHtml).toContain('<link rel="canonical"');
expect(pageHtml).toContain('SC Suspended');
expect(unavailableProductJsonLd).not.toContain('Offer');
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/render/seo.test.ts`

Expected: FAIL until SEO and schema branches are implemented.

- [ ] **Step 3: Implement static sitemap and robots rules**

```txt
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://www.studiocucurbits.com/sitemap-index.xml
```

Use `getStaticPaths()` and the same visible product/collection data filters as the route templates when producing sitemap entries.

- [ ] **Step 4: Add organization and conditional product structured data**

```ts
const productSchema = product.status === 'available' && product.publicPrice ? { '@context': 'https://schema.org', '@type': 'Product', name: product.name } : null;
```

- [ ] **Step 5: Add the GitHub Pages workflow**

```yml
name: Deploy to GitHub Pages
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v4
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 6: Write `docs/CONTENT_GUIDE.md` with exact edit locations**

Document product creation in `src/data/products.ts`, release state changes, media folders, video fields, audio demos, price/intro dates, checkout URLs, translations, visibility, manuals, and compatibility data.

- [ ] **Step 7: Run the full verification suite**

Run: `npm run check && npm test && npx playwright test && npm run build`

Expected: all commands exit 0; `dist/` contains every public route, `sitemap-index.xml`, `robots.txt`, and `CNAME`.

- [ ] **Step 8: Commit**

Run: `git add .github public src docs README.md package.json package-lock.json tests && git commit -m "feat: add production SEO and deployment workflow"`

### Task 11: Perform release verification and prepare the handoff

**Files:**
- Create: `docs/VERIFICATION.md`
- Modify: `README.md`

- [ ] **Step 1: Run the production preview**

Run: `npm run build && npm run preview -- --host 127.0.0.1`

Expected: production files serve locally without runtime errors.

- [ ] **Step 2: Capture required screenshots**

Capture desktop homepage, mobile homepage, Traces, Tendril, SC Suspended, and SC Vitreous from the production preview at the documented viewport widths. Store only review artifacts outside the site source tree.

- [ ] **Step 3: Run Lighthouse and record results accurately**

Run: `npx lighthouse http://127.0.0.1:4321 --only-categories=performance,accessibility,seo --output=json --output-path=./lighthouse.json`

Expected: a JSON report; document actual scores and any unmet target without altering them.

- [ ] **Step 4: Write `docs/VERIFICATION.md`**

Record exact commands/results, route list, current public statuses, checkout-disabled behavior, supplied/absent media, Lighthouse scores, final-video instructions, Lemon Squeezy activation instructions, intro-sale status-change instructions, and known limitations.

- [ ] **Step 5: Commit**

Run: `git add docs README.md && git commit -m "docs: add production verification handoff"`

## Plan self-review

- Spec coverage: Tasks 1–11 cover the Astro foundation, parent-brand hierarchy, data-driven routes/statuses, collections, media, newsletter, commerce preparation, localization, accessibility, SEO, deployment, documentation, and verification.
- Intentional scope: newsletter transport remains provider-configured, checkout remains inactive without URLs, product compatibility/media remain unpublished until supplied, and legal content stays explicitly draft.
- Consistency: all product templates consume `Product`, `getProductCta`, and `getDisplayPrice`; all public product routes derive from non-hidden data records.
