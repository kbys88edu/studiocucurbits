# Pages (dependency trees)

## /products/suspended/ (and /ja/products/suspended/) — shop product page
Entry: `src/pages/products/[slug].astro` → renders `ProductLaunch` when `product.launch` exists (Suspended does).
- src/layouts/BaseLayout.astro
  - src/components/Seo.astro
  - src/components/Header.astro
    - src/components/LanguageSwitch.astro
  - src/components/Footer.astro
- src/components/ProductLaunch.astro  (hero copy, offers table with BUY pills, download button, system-requirements table, box-art image, interface figure, optional video/audio, description, support link)
  - src/data/shopCatalogue.ts (catalogue export: summary/description/media/offers/release)
  - src/data/products.ts (launch.hero tagline/description, suspendedCheckout)
  - src/lib/downloads.ts (detectPlatform)
- src/components/RelatedProducts.astro
  - src/components/ProductCard.astro
- src/styles/global.css

## /products/ — shop index
Entry: `src/pages/products/index.astro`
- src/layouts/BaseLayout.astro (as above)
- src/components/ProductCard.astro
  - src/components/StatusLabel.astro
- src/data/products.ts

## /purchase/suspended/ — checkout
Entry: `src/pages/purchase/suspended.astro` → `PurchaseGuide.astro` → `PaddleCheckout.astro`
