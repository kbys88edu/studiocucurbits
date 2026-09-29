# OP#201 Suspended shop page and cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the owner-approved "catalogue sheet" Suspended product page and a single-item cart page (EN/JA, desktop/phone) this week.

**Architecture:** Astro static site. Product facts come from the catalogue export (`src/data/shopCatalogue.ts`); editorial hero copy stays in `src/data/products.ts`. We only change templates, CSS and copy; checkout/licensing scripts and data hooks are untouched.

**Tech Stack:** Astro 7, vanilla CSS (`src/styles/global.css`), Vitest render tests (build then read HTML), Playwright + axe browser tests.

**Spec:** `docs/superpowers/specs/2026-09-29-op201-suspended-shop-page-design.md`

## Global Constraints

- Run every test/build with `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201` (the repo is on the Dock volume; builds fail with EXDEV otherwise).
- Product name `SUSPENDED` / `Suspended`; never "SC Suspended"; no "Traces" on these pages.
- No `(01)`-style row numbering anywhere.
- The Buy band is the only black band on the product page; no large standalone price.
- Keep every `data-*` hook, error string, the `/setup/` success route and sales gating in `PaddleCheckout.astro` / `PurchaseGuide.astro`.
- Copy is exact as written in the spec (EN and JA). Oxford English.
- Do not push, deploy or touch Paddle. Commit locally on `claude/op201-shop`.

---

### Task 1: Product page as a catalogue sheet

**Files:**
- Modify: `src/components/ProductLaunch.astro` (template section only, lines after the closing `---`)
- Modify: `src/data/products.ts:261-262` (JA hero tagline and description)
- Modify: `src/styles/global.css:208-243` (shop rules) and the phone block near `:311-335`
- Modify: `tests/fixtures/site-preview.v1.json` (remove the Traces offer and its id from `products[suspended].offerIds`)
- Test: `tests/render/storefront.test.ts`

**Interfaces:**
- Consumes: `suspendedShopProduct`, `suspendedShopOffers` (`src/data/shopCatalogue.ts`), `suspendedCheckout` (`src/data/products.ts`), existing front-matter variables in `ProductLaunch.astro` (`installers`, `operatingSystems`, `formatLabel`, `price(offer)`, `downloadPage`, `purchasePage`, `supportPage`, `descriptionBlocks`, `boxArt`, `videos`, `audio`, `hero`, `ja`).
- Produces: CSS classes `.shop-sheet`, `.shop-row`, `.shop-row-label`, `.shop-buy-band`, `.shop-demo-link`, `.shop-box-inline`, `.shop-box-aside` used by Task 2.

- [ ] **Step 1: Update the render test to the new page**

In `tests/render/storefront.test.ts`, inside the `for (const locale of ['', 'ja/'])` loop, replace the product assertions from `expect(product).toContain(locale ? 'Suspended ライセンス' …` down to `expect(product).toContain('data-recommended-download');` with:

```ts
    expect(product).toContain(locale ? 'Suspended ライセンス' : 'Suspended licence');
    expect(product).not.toContain('PRIVATE PREVIEW');
    expect(product).not.toMatch(/SC Suspended|SC SUSPENDED|TRACES|Traces/);
    expect(product).not.toMatch(/\(0\d\)/);
    expect(product).toContain('/catalogue-media/suspended/box-art.png');
    expect(product).toContain('/catalogue-media/suspended/interface.png');
    expect(product).toContain('src="https://example.test/demo.mp4"');
    expect(product).toContain('src="https://example.test/sample.mp3"');
    expect(product).toContain(locale ? 'グラニュラー・エフェクト' : 'GRANULAR AUDIO EFFECT');
    expect(product).toContain(locale ? '一瞬をつかまえる。' : 'Capture a moment of sound and keep it moving from within.');
    expect(product).toContain(locale ? '買い切り（サブスクリプションなし）・パソコン3台まで' : 'One-time payment · up to 3 computers');
    expect(product).toContain(locale ? '購入する <span>$29</span>' : 'Buy licence <span>$29</span>');
    expect(product.match(/class="shop-buy-band/g)).toHaveLength(1);
    expect(product).not.toContain('download-primary');
    expect(product).toContain(locale ? '無料デモ版をダウンロード（macOS）' : 'Try the free demo — Download for macOS');
    expect(product).toContain(locale ? 'ライセンスを設定するまでは、数分おきに数秒間、音が途切れます。' : 'The demo mutes briefly every few minutes until a licence is activated.');
    expect(product).toContain(locale ? 'ほかのOS・過去のバージョン' : 'All installers and versions');
    expect(product).toContain(locale ? '動作環境' : 'SYSTEM REQUIREMENTS');
    expect(product).toContain('macOS, Linux');
    expect(product).toContain(locale ? 'VST3, AU（macOSのみ）' : 'VST3, AU (macOS only)');
    expect(product).toContain(locale ? 'インストールとサポート' : 'Setup and support');
    expect(product).toContain('data-recommended-download');
```

Remove the now-obsolete lines that expect `Traces バンドル`/`Traces bundle`, `$99`, `BUY <span>$29</span>`, `BUY <span>$99</span>`, `システム要件`, and `<thead>`.

- [ ] **Step 2: Run the test to see it fail**

Run: `cd /Volumes/Dock/GitHub/studiocucurbits-op201 && TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render/storefront.test.ts`
Expected: FAIL (e.g. missing `GRANULAR AUDIO EFFECT` / found `TRACES`).

- [ ] **Step 3: Remove the Traces offer from the fixture**

In `tests/fixtures/site-preview.v1.json`: delete the offer object whose `id` is the Traces bundle, and remove that id from the `offerIds` array of the `suspended` product. Keep the `suspended` offer (USD 2900, `pri_01m3eaewadnm7grc2armnnkbsr`).

- [ ] **Step 4: Update the JA hero copy**

In `src/data/products.ts`, the `ja` hero block:

```ts
          tagline: '宙に留まる音。\n内側で動き続ける響き。',
          description: '一瞬をつかまえる。',
```

- [ ] **Step 5: Replace the product template**

In `src/components/ProductLaunch.astro`, keep the front matter and the `<script>` block unchanged; replace everything from `<section class="suspended-launch"` up to (not including) `<script>` with:

```astro
<section class="suspended-launch" data-suspended-product data-installers={JSON.stringify(installers)} aria-labelledby="product-title">
  <div class="suspended-hero">
    <div class="suspended-hero-copy">
      <p class="eyebrow">↘&#xFE0E;&nbsp;{ja ? 'グラニュラー・エフェクト' : 'GRANULAR AUDIO EFFECT'}</p>
      <h1 id="product-title">SUSPENDED</h1>
      <p class="launch-tagline">{hero.tagline}</p>
      <p class="lead">{hero.description}</p>
      {boxArt && <img class="shop-box-inline" src={boxArt} alt={ja ? 'Suspendedのパッケージ画像' : 'Suspended package artwork'} width="1200" height="1500" loading="eager" decoding="async" />}

      <div class="shop-sheet">
        {suspendedShopOffers.length > 0 && <section class="shop-row" aria-labelledby="shop-licence-title">
          <h2 id="shop-licence-title" class="shop-row-label">{ja ? 'ライセンス' : 'LICENCE'}</h2>
          <div>{suspendedShopOffers.map((offer) => <div class="shop-offer">
            <p class="shop-offer-name">{offer.name[locale]}</p>
            <p class="shop-offer-terms">{ja ? '買い切り（サブスクリプションなし）・パソコン3台まで' : 'One-time payment · up to 3 computers'}</p>
            {suspendedCheckout.url && offer.paddlePriceId === suspendedCheckout.priceId
              ? <a class="shop-buy-band" href={purchasePage}>{ja ? '購入する' : 'Buy licence'} <span>{price(offer)}</span></a>
              : <span class="shop-buy-band shop-buy-disabled" aria-disabled="true">{ja ? '購入する' : 'Buy licence'} <span>{price(offer)}</span></span>}
          </div>)}</div>
        </section>}

        <section class="shop-row" aria-labelledby="shop-download-title">
          <h2 id="shop-download-title" class="shop-row-label">{ja ? 'ダウンロード' : 'DOWNLOAD'}</h2>
          <div>
            <a class="shop-demo-link" data-recommended-download href={downloadPage}><img data-download-icon alt="" hidden /><span data-download-text>{ja ? 'インストーラーを選ぶ' : 'Choose an installer'}</span> ↓</a>
            <p class="shop-note">{ja ? 'ライセンスを設定するまでは、数分おきに数秒間、音が途切れます。' : 'The demo mutes briefly every few minutes until a licence is activated.'}</p>
            <a class="shop-download-all" href={downloadPage}>{ja ? 'ほかのOS・過去のバージョン' : 'All installers and versions'} →</a>
          </div>
        </section>

        <section class="shop-row shop-requirements" aria-labelledby="shop-requirements-title">
          <h2 id="shop-requirements-title" class="shop-row-label">{ja ? '動作環境' : 'SYSTEM REQUIREMENTS'}</h2>
          <div>
            <table><tbody>
              <tr><th scope="row">{ja ? '対応OS' : 'Operating system'}</th><td>{operatingSystems.join(', ')}</td></tr>
              <tr><th scope="row">{ja ? 'プラグイン形式' : 'Plug-in format'}</th><td>{formatLabel}</td></tr>
              {shopProduct.release?.testedRequirements.map((claim) => <tr><th scope="row">{ja ? '動作確認' : 'Tested compatibility'}</th><td>{claim[locale]}</td></tr>)}
            </tbody></table>
            {!shopProduct.release && <p class="shop-note">{staging.length
              ? (ja ? 'Linuxの対応ディストリビューションと、動作を確認したDAWは現在確認中です。' : 'Linux distribution compatibility and tested hosts are still being verified.')
              : (ja ? 'OSの最低バージョンと動作を確認したDAWは、正式リリース前に掲載します。' : 'Minimum OS versions and tested hosts will be listed before public release.')}</p>}
          </div>
        </section>

        <section class="shop-row shop-description" aria-labelledby="shop-about-title">
          <h2 id="shop-about-title" class="shop-row-label">{ja ? '製品について' : 'ABOUT'}</h2>
          <div>{descriptionBlocks.map((block) => block.heading ? <h3>{block.text}</h3> : <p>{block.text}</p>)}</div>
        </section>

        <section class="shop-row" aria-labelledby="shop-support-title">
          <h2 id="shop-support-title" class="shop-row-label">{ja ? 'サポート' : 'SUPPORT'}</h2>
          <p><a href={supportPage}>{ja ? 'インストールとサポート' : 'Setup and support'} →</a></p>
        </section>
      </div>
    </div>
    {boxArt && <img class="product-hero-image suspended-hero-image shop-box-aside" src={boxArt} alt="" width="1200" height="1500" loading="eager" decoding="async" />}
  </div>

  {shopProduct.media.interface && <figure class="shop-interface">
    <img src={shopProduct.media.interface} alt={ja ? 'Suspendedのプラグイン画面' : 'Suspended plug-in interface'} width="720" height="644" loading="lazy" decoding="async" />
  </figure>}

  {videos.length > 0 && <section class="launch-section shop-demo" aria-label={ja ? '動画' : 'Videos'}>
    <p class="eyebrow">{ja ? '動画' : 'VIDEOS'}</p>
    <div class="shop-demo-grid">{videos.map((demo) => <figure>
      <video controls playsinline preload="none" src={demo.url} aria-label={demo.caption[locale] || demo.caption.en}></video>
      <figcaption>{demo.caption[locale] || demo.caption.en}</figcaption>
    </figure>)}</div>
  </section>}

  {audio.length > 0 && <section class="launch-section shop-demo" aria-label={ja ? 'サウンドサンプル' : 'Sound samples'}>
    <p class="eyebrow">{ja ? 'サウンドサンプル' : 'SOUND SAMPLES'}</p>
    <div class="shop-demo-grid">{audio.map((demo) => <figure>
      <figcaption>{demo.caption[locale] || demo.caption.en}</figcaption>
      <audio controls preload="none" src={demo.url} aria-label={demo.caption[locale] || demo.caption.en}></audio>
    </figure>)}</div>
  </section>}
</section>
```

In the unchanged `<script>`, the label text is built at runtime; change its two strings to the new copy:

```ts
      label.textContent = document.documentElement.lang === 'ja'
        ? `無料デモ版をダウンロード（${platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}）`
        : `Try the free demo — Download for ${platform === 'macos' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}`;
```

Note: the render test builds without a matching installer, so the static label is `Choose an installer`; the test strings `無料デモ版をダウンロード（macOS）` / `Try the free demo — Download for macOS` are therefore found in the inline script source. That is intended: it proves the runtime label copy.

- [ ] **Step 6: Replace the shop CSS**

In `src/styles/global.css`, replace lines from `.shop-offers {` through `.shop-support { … }` (`:213-243`) with:

```css
.launch-tagline { white-space: pre-line; }
:lang(ja) .launch-tagline { max-width: none; word-break: keep-all; }
.shop-box-inline { display: none; }
.shop-sheet { margin-top: clamp(2.5rem, 5vw, 4.5rem); border-top: 1px solid var(--ink); }
.shop-row { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: .5rem 1rem; padding-block: clamp(1.25rem, 2.6vw, 2.25rem); border-bottom: 1px solid var(--rule); }
.shop-row-label { margin: 0; font-size: .8125rem; font-weight: 500; line-height: 1.3; letter-spacing: .05em; text-transform: uppercase; }
.shop-row p { margin: 0; }
.shop-offer-name { font-size: clamp(1.2rem, 1.6vw, 1.5rem); font-weight: 500; }
.shop-offer-terms, .shop-note { margin-top: .25rem !important; color: var(--muted); font-size: .875rem; }
.shop-buy-band { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 5rem; margin-top: 1rem; padding: 1rem 1.25rem; background: var(--ink); color: var(--paper); font-size: clamp(1.25rem, 2.5vw, 2rem); font-weight: 500; line-height: 1; letter-spacing: -.045em; text-decoration: none; }
.shop-buy-band span { margin-right: auto; }
.shop-buy-band::after { content: '→'; }
.shop-buy-disabled { opacity: .45; cursor: default; }
.shop-demo-link { display: inline-flex; align-items: center; gap: .45rem; font-size: 1.125rem; font-weight: 500; }
.shop-demo-link img[data-download-icon] { width: 1.2rem; height: 1.2rem; }
.shop-download-all { display: block; width: fit-content; margin-top: .65rem; color: var(--muted); font-size: .82rem; }
.shop-requirements table { width: 100%; border-collapse: collapse; text-align: left; }
.shop-requirements th, .shop-requirements td { padding: .6rem 0; border-bottom: 1px solid var(--rule); vertical-align: top; font-weight: 450; }
.shop-requirements td { text-align: right; }
.shop-description h3 { margin: 1.5rem 0 .5rem; font-size: clamp(1.4rem, 2.2vw, 2rem); font-weight: 500; line-height: 1.1; letter-spacing: -.03em; }
.shop-description p { max-width: 62ch; }
.shop-interface { margin: clamp(4rem, 9vw, 8rem) 0; }
.shop-interface img { width: min(100%, 720px); margin-inline: auto; }
.shop-demo { margin-bottom: clamp(4rem, 9vw, 8rem); }
.shop-demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr)); gap: 2rem; }
.shop-demo figure { margin: 0; }
.shop-demo video, .shop-demo audio { width: 100%; }
.shop-demo figcaption { margin-block: .75rem; }
@media (min-width: 64rem) { .shop-box-aside { position: sticky; top: clamp(2rem, 5vw, 4rem); } }
```

In the phone media block (the one containing `.suspended-hero { grid-template-columns: 1fr; }` near line 311), replace the old `.shop-offers …` and `.shop-buy …` lines (`:333-335`) with:

```css
  .shop-box-inline { display: block; width: 100%; max-height: 70vh; margin-top: 2rem; object-fit: contain; }
  .shop-box-aside { display: none; }
  .shop-row { grid-template-columns: 1fr; }
```

- [ ] **Step 7: Run the test to see it pass**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render/storefront.test.ts`
Expected: PASS.

- [ ] **Step 8: Run the whole gate**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npm run verify`
Expected: 0 check errors, all tests pass, build completes. If other render tests asserted the old copy (`SC Suspended`, `BUY <span>`), update those assertions to the new copy from this task, nothing else.

- [ ] **Step 9: Commit**

```bash
git add src/components/ProductLaunch.astro src/data/products.ts src/styles/global.css tests/fixtures/site-preview.v1.json tests/render
git commit -m "OP#201: Suspended product page as a catalogue sheet"
```

### Task 2: Cart page

**Files:**
- Modify: `src/components/PaddleCheckout.astro` (markup and `<style>`; keep attributes on the root `<section>`, the `<script>` import, and every `data-checkout-*` element)
- Test: `tests/render/storefront.test.ts`

**Interfaces:**
- Consumes: `.shop-row`, `.shop-row-label`, `.shop-note` from Task 1; `suspendedShopOffers`, `suspendedShopProduct` from `src/data/shopCatalogue.ts`.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add cart assertions to the render test**

After `expect(purchase).toContain(\`data-paddle-success="${locale ? '/ja' : ''}/setup/"\`);` add:

```ts
    expect(purchase).toContain(locale ? '>カート<' : '>Cart<');
    expect(purchase).toContain(locale ? '>ショップ<' : '>SHOP<');
    expect(purchase).toContain(locale ? '>商品<' : '>ITEM<');
    expect(purchase).toContain(locale ? 'お支払い総額' : 'Total due');
    expect(purchase).toContain(locale ? '通貨と税額は、お住まいの地域に合わせて決済時に計算されます。お支払いの前に総額をご確認ください。' : 'Paddle calculates your currency and tax. Review the final total before paying.');
    expect(purchase).toContain(locale ? 'お支払いのあと' : 'AFTER PAYMENT');
    expect(purchase).toContain(locale ? 'お支払いが終わると、この画面のままライセンスを設定できます。設定用のリンクはメールでもお届けします。' : 'Set up your licence in this tab. A setup link also arrives by email as a backup.');
    for (const hook of ['data-checkout-subtotal', 'data-checkout-discount', 'data-checkout-tax', 'data-checkout-credit', 'data-checkout-total', 'data-checkout-status', 'data-checkout-retry', 'paddle-checkout-frame'])
      expect(purchase).toContain(hook);
    expect(purchase).toContain('/catalogue-media/suspended/box-art.png');
```

- [ ] **Step 2: Run to see it fail**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render/storefront.test.ts`
Expected: FAIL on `>Cart<`.

- [ ] **Step 3: Replace the checkout markup**

In `src/components/PaddleCheckout.astro` add to the front matter:

```ts
import { suspendedShopOffers, suspendedShopProduct } from '../data/shopCatalogue';
const offer = suspendedShopOffers[0];
const price = offer ? new Intl.NumberFormat(ja ? 'ja-JP' : 'en-US', { style: 'currency', currency: offer.price.currency, maximumFractionDigits: 0 }).format(offer.price.amountMinor / 100) : '';
```

Keep the opening `<section class="purchase-checkout" … data-payment-link-error=…>` tag exactly. Replace its children with:

```astro
  <div class="checkout-summary">
    <p class="eyebrow">↘&#xFE0E;&nbsp;{ja ? 'ショップ' : 'SHOP'}</p>
    <h1 id="checkout-title">{ja ? 'カート' : 'Cart'}</h1>
    <div class="shop-sheet">
      <section class="shop-row" aria-labelledby="cart-item-title">
        <h2 id="cart-item-title" class="shop-row-label">{ja ? '商品' : 'ITEM'}</h2>
        <div class="cart-item">
          {suspendedShopProduct?.media.boxArt && <img src={suspendedShopProduct.media.boxArt} alt="" width="96" height="120" />}
          <div>
            <p class="shop-offer-name">{offer?.name[locale] ?? (ja ? 'Suspended ライセンス' : 'Suspended licence')}</p>
            <p class="shop-note">{ja ? 'グラニュラー・エフェクト' : 'Granular audio effect'}<br />{ja ? '買い切り（サブスクリプションなし）・パソコン3台まで' : 'One-time payment · up to 3 computers'}</p>
            <p class="shop-note">{ja ? '数量 1' : 'Quantity 1'}</p>
          </div>
          <p class="cart-price">{price}</p>
        </div>
      </section>
      <section class="shop-row" aria-labelledby="cart-total-title">
        <h2 id="cart-total-title" class="shop-row-label">{ja ? '合計' : 'TOTAL'}</h2>
        <div>
          <dl class="checkout-totals" aria-live="polite" aria-atomic="true">
            <div><dt>{ja ? '小計' : 'Subtotal'}</dt><dd data-checkout-subtotal>—</dd></div>
            <div><dt>{ja ? '割引' : 'Discount'}</dt><dd data-checkout-discount>—</dd></div>
            <div><dt>{ja ? '税' : 'Tax'}</dt><dd data-checkout-tax>{ja ? 'お支払い時に計算されます' : 'Calculated by Paddle'}</dd></div>
            <div><dt>{ja ? 'クレジット' : 'Credit'}</dt><dd data-checkout-credit>—</dd></div>
            <div class="checkout-grand-total"><dt>{ja ? 'お支払い総額' : 'Total due'}</dt><dd data-checkout-total>—</dd></div>
          </dl>
          <p class="shop-note">{ja ? '通貨と税額は、お住まいの地域に合わせて決済時に計算されます。お支払いの前に総額をご確認ください。' : 'Paddle calculates your currency and tax. Review the final total before paying.'}</p>
        </div>
      </section>
      <div class="checkout-payment">
        <h2 class="shop-row-label">{ja ? 'お支払い' : 'SECURE CHECKOUT'}</h2>
        <p data-checkout-status role="status" aria-live="polite"></p>
        <button class="button" data-checkout-retry type="button" hidden>{ja ? 'もう一度試す' : 'Try checkout again'}</button>
        <div class="paddle-checkout-frame"></div>
        <noscript><p>{ja ? '決済にはJavaScriptを有効にしてください。' : 'Enable JavaScript to open secure checkout.'}</p></noscript>
        <p class="shop-note">{ja ? 'Paddleが販売・決済を処理します。' : 'Paddle is the merchant of record and handles payment.'} <a href={localizedPath('/support/', locale)}>{ja ? 'サポート' : 'Contact support'}</a></p>
      </div>
      <section class="shop-row" aria-labelledby="cart-after-title">
        <h2 id="cart-after-title" class="shop-row-label">{ja ? 'お支払いのあと' : 'AFTER PAYMENT'}</h2>
        <p>{ja ? 'お支払いが終わると、この画面のままライセンスを設定できます。設定用のリンクはメールでもお届けします。' : 'Set up your licence in this tab. A setup link also arrives by email as a backup.'}</p>
      </section>
    </div>
    <p class="cart-links"><a href={localizedPath('/refund/', locale)}>{ja ? '返金ポリシー' : 'Refund policy'}</a><a href={localizedPath('/license/', locale)}>{ja ? 'ライセンス条件' : 'Licence terms'}</a><a href={localizedPath('/privacy/', locale)}>{ja ? 'プライバシー' : 'Privacy'}</a><a href={localizedPath(suspendedShopVisible ? '/products/suspended/' : '/products/', locale)}>← {ja ? 'Suspendedに戻る' : 'Back to Suspended'}</a></p>
  </div>
```

The payment block sits inside the sheet so that on phones it follows TOTAL; on desktop CSS lifts it into the right column.

- [ ] **Step 4: Replace the component `<style>`**

```css
  .purchase-checkout { padding-block: clamp(3rem, 7vw, 6rem); }
  .checkout-summary { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(312px, .9fr); column-gap: clamp(2rem, 5vw, 6rem); }
  .checkout-summary > .eyebrow, .checkout-summary > h1, .checkout-summary > .cart-links { grid-column: 1; }
  .checkout-summary > .shop-sheet { display: contents; }
  .shop-sheet > .shop-row { grid-column: 1; }
  .shop-sheet > .shop-row:first-of-type { border-top: 1px solid var(--ink); }
  .checkout-payment { grid-column: 2; grid-row: 1 / span 6; min-width: 0; }
  h1 { margin: .5rem 0 2.5rem; font-size: clamp(3rem, 7vw, 6.5rem); font-weight: 500; line-height: .95; letter-spacing: -.045em; }
  .cart-item { display: flex; gap: 1rem; align-items: center; }
  .cart-item img { width: 5rem; height: auto; flex: none; }
  .cart-item > div { flex: 1; }
  .cart-price { font-size: 1.25rem; font-weight: 500; }
  .checkout-totals { margin: 0; }
  .checkout-totals > div { display: flex; justify-content: space-between; gap: 1rem; padding-block: .2rem; }
  dd { margin: 0; text-align: right; }
  .checkout-grand-total { border-top: 1px solid var(--rule); margin-top: .75rem; padding-top: .75rem !important; font-size: 1.25rem; font-weight: 500; }
  .cart-links { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin-top: 2rem; font-size: .875rem; }
  button { font: inherit; cursor: pointer; border: 0; }
  [hidden] { display: none; }
  @media (max-width: 48rem) {
    .checkout-summary { display: block; }
    .checkout-summary > .shop-sheet { display: block; border-top: 1px solid var(--ink); }
    .shop-sheet > .shop-row:first-of-type { border-top: 0; }
    .checkout-payment { padding-block: 1.5rem; border-bottom: 1px solid var(--rule); }
  }
  @media (max-width: 359px) { .paddle-checkout-frame { margin-inline: -1rem; } }
```

Note: with `display: contents` the sheet's children become grid items of `.checkout-summary`; rows go to column 1 in source order, payment spans column 2.

- [ ] **Step 5: Run the render test and the checkout suites**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render/storefront.test.ts tests/unit/checkout.test.ts`
Expected: PASS.
Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npm run test:checkout`
Expected: all checkout browser tests pass (they drive the same data hooks). If a selector relied on the removed heading text `Purchase Suspended`/`Suspendedを購入`, update only that selector to `Cart`/`カート`.

- [ ] **Step 6: Commit**

```bash
git add src/components/PaddleCheckout.astro tests/render/storefront.test.ts tests/browser
git commit -m "OP#201: restyle the Suspended purchase page as the cart"
```

### Task 3: Japanese navigation label

**Files:**
- Modify: `src/i18n/ja.ts:5`
- Test: `tests/render/navigation.test.ts`

- [ ] **Step 1: Assert the label**

Add to `tests/render/navigation.test.ts` (inside its existing JA page check, or as a new `it` that reads the built `/ja/` home page the same way the file already does):

```ts
expect(jaHome).toContain('>製品<');
expect(jaHome).not.toContain('オーディオ・インストゥルメンツ');
```

(The file reads built pages with `readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8')`; read `../../dist/ja/index.html` the same way into `jaHome`.)

- [ ] **Step 2: Run to see it fail**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render/navigation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Change the label**

`src/i18n/ja.ts`: `audioInstruments: '製品',`

- [ ] **Step 4: Run to see it pass, then grep for other uses**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 npx vitest run tests/render && grep -rn "オーディオ・インストゥルメンツ" src tests`
Expected: PASS; grep prints nothing (if other tests/pages hard-code the old label, update them to `製品`).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ja.ts tests/render
git commit -m "OP#201: shorten the Japanese products navigation label"
```

### Task 4: Browser verification (desktop, phone, keyboard, axe)

**Files:**
- Modify: `tests/browser/responsive-accessibility.e2e.ts`

- [ ] **Step 1: Add the shop pages to the responsive/accessibility suite**

Read the file first and follow its existing pattern (it already loops over pages and viewports with `@axe-core/playwright`). Add `/products/suspended/`, `/ja/products/suspended/`, `/purchase/suspended/`, `/ja/purchase/suspended/` to its page list, and add this test:

```ts
test('shop pages: no horizontal scroll at 390px and Buy comes first in tab order', async ({ page }) => {
  for (const path of ['/products/suspended/', '/ja/products/suspended/']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const order = await page.$$eval('.shop-sheet a, .shop-sheet [aria-disabled]', (els) => els.map((e) => e.className));
    expect(order[0]).toContain('shop-buy-band');
  }
});
```

- [ ] **Step 2: Run against the sandbox build**

Run: `TMPDIR=/Volumes/Dock/GitHub/.tmp-op201 CI=1 npm run test:browser -- tests/browser/responsive-accessibility.e2e.ts`
Expected: PASS. (Install browsers once with `npx playwright install chromium` if missing.) Fix only layout/ARIA defects in files from Tasks 1–3.

- [ ] **Step 3: Commit**

```bash
git add tests/browser/responsive-accessibility.e2e.ts
git commit -m "OP#201: cover the shop pages in responsive and accessibility checks"
```

### Task 5: Owner review checkpoint (user interaction)

- [ ] **Step 1:** Start the sandbox preview with the private catalogue fixture: `SITE_CATALOGUE_FILE=tests/fixtures/site-preview.v1.json PADDLE_CHECKOUT_ENVIRONMENT=sandbox npm run dev -- --port 4332` (via the preview tool), open `/products/suspended/`, `/ja/products/suspended/`, `/purchase/suspended/` at desktop and 390 px, and send screenshots to the owner.
- [ ] **Step 2:** Apply the owner's corrections within Tasks 1–3 files; rerun `npm run verify`; commit.

### Task 6: Catalogue copy and interface image (separate approval, product-catalogue repository)

Ask the owner before starting: this changes `studiocucurbits/product-catalogue` (Frederik's #206 area; PR #12 already merged).

- [ ] **Step 1:** In a fresh branch of product-catalogue, replace the body of `products/suspended/ja.md` with the owner's text from the spec (first paragraph, `## 止めずに、「とどめる」`, second paragraph), and replace `products/suspended/media/interface.png` with the owner's capture converted to PNG (`sips -s format png <webp> --out products/suspended/media/interface.png`).
- [ ] **Step 2:** Run `python3 -m unittest discover -s tests && python3 catalogue.py validate` and regenerate `examples/site-preview.v1.json` as the README describes; commit; open a PR referencing OP#201 and OP#208.
- [ ] **Step 3:** In the website, run `node scripts/sync-catalogue-media.mjs` (also runs automatically as `prebuild`/`predev`) against the updated catalogue checkout so `public/catalogue-media/suspended/interface.png` matches; rerun `npm run verify`; commit.

### Task 7: Close-out

- [ ] Record outcome, verification and remaining work on OP#201; ask the owner whether to push `claude/op201-shop` and open a PR to `kbys88edu/studiocucurbits` (Frederik reviews; deployment and sales stay gated by #38/#198/#209).
