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

Suspended uses the Paddle.js inline checkout, loaded only on a purchase click.
Configure a public client-side token, never a server API key. The environment,
build mode and token must match; the catalogue and CI sales gates remain separate.
The success URL opens same-language `/setup/` in the buyer's tab; the setup
email is a backup. A browser redirect is not proof of payment: the licensing
service waits for verified backend fulfilment before offering code generation.

- Set `publicPrice` only when the regular price is approved for publication. Use one USD base price and one checkout for both languages; Paddle handles customer-currency presentation and tax. Do not create a separately priced Japanese checkout.
- Suspended's launch page uses its `release` configuration. Keep `releaseState`, `showPrice`, `showBuyButton`, the USD price and the generic catalogue status/price consistent when approving a release. The sandbox preview is not a product release.
- For an approved introductory sale, use `status: 'intro-sale'`, the USD intro price, and an ISO `introSaleEndDate`; verify the regular price is also configured for after the sale. No introductory offer is currently approved for Suspended.
- Product and Offer structured data is emitted only for `available` products with a public positive USD price and a USD checkout URL. Do not add reviews, ratings, or availability claims unless factual.

## SEO and locales

- Set the optional `seo.title`, `seo.description`, `seo.image`, and `seo.keywords` only when they improve on the generated product/collection metadata. Keep titles and descriptions specific to the page.
- English and Japanese static pages live in `src/pages/` and `src/pages/ja/`. Keep both locale versions current, including support, downloads, license, privacy, terms, beta, press, newsletter, and coming-soon pages.
- `public/CNAME` is the canonical domain source. Do not remove it; `robots.txt` and the generated sitemap use `https://www.studiocucurbits.com`.
