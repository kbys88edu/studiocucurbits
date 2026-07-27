# Plugin Website Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing plugin announcement imagery with the supplied website renders and central UI assets.

**Architecture:** Keep the current Astro data-driven site intact. Copy supplied PNGs into `public/images/products/`, then update product and collection media references in `src/data/products.ts`; no copy, route, or layout changes are needed.

**Tech Stack:** Astro, TypeScript, npm, Vitest/Playwright.

## Global Constraints

- Preserve existing routes, copy, release statuses, and layout behavior.
- Use supplied assets only; do not generate or crop replacement artwork.
- Keep public asset paths rooted at `/images/products/`.
- Verify with the existing test suite and `npm run build`.

---

### Task 1: Import supplied website assets

**Files:**
- Create: `public/images/products/centre/*.png`
- Create: `public/images/products/website/individual/*.png`
- Create: `public/images/products/website/bundles/*.png`
- Create: `public/images/products/SC_Hero_2560x1440.png`

- [x] **Step 1: Copy the supplied Centre, individual, bundle, and hero PNGs into the public product asset tree.**
- [x] **Step 2: Verify each copied file exists and retains its source dimensions.**

### Task 2: Update product and collection media mappings

**Files:**
- Modify: `src/data/products.ts`

- [x] **Step 1: Point visible product imagery at the supplied central UI and individual render assets.**
- [x] **Step 2: Point Traces, Tendril, and Future Artist Collection imagery at the supplied bundle renders.**
- [x] **Step 3: Add the supplied individual renders as product galleries without changing statuses or copy.**

### Task 3: Update catalogue hero and verify

**Files:**
- Modify: `src/pages/products/index.astro`
- Test: `tests/render/routes.test.ts`, `tests/render/seo.test.ts`

- [x] **Step 1: Replace the old contrast hero reference with the supplied website hero render.**
- [x] **Step 2: Run the existing tests.**
- [x] **Step 3: Run `npm run build`.**
- [x] **Step 4: Confirm generated pages contain the new asset paths.**
