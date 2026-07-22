# SC Suspended launch guide

SC Suspended is configured as a `coming-soon` Windows VST3 Beta product. Public copy and state live in `src/data/products.ts`; the page components should not be edited for a normal release update.

## Current state

The current record has `status: 'coming-soon'`, `publicPrice: false`, `releaseDate: null`, no demo or manual URL, no audio examples, and an in-production video with no source. The notification CTA is the only action shown. Traces and Tendril remain unpublished.

## Set the release date

Set `releaseDate` on the SC Suspended record to an ISO date (`YYYY-MM-DD`). Keep the status as `coming-soon` until the product is actually ready. A date alone does not expose a purchase link or price.

## Show the introductory price

Set the four configured price fields already present on the record, set `publicPrice: true`, set `introSaleEndDate` to the end of the 14-day introductory period, and change `status` to `intro-sale`. The existing price and CTA helpers will show the configured currency and use the matching Stripe URL only when it is valid HTTPS.

## Return to the regular price

After the introductory period, change `status` to `available` and keep `publicPrice: true`. Set `introSaleEndDate` to the completed sale date or clear it. The regular JPY/USD values remain the source for the displayed price.

## Add Stripe checkout

Set these environment variables in the deployment environment, never in committed source:

```text
STRIPE_SUSPENDED_PAYMENT_LINK_JPY=https://checkout.stripe.com/...
STRIPE_SUSPENDED_PAYMENT_LINK_USD=https://checkout.stripe.com/...
```

The page does not show a Buy link while the product is coming soon or while the relevant URL is missing. The checkout URL must be HTTPS.

## Add a Demo or Manual

Set `SUSPENDED_DEMO_URL` or `SUSPENDED_MANUAL_URL` in the deployment environment. The values are read into the product record and remain absent from the page until the corresponding component is intentionally enabled for the released state. Never use an empty link as a placeholder.

## Add video

Place the approved poster and final video files under `public/`, then set `media.video.poster`, `media.video.mp4` or `media.video.webm`, and `media.video.status: 'ready'` in the product record. Keep `status: 'in-production'` and source fields null while the video is unfinished; the page will not render a broken play control.

## Add Dry / Wet audio

Add the approved source files under `public/audio/products/suspended/` and add their paths to `media.audioExamples`. Keep the list empty until files exist. The audio comparison component is designed to avoid autoplay and simultaneous playback; do not add fake sources.

## Verify compatibility

Only add verified values to `supportedPlatforms`, `supportedFormats`, and `compatibilityNotes`. Do not add a Windows version or DAW name until it has been tested and approved for publication.

## Remove the Beta label

When the public release is ready, set the product status to `available`, update the beta copy and acceptance lists in `launch`, and update the verified compatibility fields. Keep the public price and checkout conditions consistent with the release state.

## Product schema

`Product` Offer schema is enabled automatically only when the product is `available`, `publicPrice` is true, a positive regular USD price exists, and a valid HTTPS Stripe checkout URL exists. Do not add schema manually and do not expose `InStock` before those conditions are true.

## Publish Traces later

When the complete collection is approved, change the Traces collection from `archived` to a visible status, add its approved editorial copy and media, and add only the approved product routes. Run the full test and sitemap checks first. Do not publish the collection merely because SC Suspended is public.
