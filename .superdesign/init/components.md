# Shared Components

No primitive component library. Buttons, tables, eyebrows and rules are global CSS classes (`.button`, `.eyebrow`, `.lead`, ruled `table`s) in `src/styles/global.css` — see theme.md. Page-level Astro components below.

### `src/components/ProductCard.astro`

```astro
---
import type { Product } from '../data/products';
import { localizedPath, type Locale } from '../lib/locale';
import StatusLabel from './StatusLabel.astro';

interface Props {
  product: Product;
  locale: Locale;
}

const { product, locale } = Astro.props;
const href = localizedPath(`/products/${product.slug}/`, locale);
const summary = product.editorial[locale].shortDescription ?? product.editorial.en.shortDescription;
const imageSize = product.slug === 'suspended' ? { width: 1200, height: 1500 } : { width: 1200, height: 800 };
---

<article class="catalogue-card">
  {product.media.heroImage ? <img src={product.media.heroImage} alt={product.name} width={imageSize.width} height={imageSize.height} loading="lazy" decoding="async" /> : <div class="media-placeholder" aria-hidden="true" />}
  <StatusLabel status={product.status} locale={locale} />
  {product.productType && <p class="eyebrow">{product.productType}</p>}
  <h2><a href={href}>{product.name}</a></h2>
  {summary && <p>{summary}</p>}
</article>

```

### `src/components/StatusLabel.astro`

```astro
---
import { getDictionary } from '../i18n';
import type { CollectionStatus, ProductStatus } from '../data/products';
import type { Locale } from '../lib/locale';

interface Props {
  status: string | null;
  locale?: Locale;
}

const { status, locale = 'en' } = Astro.props;
const dictionary = getDictionary(locale);
const normalized = status === 'coming soon' ? 'coming-soon' : status;
const collectionLabels = {
  forthcoming: locale === 'ja' ? '公開予定' : 'Forthcoming',
  available: locale === 'ja' ? '公開中' : 'Available',
  archived: locale === 'ja' ? 'アーカイブ' : 'Archived',
} as const;
const label = normalized && (normalized in dictionary.productStatus
  ? dictionary.productStatus[normalized as ProductStatus]
  : normalized in collectionLabels
    ? collectionLabels[normalized as CollectionStatus]
    : null);
---

{label && <p class="status-label">{label}</p>}

```

### `src/components/RelatedProducts.astro`

```astro
---
import type { Product } from '../data/products';
import { localizedPath, type Locale } from '../lib/locale';

interface Props {
  products: Product[];
  locale: Locale;
}

const { products, locale } = Astro.props;
const copy = locale === 'ja'
  ? { category: '\u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4', title: '\u95a2\u9023\u88fd\u54c1' }
  : { category: 'Audio Instruments', title: 'Related instruments' };
---

{products.length > 0 && (
  <section class="section" aria-labelledby="related-products-title">
    <p class="eyebrow">{copy.category}</p>
    <h2 id="related-products-title">{copy.title}</h2>
    <ul>
      {products.map((product) => <li><a href={localizedPath(`/products/${product.slug}/`, locale)}>{product.name}</a></li>)}
    </ul>
  </section>
)}

```

### `src/components/NewsletterForm.astro`

```astro
---
import type { Locale } from '../lib/locale';

interface Props {
  locale?: Locale;
  source?: string;
  releaseState?: string;
}

const { locale = 'en', source, releaseState } = Astro.props;
const formCopy = locale === 'ja' ? { email: 'メールアドレス', subscribe: '登録する' } : { email: 'Email', subscribe: 'Subscribe' };
---

<div id="mlb2-44184182" class="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-44184182" data-newsletter-source={source || undefined} data-release-state={releaseState || undefined}>
  <div class="ml-form-align-left">
    <div class="ml-form-embedWrapper embedForm">
      <div class="ml-form-embedBody ml-form-embedBodyDefault row-form">
        <form class="ml-block-form newsletter-form" action="https://dashboard.mailerlite.com/jsonp/2536948/forms/194159585016153657/subscribe" data-code="" method="post" target="_blank">
          <div class="ml-form-formContent">
            <div class="ml-form-fieldRow ml-last-item">
              <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                <label for="newsletter-email">{formCopy.email}</label>
                <input id="newsletter-email" name="fields[email]" type="email" autocomplete="email" required placeholder={formCopy.email} />
              </div>
            </div>
          </div>
          {source && <input type="hidden" name="source" value={source} />}
          <input type="hidden" name="ml-submit" value="1" />
          <input type="hidden" name="anticsrf" value="true" />
          <div class="ml-form-embedSubmit">
            <button type="submit" class="primary">{formCopy.subscribe}</button>
            <button disabled type="button" class="loading" aria-label="Loading" style="display:none"><span class="ml-form-embedSubmitLoad"></span></button>
          </div>
        </form>
      </div>
      <div class="ml-form-successBody row-success" style="display:none">
        <p>{locale === 'ja' ? '登録ありがとうございます。確認メールをご確認ください。' : 'Thank you. Please check your email to confirm your subscription.'}</p>
      </div>
    </div>
  </div>
</div>
<script is:inline>
  Object.assign(globalThis, {
    ml_webform_success_44184182: () => {
      const form = document.querySelector('.ml-subscribe-form-44184182');
      const success = form?.querySelector('.row-success');
      const row = form?.querySelector('.row-form');
      if (success instanceof HTMLElement) success.style.display = 'block';
      if (row instanceof HTMLElement) row.style.display = 'none';
      const source = form?.getAttribute('data-newsletter-source');
      const releaseState = form?.getAttribute('data-release-state') ?? 'pre-release';
      if (source === 'suspended_product_page') {
        import('../lib/analytics').then(({ trackEvent }) => trackEvent('suspended_notify_success', {
          locale: document.documentElement.lang,
          source,
          release_state: releaseState,
        }));
      }
    },
  });
</script>
<script src="https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519" is:inline></script>

```

