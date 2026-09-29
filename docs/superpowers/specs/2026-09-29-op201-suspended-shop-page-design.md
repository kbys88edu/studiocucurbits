# OP#201 — Suspended shop page and cart: design

Status: design decisions made with the owner (Sachie) in chat, 29 September 2026; this document awaits her review before the implementation plan.
Goal: a sale-ready Suspended product page and a single-item cart this week (owner decision recorded on OP#38, comment 1383).
Design reference: Superdesign project "Studio Cucurbits Website Renewal"; drafts listed in `.superdesign/resume.json`
(product EN `2e499908…` v6, cart EN `980dcf0d…` v3, product JA `e38117e3…` v5, cart JA `f8adcb99…` v6).

## Scope

In: `/products/suspended/` and `/ja/products/suspended/`; `/purchase/suspended/` and its JA twin restyled as the cart;
the Japanese copy below; the Japanese navigation label; phone layouts of these pages.

Out (later tasks): `/products/` index, bundle pages and multi-item cart; showing the USD 19 introductory offer (first 100
licences, stopped by hand); any Paddle, licensing or setup behaviour (#198); hosting (#209); final-release interface capture (#208).

## Product page (catalogue sheet)

Two columns on desktop (copy and rows left, box art right, sticky); one column on phones with the box art directly after the lead.

1. Eyebrow `GRANULAR AUDIO EFFECT` / `グラニュラー・エフェクト`; product name `SUSPENDED`. No "SC", no "Traces".
2. Headline and lead — EN unchanged (`Sound in suspension. A body still in motion.` / `Capture a moment of sound and keep it moving from within.`);
   JA `宙に留まる音。` + line break + `内側で動き続ける響き。` / `一瞬をつかまえる。`
3. Ruled rows with a small uppercase label column and content. **No row numbering on any page.**
   - LICENCE / ライセンス: offer name, `One-time payment · up to 3 computers` / `買い切り（サブスクリプションなし）・パソコン3台まで`,
     then the only black band on the page: `Buy licence  $29  →` / `購入する  $29  →`. No large standalone price.
     Only offers in the catalogue export are shown; the preview fixture's Traces row is removed (planned offers never appear).
   - DOWNLOAD / ダウンロード: underlined text link with platform icon `Try the free demo — Download for macOS ↓` / `無料デモ版をダウンロード（macOS）`
     (platform detected as today), note `The demo mutes briefly every few minutes until a licence is activated.` /
     `ライセンスを設定するまでは、数分おきに数秒間、音が途切れます。`, then `All installers and versions →` / `ほかのOS・過去のバージョン →`.
   - SYSTEM REQUIREMENTS / 動作環境: existing table and note; JA note `Linuxの対応ディストリビューションと、動作を確認したDAWは現在確認中です。`
   - ABOUT / 製品について: catalogue description (Markdown, rendered safely).
   - SUPPORT / サポート: `Setup and support →` / `インストールとサポート →`.
4. Interface image below the grid at its natural width (max 720 px, centred), then optional video/audio sections as today.

## Cart (`/purchase/suspended/`)

Heading `Cart` / `カート` with eyebrow `SHOP` / `ショップ`. Ruled rows: ITEM (small box art, offer name, product type and licence terms, quantity 1, price),
TOTAL (subtotal, tax, total due filled by the existing Paddle events; JA `お支払い時に計算されます`, `お支払い総額`,
`通貨と税額は、お住まいの地域に合わせて決済時に計算されます。お支払いの前に総額をご確認ください。`), AFTER PAYMENT
(JA `お支払いのあと` / `お支払いが終わると、この画面のままライセンスを設定できます。設定用のリンクはメールでもお届けします。`),
then refund / licence / privacy links and `← Back to Suspended`.
The existing Paddle inline checkout frame sits in the right column (`SECURE CHECKOUT` / `お支払い`); on phones it follows TOTAL.
All `data-*` hooks, error messages, the `/setup/` success route and the disabled-sales gating in `PaddleCheckout.astro` / `PurchaseGuide.astro` are kept unchanged.

## Site-wide

- Japanese navigation label `オーディオ・インストゥルメンツ` → `製品` (`src/i18n/ja.ts`; coordinate with #200).
- Phones: header collapses the navigation behind the existing `Menu` / `メニュー` toggle; no horizontal scrolling at 390 px.

## Catalogue changes (product-catalogue repository, separate approval)

- `products/suspended/ja.md` description (owner's text):
  `Suspended は、楽器の一音、声、フィールドレコーディングなどの音から聞こえてくる「一瞬」を捉えて保持するグラニュラー・エフェクトです。`
  / `## 止めずに、「とどめる」` / `同じところを繰り返す単なるループではありません。細かな粒子の集まりのように、息づき、散らばり、少しずつ薄れていきます。短い身振りを、長く続く響きや、場面と場面をつなぐ音に変えられます。`
- Interface image: the owner-supplied capture (720×644, preset Almost Motionless, frozen) replaces `media/interface` — #208 still tracks the final-release capture.

## Verification

`npm run verify` (with `TMPDIR` on the Dock volume) and updated render tests for the new copy, removed numbering/Traces row and cart structure;
Playwright check at 1440 and 390 px in EN and JA; keyboard focus order (Buy → demo link → installers → support); axe check on both pages.
Owner reviews the running preview before merge. Public sales remain gated by #38/#198 and owner approval.
