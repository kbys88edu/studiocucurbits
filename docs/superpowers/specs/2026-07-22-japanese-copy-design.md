# Japanese Copy Refinement Design

## Goal

Make the Japanese version of Studio Cucurbits. read naturally while preserving its quiet, editorial tone and the existing English product terminology.

## Scope

- Refine Japanese copy on the homepage, About, Work, Products, newsletter, support, and shared navigation/footer surfaces.
- Refine the SC Suspended product and support copy, including section headings, technical labels, beta guidance, and support topics.
- Keep the approved tagline `浮遊する音。動き続ける身体。` unchanged.
- Keep English pages, URLs, product names, parameter names, and private product states unchanged.
- Do not introduce a translation library or alter the locale data model.

## Copy rules

- Use natural Japanese syntax and consistent punctuation.
- Keep a restrained, art-oriented tone; avoid exaggerated marketing language.
- Prefer `オーディオ・インストゥルメンツ` for the business area and `製品` where a general label is clearer.
- Translate surrounding headings and technical descriptions, while retaining product names and control names such as `Freeze`, `Release`, `Grain`, and `VST3`.
- Use concrete labels such as `Windows（ベータ版）`, `ステレオ`, and `ファクトリープリセット 8種`.
- Preserve privacy and release safeguards: prices, checkout links, release dates, and hidden collections remain undisclosed.

## Implementation

Update existing string literals in `src/i18n/ja.ts`, `src/data/site.ts`, `src/data/products.ts`, Japanese page copy, and shared components. Add focused render assertions for the revised public phrases and the absence of the most awkward old labels. No component API changes are needed.

## Validation

Run the existing render/unit suite, `npm.cmd run check`, and `npm.cmd run build`. Confirm that the Japanese routes render the revised copy and that English routes and hidden collection safeguards remain unchanged.
