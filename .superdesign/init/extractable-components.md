# Extractable Components

## SiteHeader
- Source: `src/components/Header.astro` (+ `LanguageSwitch.astro`)
- Category: layout
- Description: Dot-matrix logo left, primary nav (Home, Work, Products, Downloads, About, Support), EN / 日本語 switch right, 1px rule below.
- Extractable props: activeItem (string, default "products"), locale (string, default "en")
- Hardcoded: logo `/images/brand/studio_cucurbits_logo_vector.svg`, nav labels, CSS

## SiteFooter
- Source: `src/components/Footer.astro`
- Category: layout
- Description: "Studio Cucurbits." sign-off with accent line, contact/updates/pricing links, © line and legal links.
- Extractable props: locale (string, default "en")
- Hardcoded: labels, links, CSS
