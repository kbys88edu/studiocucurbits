# Release verification

## OP191 close-out / API binding — 27 September 2026

- Owner instructed completion of executable integration work and transfer of
  genuinely blocked acceptance to follow-up #198. #197 confirms no remaining
  blocker for the accepted production online/offline/reconciliation API; its
  email recovery and installer work are separate.
- Exact production API and website-origin CORS verified (health200, OPTIONS204).
  Website build now binds all four EN/JA recovery/offline pages to that API;
  exact data-base/CSP and continued absence of Buy actions/checkout verified.
- A fresh run with the production variable exposed an environment-dependent
  test: the unconfigured-API test inherited deployment configuration. Its fixture
  now explicitly clears that variable. Full verify91pass/4existing skips,
  50pages,0errors/warnings/2existing hints; licensing browser5/5. Production
  output rebuilt after fixture browser tests. No policy/source-mirror change.
- Deploy with LICENSING_API_BASE set to the accepted production endpoint; CI
  checkout remains disabled. No backend PortalBaseUrl, IAM, grant/code or
  fixture change. Browser form availability is not email-delivery acceptance.
- Fresh ordinary SCProduction checks deny ses:GetAccount and
  ses:GetEmailIdentity for test@fnab.xyz. Do not bypass that boundary. Inbox/link
  confirmation, coordinated mail-link switch, approved live payment/refund and
  public-download verification remain explicitly in #198/#197/#196. No claim
  of full-release readiness or real production purchase acceptance is made.

## OP191 approved publication — 27 September 2026

- Frederik Bous approved deployment after reviewing the local website and the
  product-specific purchase route. Policies are effective 27 September 2026;
  the five bilingual SC-Docs mirrors match source SHA-256
  `a0a9e20a3649a771bb3901b7479a654009c55ddc82774ee5e6a009a1a08da0c8`.
- Fresh publication gate: `npm run verify` passed (91 tests, 4 existing skips,
  50 pages, 0 errors/warnings, 2 existing generated-sandbox hints), checkout
  browser 5/5 and licensing browser 5/5. Rebuilt production after fixture tests.
- Direct inspection of both product/purchase locales confirms no Buy button,
  checkout configuration or Paddle CDN. All ten policy pages show the effective
  date. CI still pins checkout to `disabled`; the catalogue stays pre-release.
- `LICENSING_API_BASE` is unset: published recovery/offline pages remain
  support-only pending #197 acceptance. No backend, API variable, installer
  promotion, payment or sales activation is part of this deployment.
- Publication uses the existing main-branch GitHub Pages workflow. Deployment
  result and live checks are recorded in #191 after that workflow finishes.

## OP191 inline branding and live signing — 27 September 2026

- Supersedes the overlay implementation below. The owner confirmed that the
  overlay renders in an ordinary browser, but its branding was missing. The
  purchase routes now reuse the website logo, Inter Tight typography and grey
  paper palette around Paddle's inline payment form. The product buttons link to
  the matching EN/JA purchase page; quantity remains one and success still points
  to `https://www.studiocucurbits.com/downloads/suspended/`.
- Only provider-calculated currency and totals are read for the on-page summary;
  Paddle.js amounts use major units, including zero-decimal JPY. Customer/payment
  data is neither retained nor logged. Failed loads, malformed totals and a
  stalled frame clear the quote and expose a localized retry. Existing release
  gates also protect direct purchase-page visits with a configured live token.
- TDD: the new browser test failed against the old overlay because Buy did not
  navigate to the purchase page; after implementation the checkout suite passed
  5/5. Coverage includes localized totals, product redirect settings, SDK failure
  and retry, no JavaScript, stalled frames, invalid totals, EN/JA accessibility
  and 320px layout. The external SDK is replaced in these tests; its payment form
  and payment completion are not covered by that result.
- Full `npm run verify`: 91 passed / 4 existing skips, 22 test files, 50 pages,
  0 errors/warnings and 2 existing generated-sandbox hints. Independent review
  found no critical or important issue. Licensing browser regressions passed 5/5;
  all five bilingual SC-Docs mirrors remain exact. No dependency added.
- Real inline preview now renders Paddle's sandbox payment form in the in-app
  browser, including its test-mode banner and matching provider-calculated USD
  29.00 total. The owner reviewed the preview; no payment was attempted. Payment
  and redirect acceptance remain required. At the owner's request, checkout now
  uses `/purchase/suspended/` and `/ja/purchase/suspended/`; the same release gate
  still withholds the checkout and Buy buttons from production. Sandbox preview:
  `http://localhost:49401/purchase/suspended/`.
- Production signing proof at `2026-09-27T11:12:05.004Z`: the live Paddle
  destination's secret signed an invalid `{}` envelope. Production returned 400;
  the bad-signature control returned 401. Signature verification precedes envelope
  decoding, so these probes cannot enqueue work or create receipts, grants or
  email. No credential value was exposed, and no AWS permission changed.
  This is key/path verification, not real Paddle notification delivery.
- Live notification, purchase/refund, published installer and policy acceptance
  remain open. No website publication, real payment or sales activation occurred.

## OP191 publication hand-off — 27 September 2026

- The owner approved proceeding with the standard Paddle.js overlay. Replaced hosted-link configuration with environment-matched public client-side tokens and fixed Suspended price IDs. The official CDN loads on click; one-page checkout receives quantity one and the exact `/downloads/suspended/` success URL. The browser does not grant licences or persist payment/customer events.
- Fresh `npm run verify`: 91 passed / 4 existing skips in 22 files, 50 production pages, 0 errors/warnings and 2 existing generated-sandbox hints. Focused unit/render checks cover matching tokens and modes, disabled production catalogue and labelled sandbox previews excluded from offers in SEO.
- `npm run test:checkout`: 4/4 browser checks pass with only the external SDK replaced, covering open/close/reuse, Japanese error and retry, no-JavaScript guidance, and a stalled iframe. The latter failed before the 15-second opening timeout fix and passed afterwards. Independent review found no remaining blocking code issue. `npm run test:licensing`: 5/5 regressions pass.
- Real sandbox check: reused an existing public client token, loaded the official SDK and attempted checkout from both loopback and localhost. Paddle created an empty iframe and emitted no loaded/error event; no console warning/error explained it. The timeout closed the stalled frame, restored the button and focus, and showed the retry message. Actual overlay rendering, payment and redirect remain unverified; mocked browser tests are not provider acceptance. No payment or provider configuration change was made.
- Follow-up isolation: a minimal standalone HTML example with the synchronously loaded official SDK and default checkout settings reproduces the same empty `about:blank` frame. A static iframe pointing to Paddle's public checkout document, without any token or SDK, is also empty in the in-app browser. A direct HTTP read returns 200 and the expected Paddle bootstrap HTML; its frame-ancestor policy is report-only. This narrows the failure to the embedded-browser/navigation boundary, not the storefront controller, but does not prove it works in an ordinary browser. Ordinary-browser sandbox acceptance remains required. Diagnostic fixtures are temporary local files, not website changes.
- Fresh Paddle API reads verify both fixed prices are active, USD 2900 minor units, one-time, and minimum/maximum quantity 1. Production CI remains explicitly disabled. No new client token was created.
- Combined source `d3030b0` built privately with the actual production `LICENSING_API_BASE` at 10:43 UTC: 50 pages. All four EN/JA recovery/offline routes contain the exact production API and origin-only CSP, no fixture/staging API or Paddle CDN, and initially disabled fieldsets. Both product locales still omit active checkout configuration. Output is `/tmp/op191-production-binding.EP1lls`, not deployment `dist/`; no CI variable, publication or backend setting changed. This verifies build bindings, not customer recovery or payment acceptance.
- All five SC-Docs legal mirrors match both locales and source SHA-256 `705fa7213b3a2da40e344db8efe7a427771c890bac5261a2fc0e1092b621e40f`. No policy wording changed in this check. Website and SC-Docs `git diff --check` passed.
- Read-only live Paddle domain lookup returned `studiocucurbits.com` as approved and Apple Pay verified. This is domain approval, not hosted-checkout eligibility or end-to-end payment acceptance.
- The [standard overlay](https://developer.paddle.com/build/checkout/build-overlay-checkout/) avoids the separate hosted-checkout eligibility gate. Paddle documents branding, but the available sandbox dashboard exposes only brand colour and no logo upload control; an actual in-overlay logo is not configured or verified.

### Remaining publication order

1. Finish real-provider sandbox overlay verification and branding. The standard overlay choice and local implementation are complete. Keep one USD-base Suspended price, quantity one, and success redirect `https://www.studiocucurbits.com/downloads/suspended/`. Browser success never grants a licence; verified backend notifications do.
2. Obtain approval of the draft commercial policies and confirm published contact routes/seller details through `SC-Docs/legal/README.md`. Record approval and effective date; remove draft labels only with that approval. Publish website wording and matching SC-Docs together before live fulfilment acceptance. Existing introductory-offer strategy is not a configured discount or permission to create a second currency price.
3. #197 reports production CREATE_COMPLETE and health checks passing at `https://ycptr4aza4.execute-api.ap-northeast-1.amazonaws.com/production`. The owner then supplied successful atomic CONFIG/SIGNING bootstrap verification; remaining AWS acceptance stays with #197. No customer/payment/webhook/email operation occurred during bootstrap. Follow `docs/LICENSING.md` for publication/portal-switch order; unrestricted customer email remains gated on SES access. The webhook container was restored but remains empty, pending the genuine live destination secret.
4. #195/#196 supply approved installers so the product download route exists. Do not publish a checkout whose success target is unavailable.
5. Configure the selected live checkout and branding, populate the live webhook signing secret and verify its four event subscriptions. Rebuild and check the exact production output, both languages, policy parity, recovery/offline flows and absence of sandbox values. Obtain human publication and controlled-real-purchase approval.
6. Run the controlled purchase, setup/download/activation, replay/repair and full-refund revocation acceptance; retain redacted evidence. Broad sales enablement remains a separate final gate, not an implication of passing local tests.

## OP197 licensing integration into OP191 — 27 September 2026

- Applied website commit `7e12f00` additively to `codex/op191-storefront`, preserving the uncommitted checkout and policy changes. Shared configuration/routes merged without conflicts; new files match the source commit.
- Combined `npm run verify`: 22 test files, 91 passed / 4 existing skips; 50 production pages. Astro reported 0 errors, 0 warnings and 2 unused-variable hints in the existing generated `dist-sandbox` analytics bundle.
- `npm run test:licensing`: all 5 browser checks passed using synthetic API responses, including confirmation, replacement retry, memory clearing, frame refusal, download and accessibility.
- Rebuilt production output after the fixture browser build and checked that it contains no fixture API, working licence forms or sandbox checkout. All five bilingual policy mirrors remain exact; `git diff --check` passed.
- Local integration only: no commit, push, publication, API setting change or live-sales activation. Backend `020512f` remains under #197; website/API cutover follows `docs/LICENSING.md`.

## OP191 storefront preparation — 27 September 2026

- Branch `codex/op191-storefront`, based on merged download-page commit `9e31e72`.
- `npm run verify`: 0 errors/warnings/hints; 21 test files, 89 passed and 4 existing skips; production build generated 46 pages.
- Render regression checks production with sandbox and live inputs (both remain closed), then a labelled sandbox build in an isolated temporary directory. Sandbox offers are excluded from SEO.
- `npm run build:sandbox` generated a separate `dist-sandbox/`; production `dist/` contains no sandbox checkout URL.
- Browser preview: English product page opens native Paddle sandbox checkout for Suspended, quantity 1, USD 29. No payment submitted in this storefront check. Japanese purchase guidance inspected at 390px, with no horizontal overflow.
- Five EN/JA policy mirrors in SC-Docs match legal source SHA-256 `705fa7213b3a2da40e344db8efe7a427771c890bac5261a2fc0e1092b621e40f`. Revision 2026-09-27 remains Draft, not an effective publication date.
- Independent source review completed; test-output isolation and retained-email wording findings corrected and re-reviewed.
- No push, deployment or live-sales activation. Live hosted checkout eligibility requires Paddle approval; final policy approval, production fulfilment/recovery acceptance and approved installers remain launch gates.
- Follow-up: Paddle sandbox hosted checkout's success redirect saved and read back as `https://www.studiocucurbits.com/downloads/suspended/`. No new payment was submitted to retest the redirect; the product download route still awaits approved installer publication. Current hosted-checkout/account settings expose no company-logo field; logo-capable overlay or site-owned inline checkout remains a separate integration choice.

Earlier verification records follow.

Verified on 2026-08-19 from the `feat/audio-instruments-site` worktree.

## SC Suspended pre-release overhaul

- `npm.cmd run check` — passed (0 errors, 0 warnings, 0 hints)
- `npm.cmd test -- --hookTimeout=60000` — passed (15 files, 52 tests)
- `npm.cmd run build` — passed (34 pages)
- `npm.cmd run test:browser` — passed (14 tests)
- Responsive/accessibility coverage includes 360px, 390px, 768px, 1024px, 1440px, and 1920px home layouts plus 360px/1440px SC Suspended layouts.
- The approved regenerated product hero and Suspended interface mockup are served; optional audio/video sections are omitted until their source files are supplied.

## Commands and results

The standard local gate is:

```powershell
npm.cmd ci
npm.cmd run verify
$env:CI = '1'; npm.cmd run test:browser
```

For this verification, Windows kept `node_modules/@rollup/rollup-win32-x64-msvc/rollup.win32-x64-msvc.node` locked in the worktree, so `npm.cmd ci` could not unlink it. A clean, same-lockfile copy at `C:\tmp\studio-cucurbits-release-verification` was used instead. No source changes were made in that copy.

Results in that isolated copy:

- `npm.cmd run verify` passed: `astro check` reported 0 errors, 0 warnings, and 0 hints; Vitest passed 14 files / 45 tests; `astro build` generated 36 static pages.
- `$env:CI = '1'; npm.cmd run test:browser` passed: 11 Playwright browser and accessibility tests.
- The browser test was run with `CI=1` to avoid reusing a stale development server on port 49283. The stale server was stopped before the clean retry.

## Production-preview review

The generated `dist/` was served with:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4322
```

The following paths returned HTTP 200 from that production preview:

- `/`
- `/collections/traces/`
- `/collections/tendril/`
- `/products/suspended/`
- `/products/vitreous/`
- `/sitemap-index.xml`
- `/robots.txt`

Review captures were generated from that preview and deliberately stored outside the site source tree at `C:\tmp\studio-cucurbits-validation-artifacts`:

- `home-desktop.png` (1440 px)
- `home-mobile.png` (390 px)
- `collection-traces.png`
- `collection-tendril.png`
- `product-sc-suspended.png`
- `product-sc-vitreous.png`

## Public state at verification time

- Studio Cucurbits remains the parent studio. Audio Instruments is presented as one studio area, not the site-wide identity.
- SC Suspended is `coming-soon`; SC Vitreous is an `announcement`; Traces and Tendril are `forthcoming` collections.
- Neither currently public product has `publicPrice` enabled or a checkout URL. The resulting product CTA is the internal newsletter notification route, not a purchase flow.
- SC Suspended has approved hero/interface images. No final audio or video sources are public, so those optional sections remain omitted; no fictional media, compatibility, reviews, or availability claims are emitted.
- Newsletter delivery is the hard-coded MailerLite embed in `src/components/NewsletterForm.astro`; it posts directly to MailerLite and needs no build-time configuration. The generic endpoint-driven module in `src/scripts/newsletter.ts` is retained and unit-tested but is not wired to the live form, so `NEWSLETTER_API_ENDPOINT` and `NEWSLETTER_FORM_ACTION` are not read today.

## Deployment and discovery checks

- `public/CNAME` was included in `dist/` with `www.studiocucurbits.com`.
- `robots.txt` allows crawling and points at `https://www.studiocucurbits.com/sitemap-index.xml`.
- `sitemap-index.xml` uses the canonical custom domain and includes only the public static routes.
- `.github/workflows/deploy.yml` runs `npm ci`, check, unit tests, and static build before uploading `dist/` to GitHub Pages on `main`.

## Lighthouse

No Lighthouse score is recorded. The `lighthouse` command is not installed in this environment, and no performance result was fabricated. Run Lighthouse against the deployed HTTPS custom domain after GitHub Pages is enabled and production media is supplied.

## Before publishing new content

Follow [CONTENT_GUIDE.md](CONTENT_GUIDE.md) when changing visibility, price, checkout URLs, media, compatibility, or translations. In particular, publish checkout URLs and public prices together only after they are approved and verified.
