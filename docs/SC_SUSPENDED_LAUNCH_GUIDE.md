# SC Suspended release guide

SC Suspended is a pre-release VST3 product with current alpha compatibility claims for Windows, macOS, and Linux. The public page is data-driven: update `src/data/products.ts` and provide verified assets under `public/`; do not edit the page component for a normal state change.

## Current public state

The `launch.release` object currently has:

```ts
{
  releaseState: 'pre-release',
  showPrice: false,
  showBuyButton: false,
  showNewsletterCTA: true,
  audioDemosEnabled: true,
  videoEnabled: true,
}
```

The product record remains `status: 'coming-soon'`, `publicPrice: false`, and `releaseDate: null`. The regenerated hero and interface mockup are public; no checkout URL, demo URL, manual URL, audio source, or ready video is public. The page displays `PRE-RELEASE` as its single public status. Traces and Tendril remain unpublished.

## Release-state changes

Change the `launch.release` object only after the release decision is approved:

- `releaseState`: `development`, `closed-alpha`, `pre-release`, or `released`.
- `version`: public version string or `null`.
- `releaseDate`: ISO date (`YYYY-MM-DD`) or `null`.
- `showPrice`: exposes configured intro/regular pricing only when true.
- `showBuyButton`: exposes a purchase link only when true and the selected checkout URL is valid HTTPS.
- `showNewsletterCTA`: controls the release notification form.
- `introPrice` / `regularPrice`: internal JPY/USD values (`¥2,900` / `¥4,400`, `$19` / `$29`).
- `checkoutUrl`: read from `STRIPE_SUSPENDED_PAYMENT_LINK_JPY` and `STRIPE_SUSPENDED_PAYMENT_LINK_USD`; never commit secrets or URLs that are not ready.
- `audioDemosEnabled` / `videoEnabled`: gates optional media sections without publishing missing-media copy.

When releasing, update the product `status`, verified compatibility, public pricing, release date, and checkout URLs together. Run the complete verification suite before pushing `main`.

## Optional media

Use the checklist and exact paths in [suspended-release-assets.md](suspended-release-assets.md). Audio comparisons require both dry and suspended files for a demo. Video requires a ready MP4/WebM or an approved poster. Missing files render no public media section; never add fake sources or text such as “in production”, “placeholder”, or “coming soon”.

## Newsletter attribution

The SC Suspended MailerLite form includes the following attribution field:

```text
source=suspended_product_page
```

The form keeps the existing MailerLite endpoint and success callback. Keep the source value stable so release-interest attribution remains available without sending product-specific data beyond the hidden source field.

## Analytics

The existing Plausible adapter allowlists these Suspended events:

```text
suspended_page_view
suspended_demo_play
suspended_demo_complete
suspended_video_play
suspended_notify_click
suspended_notify_success
suspended_support_click
suspended_buy_click
```

Permitted properties are limited to `locale`, `demo_name`, `source`, and `release_state`. Do not send email addresses, message text, or other form values. A buy event is emitted only when a buy control is actually rendered.

## Compatibility and support

Publish only values verified in the current build. The current public claims are VST3, stereo processing, live audio capture, and Windows/macOS/Linux alpha builds. Do not add OS versions, DAW names, installation paths, or known issues without matching support guidance in `src/data/products.ts` and `/support/suspended/`.

## SEO and schema

The product record supplies the concept-led title, description, and mockup image. `BaseLayout`/`Seo` retain canonical, EN/JA alternate links, Open Graph metadata, breadcrumbs, and guarded Product Offer schema. Offer schema remains absent until public price, released status, positive price, and valid HTTPS checkout are all present.

## Publishing checklist

1. Confirm the release decision, version, date, compatibility, and support text.
2. Add and optimize approved audio/video/UI assets using the asset checklist.
3. Set release flags and checkout environment variables together when purchase is approved.
4. Run `npm.cmd run check`, `npm.cmd test -- --hookTimeout=60000`, `npm.cmd run build`, and `npm.cmd run test:browser`.
5. Inspect EN/JA pages at 360, 390, 768, 1024, 1440, and 1920px.
6. Push the verified commit to `main` and confirm the GitHub Pages workflow succeeds.
