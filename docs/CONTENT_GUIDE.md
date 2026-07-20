# Content guide

The published catalogue is defined in `src/data/products.ts`. Edit that file before changing a product or collection page.

## Publishing and visibility

- Set a product `status` to `hidden` to remove it from catalogue pages, generated routes, sitemap, and SEO schema. Other statuses remain public; use `discontinued` only for a public historical page with no CTA.
- A collection is public only when its `status` is not `archived` and `editorial.en.shortDescription` is supplied. Keep its `productSlugs` and `includedCollectionSlugs` accurate.
- Update `slug`, `name`, `collection`, `productType`, `announcementDate`, and `releaseDate` before publishing. Never rename a published slug without arranging redirects at the host.

## Product content

- Write the English and Japanese `editorial.shortDescription`, `description`, and `features`; Japanese falls back to English only when its short description is blank.
- Add `media.heroImage`, `gallery`, `video` status/poster/files/captions, and `audioExamples` only after the referenced public assets exist under `public/`.
- Set `demoUrl`, `applicationUrl`, `downloadUrl`, `manualUrl`, `license`, `support`, `supportedFormats`, `supportedPlatforms`, and `compatibilityNotes` only with confirmed facts.

## Price and checkout

- Set `publicPrice` only when the regular price is approved for publication. Supply both required currency amounts (`regularPriceJPY` / `regularPriceUSD`) and the corresponding non-empty checkout URLs.
- For an introductory sale, use `status: 'intro-sale'`, the intro prices, and an ISO `introSaleEndDate`; verify the regular price is also configured for after the sale.
- Product and Offer structured data is emitted only for `available` products with a public positive USD price and a USD checkout URL. Do not add reviews, ratings, or availability claims unless factual.

## SEO and locales

- Set the optional `seo.title`, `seo.description`, `seo.image`, and `seo.keywords` only when they improve on the generated product/collection metadata. Keep titles and descriptions specific to the page.
- English and Japanese static pages live in `src/pages/` and `src/pages/ja/`. Keep both locale versions current, including support, downloads, license, privacy, terms, beta, press, newsletter, and coming-soon pages.
- `public/CNAME` is the canonical domain source. Do not remove it; `robots.txt` and the generated sitemap use `https://www.studiocucurbits.com`.
