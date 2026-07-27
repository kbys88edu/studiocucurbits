# Collapsible Product Specifications Implementation Plan

**Goal:** Make every substantive Suspended product-page section closed by default and expandable by clicking its heading, including specifications.

**Architecture:** Use native HTML `<details>` and `<summary>` elements inside `ProductLaunch.astro` for the gallery, feature, controls, uses, comparison, freeze/release, presets, beta, credits, and specifications sections. Keep the hero and final CTA visible, remove the product-page link to the separate specifications route, and retain that route for compatibility.

**Tech Stack:** Astro, TypeScript, Vitest, native HTML disclosure semantics.

## Global Constraints

- Product display names remain without the internal `SC` prefix.
- Existing product slugs and internal IDs remain unchanged.
- Every substantive content section is closed by default and keyboard accessible through native disclosure behavior.
- Japanese and English product pages use their existing localized specification labels and values.

---

### Task 1: Update the product-page render contract

**Files:**
- Modify: `tests/render/routes.test.ts`
- Modify: `src/components/ProductLaunch.astro`

- [ ] **Step 1: Write the failing test**

Replace the separate-page assertion with these product-page assertions:

```ts
it('keeps every product content section collapsed until its heading is opened', () => {
  const detail = renderedPage('/products/suspended');
  const detailJa = renderedPage('/ja/products/suspended');

  for (const summary of ['UI and renders', 'FEATURES', 'CONTROLS', 'USES', 'A different kind of freeze', 'FREEZE / RELEASE', 'FACTORY PRESETS', 'BETA INFORMATION', 'CREDITS', 'SPECIFICATIONS']) {
    expect(detail).toContain(`<summary>${summary}</summary>`);
  }
  expect(detail).toContain('Attack Threshold');
  expect(detail).not.toContain('href="/products/suspended/specifications/"');
  expect(detailJa).toContain('Attack Threshold');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/render/routes.test.ts`

Expected: FAIL because the current page links to the separate specification route and does not render a `<details>` section.

- [ ] **Step 3: Write the minimal implementation**

In `ProductLaunch.astro`, remove the `specificationsPath` constant and hero action link. Wrap the gallery, FEATURES, CONTROLS, USES, comparison, Freeze/Release, presets, beta, and credits sections in closed `<details>` elements whose `<summary>` contains the existing section heading. Add the existing `launch.specifications[locale]` data as another closed disclosure:

```astro
<details class="launch-specifications">
  <summary>{copy.specs}</summary>
  <div class="spec-list">
    {launch.specifications[locale].map((spec) => <div><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
  </div>
</details>
```

Use a semantic `<dl class="spec-list">` wrapper around the mapped entries and keep the `details` closed by omitting `open`.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/render/routes.test.ts`

Expected: PASS, including English and Japanese product-page assertions.

- [ ] **Step 5: Run the complete verification**

Run: `npm run check && npm test && npm run build`

Expected: Astro check reports 0 errors, all Vitest files pass, and the static build completes successfully.
