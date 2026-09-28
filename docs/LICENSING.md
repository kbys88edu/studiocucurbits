# Website licensing pages

`/setup/`, `/recovery/` and `/offline/` (also `/ja/…`) use the licensing API.
The legal `/license/` page is unchanged. No payment SDK or customer database
is added to this static site.

Set the GitHub repository variable `LICENSING_API_BASE` to the reviewed Tokyo
API Gateway endpoint **including `/production`** once the backend is deployed
and accepted. A missing/invalid setting leaves only support guidance. Staging
URLs are accepted only by `astro dev`; published builds reject them. Local
development still needs mocked API responses: live CORS does not allow localhost.
Never store an
activation code, API credential or recovery token in this setting.

Backend requirements: exact CORS origin `https://www.studiocucurbits.com`, POST,
Content-Type, no cookies; `PortalBaseUrl=https://www.studiocucurbits.com`.
Setup email links use `/setup/#token=…`; customer-requested recovery links use
`/recovery/#token=…`. Fragments avoid static-host request logs; both controllers
remove them and require explicit confirmation. The checkout keeps a random
32-byte proof in tab-local `sessionStorage` and passes only its SHA-256 digest
to Paddle. `/setup/` sends the transaction ID and proof to the service for a
bounded status check, then creates a code only after an explicit click. Its
routes are noindex and absent from the sitemap.
Changing language after opening a confirmation link discards it: reopen the
email link to confirm. Codes, challenges and responses are held only in memory
and cleared on page exit. No analytics/newsletter embeds belong on these pages.
The page CSP permits Astro's own inline navigation script but blocks external
scripts and connections except to the configured API. GitHub Pages cannot set
per-page response headers; the controller refuses to enable forms in a frame.
No sensitive values are in the cached static HTML.

## Client provenance

`src/scripts/licensing/offline.js` is an unchanged copy of `portal/offline.js`
from `studiocucurbits/activation-service` commit `4ed4a12`.
SHA-256: `16bd910651e377bcf3c1d72ba7c394f1cad80c1d1c77b5119bcdbe086d0a052b`.
It provides the existing bounded protocol parser, request handling and durable
seat-replacement retry rules. The page controller adapts the existing portal
forms to the site's two languages and layout.

ponytail: this pinned copy avoids a package/release dependency; update it from
the licensing service and rerun acceptance when that protocol client changes.

## Verification and cutover

`npm run check`, `npm test`, `npm run build`, and `npm run test:licensing`.
The dedicated browser suite uses a synthetic API and codes, checks explicit
confirmation, memory clearing, replacement retries and accessibility. It builds
the site with a fixture endpoint; rebuild with the real approved configuration
before publication. Do not publish its generated `dist` as production.

Publication and the backend parameter switch must be coordinated: publish the
EN/JA setup, recovery and offline pages with the accepted API configuration
first, then verify all six URLs. Deploy the reviewed setup API/IAM and switch
`PortalBaseUrl` before enabling the checkout redirect to `/setup/`; the
service must be able to send backup setup links to the published page. Keep
the existing API-hosted portal available for old emails and rollback. A
prepared implementation is not a live end-to-end delivery test or permission
to enable sales.
