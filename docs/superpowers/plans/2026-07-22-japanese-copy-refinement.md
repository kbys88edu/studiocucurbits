# Japanese Copy Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Japanese site copy natural and editorial without changing routes, English copy, product state, or the locale model.

**Architecture:** Keep all changes in the existing Japanese string literals and product data. Shared components continue to receive the same `locale` and `product` props; only their Japanese labels and rendered values change.

**Tech Stack:** Astro 5, TypeScript, Vitest, Playwright, npm scripts.

## Global Constraints

- Keep `浮遊する音。動き続ける身体。` unchanged.
- Keep `Freeze`, `Release`, `Grain`, `Density`, `Drift`, `Scatter`, `Breath`, `Fragility`, `Release Tail`, `VST3`, and product names as product terminology.
- Translate surrounding headings and technical labels into natural Japanese.
- Keep prices, checkout URLs, release dates, hidden collections, and English pages unchanged.
- Do not add dependencies or change the locale data model.

---

### Task 1: Refine shared Japanese labels and site surfaces

**Files:**
- Modify: `src/i18n/ja.ts`
- Modify: `src/data/site.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/work.astro`
- Modify: `src/pages/products/index.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/LatestItem.astro`
- Modify: `src/components/NewsletterForm.astro`
- Test: `tests/render/content-pages.test.ts`, `tests/render/catalogue.test.ts`, `tests/render/newsletter.test.ts`

**Interfaces:** Existing `locale` props and `latestItem.summaryJa` remain unchanged.

- [ ] **Step 1: Add or update render assertions** for natural Japanese homepage, About, Products, and newsletter phrases while keeping the existing English assertions.
- [ ] **Step 2: Run the focused render tests** with `npm.cmd test -- tests/render/content-pages.test.ts tests/render/catalogue.test.ts tests/render/newsletter.test.ts`; expect failures for the old copy.
- [ ] **Step 3: Replace only Japanese string literals** with natural editorial copy, including `製品`, `オーディオ・インストゥルメンツ`, `スタジオからのお知らせ`, and complete sentences with consistent punctuation.
- [ ] **Step 4: Re-run the focused tests** and confirm they pass without changing route counts or English text.
- [ ] **Step 5: Commit** with `git add src tests && git commit -m "fix: naturalize Japanese site copy"`.

### Task 2: Refine SC Suspended and support Japanese copy

**Files:**
- Modify: `src/data/products.ts`
- Modify: `src/components/ProductLaunch.astro`
- Modify: `src/components/ProductSupport.astro`
- Modify: `src/components/ProductDetails.astro`
- Modify: `src/components/ProductHero.astro`
- Modify: `src/components/SupportGuide.astro`
- Modify: `src/components/StatusLabel.astro`
- Modify: `src/pages/ja/support.astro`
- Modify: `src/pages/ja/support/[slug].astro`
- Test: `tests/render/routes.test.ts`, `tests/render/catalogue.test.ts`, `tests/unit/product.test.ts`, `tests/unit/optional-data.test.ts`

**Interfaces:** `Product.launch` retains its current shape; only localized values change.

- [ ] **Step 1: Add assertions** for translated section headings, `Windows（ベータ版）`, `ステレオ`, `ファクトリープリセット 8種`, natural beta guidance, and translated support topics.
- [ ] **Step 2: Run focused product tests** with `npm.cmd test -- tests/render/routes.test.ts tests/render/catalogue.test.ts tests/unit/product.test.ts tests/unit/optional-data.test.ts`; expect failures for old labels.
- [ ] **Step 3: Update localized product strings** while preserving the approved tagline and all product/control names.
- [ ] **Step 4: Re-run focused tests** and confirm prices, checkout absence, and hidden collections remain protected.
- [ ] **Step 5: Commit** with `git add src tests && git commit -m "fix: naturalize Japanese product copy"`.

### Task 3: Full verification and publish

**Files:**
- Verify: all modified files from Tasks 1-2

- [ ] **Step 1: Run full tests** with `npm.cmd test -- --hookTimeout=60000`.
- [ ] **Step 2: Run static checks** with `npm.cmd run check`.
- [ ] **Step 3: Run production build** with `npm.cmd run build`.
- [ ] **Step 4: Inspect Japanese routes** `/ja/`, `/ja/about/`, `/ja/products/`, `/ja/products/suspended/`, `/ja/support/suspended/` and confirm no horizontal overflow in the existing browser preview.
- [ ] **Step 5: Push the feature branch** with `git push origin feat/audio-instruments-site`.
- [ ] **Step 6: Merge into `main`** through the repository's pull request and wait for the GitHub Pages deployment workflow to finish successfully.
