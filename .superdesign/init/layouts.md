# Layouts (Astro 7, vanilla CSS in src/styles/global.css — no Tailwind, no UI library)

Every page renders `BaseLayout` → `Header` + `<main>` slot + `Footer`. Header logo is `/images/brand/studio_cucurbits_logo_vector.svg` (dot-matrix wordmark).

### `src/layouts/BaseLayout.astro`

```astro
---
import '@fontsource-variable/inter-tight';
import '../styles/global.css';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import Seo from '../components/Seo.astro';
import type { Product } from '../data/products';
import { getProductOffer } from '../lib/seo';

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  locale?: 'en' | 'ja';
  product?: Product;
  breadcrumbLabel?: string;
}

const { title, description, canonicalPath, locale = 'en', product, breadcrumbLabel } = Astro.props;
const skipLinkLabel = locale === 'ja' ? '\u30b3\u30f3\u30c6\u30f3\u30c4\u3078\u79fb\u52d5' : 'Skip to content';
const canonical = new URL(canonicalPath, Astro.site);
const segments = canonicalPath.split('/').filter(Boolean).slice(locale === 'ja' ? 1 : 0);
const breadcrumbRoot = locale === 'ja' ? '/ja/' : '/';
const localizedBreadcrumbs: Record<string, string> = locale === 'ja'
  ? { about: '概要', work: '作品', products: 'オーディオ・インストゥルメンツ', support: 'サポート', newsletter: 'ニュースレター', downloads: 'ダウンロード', license: 'ライセンス', privacy: 'プライバシー', terms: '利用規約', 'coming-soon': '近日公開', beta: 'ベータ', press: 'プレス' }
  : {};
const breadcrumbItems = [
  { '@type': 'ListItem', position: 1, name: locale === 'ja' ? 'ホーム' : 'Home', item: new URL(breadcrumbRoot, Astro.site).toString() },
  ...segments.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 2,
    name: index === segments.length - 1 && breadcrumbLabel ? breadcrumbLabel : localizedBreadcrumbs[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    item: new URL(`${breadcrumbRoot}${segments.slice(0, index + 1).join('/')}/`, Astro.site).toString(),
  })),
];
const offer = product ? getProductOffer(product) : null;
const structuredData = [
  { '@context': 'https://schema.org', '@type': 'Organization', name: 'Studio Cucurbits.', url: new URL('/', Astro.site).toString() },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems },
  ...(offer && product ? [{ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description, url: canonical.toString(), offers: offer }] : []),
];
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <slot name="head" />
    <Seo title={title} description={description} canonical={canonical} locale={locale} image={product?.seo.image ?? undefined} />
    {structuredData.map((data) => <script is:inline type="application/ld+json" set:html={JSON.stringify(data)} />)}
  </head>
  <body>
    <a class="skip-link" href="#main-content">{skipLinkLabel}</a>
    <Header locale={locale} canonicalPath={canonicalPath} />
    <main id="main-content"><slot /></main>
    <Footer locale={locale} />
  </body>
</html>

```

### `src/components/Header.astro`

```astro
---
import { getDictionary } from '../i18n';
import { localizedPath, type Locale } from '../lib/locale';
import LanguageSwitch from './LanguageSwitch.astro';

interface Props {
  locale: Locale;
  canonicalPath: string;
}

const { locale, canonicalPath } = Astro.props;
const dictionary = getDictionary(locale);
const copy = locale === 'ja'
  ? { home: 'Studio Cucurbits.のホーム', menu: 'メニュー', navigation: 'メインナビゲーション' }
  : { home: 'Studio Cucurbits home', menu: 'Menu', navigation: 'Primary navigation' };
const navigation = [
  { label: dictionary.navigation.studio, href: '/' },
  { label: dictionary.navigation.work, href: '/work/' },
  { label: dictionary.navigation.audioInstruments, href: '/products/' },
  { label: dictionary.navigation.downloads, href: '/downloads/' },
  { label: dictionary.navigation.about, href: '/about/' },
  { label: dictionary.navigation.support, href: '/support/' },
];
---

<header class="site-header">
  <a class="brand" href={localizedPath('/', locale)} aria-label={copy.home}>
    <img src="/images/brand/studio_cucurbits_logo_vector.svg" alt="" width="1260" height="974" />
  </a>
  <button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false"><span class="visually-hidden">{copy.menu}</span></button>
  <nav id="primary-navigation" class="primary-nav" aria-label={copy.navigation}>
    {navigation.map((item) => <a href={localizedPath(item.href, locale)}>{item.label}</a>)}
  </nav>
  <div class="header-tools">
    <LanguageSwitch locale={locale} path={canonicalPath} />
  </div>
</header>

<script>
  const header = document.querySelector<HTMLElement>('.site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.menu-toggle');

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    header?.classList.toggle('menu-open', open);
  });
</script>

```

### `src/components/LanguageSwitch.astro`

```astro
---
import { localizedPath, type Locale } from '../lib/locale';

interface Props {
  locale: Locale;
  path: string;
}

const { locale, path } = Astro.props;
const navigationLabel = locale === 'ja' ? '\u8a00\u8a9e' : 'Language';
---

<nav class="language-switch" aria-label={navigationLabel}>
  <a href={localizedPath(path, 'en')} aria-current={locale === 'en' ? 'page' : undefined}>EN</a>
  <a href={localizedPath(path, 'ja')} aria-current={locale === 'ja' ? 'page' : undefined}>日本語</a>
</nav>

```

### `src/components/Footer.astro`

```astro
---
import { legalDocuments } from '../data/legal';
import { localizedPath, type Locale } from '../lib/locale';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const copy = locale === 'ja'
  ? { tagline: 'Studio Cucurbits. / 音楽とクリエイティブテクノロジー', accent: '音楽とクリエイティブテクノロジー', updates: 'スタジオからの最新情報', pricing: '価格', legal: '規定' }
  : { tagline: 'Studio Cucurbits. / Music and Creative Technology', accent: 'Music and creative technology.', updates: 'Studio updates', pricing: 'Pricing', legal: 'Legal' };
const legalLinks = (['terms', 'privacy', 'license', 'refund', 'business'] as const)
  .map((slug) => ({ label: legalDocuments[slug][locale].title, href: localizedPath(`/${slug}/`, locale) }));
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <p class="footer-signoff">Studio Cucurbits.<span>{copy.accent}</span></p>
  <div class="footer-links">
    <a href="mailto:contact@studiocucurbits.com">contact@studiocucurbits.com</a>
    <a href={localizedPath('/newsletter/', locale)}>{copy.updates}</a>
    <a href={localizedPath('/pricing/', locale)}>{copy.pricing}</a>
  </div>
  <div class="footer-meta">
    <p>© {year} {copy.tagline}</p>
    <nav class="footer-legal" aria-label={copy.legal}>
      {legalLinks.map((link) => <a href={link.href}>{link.label}</a>)}
    </nav>
  </div>
</footer>

```

