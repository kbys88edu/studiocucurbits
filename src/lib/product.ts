import type { Currency, Product } from '../data/products';
import type { Locale } from './locale';

export interface ProductCta {
  label: 'buy' | 'buy-intro' | 'demo' | 'apply' | 'download' | 'notify';
  href: string;
  disabled: false;
}

function configuredUrl(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function checkoutUrlFor(product: Product, currency: Currency): string | null {
  const value = configuredUrl(currency === 'JPY' ? product.checkoutUrlJPY : product.checkoutUrlUSD);
  if (!value) return null;

  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

export function getProductCta(product: Product, today: Date, currency: Currency = 'USD', newsletterPath = '/newsletter/'): ProductCta | null {
  if (product.status === 'hidden' || product.status === 'discontinued') return null;
  if (product.status === 'announcement' || product.status === 'coming-soon') {
    return { label: 'notify', href: newsletterPath, disabled: false };
  }

  if (product.status === 'beta') {
    const applicationUrl = configuredUrl(product.applicationUrl);
    if (applicationUrl) return { label: 'apply', href: applicationUrl, disabled: false };

    const downloadUrl = configuredUrl(product.downloadUrl);
    return downloadUrl
      ? { label: 'download', href: downloadUrl, disabled: false }
      : { label: 'notify', href: newsletterPath, disabled: false };
  }

  if (product.status === 'demo-available') {
    const demoUrl = configuredUrl(product.demoUrl);
    return demoUrl
      ? { label: 'demo', href: demoUrl, disabled: false }
      : { label: 'notify', href: newsletterPath, disabled: false };
  }

  const price = getDisplayPrice(product, today, currency);
  const checkoutUrl = checkoutUrlFor(product, currency);
  return price && price.amount > 0 && checkoutUrl
    ? { label: price.kind === 'intro' ? 'buy-intro' : 'buy', href: checkoutUrl, disabled: false }
    : { label: 'notify', href: newsletterPath, disabled: false };
}

export function getDisplayPrice(product: Product, today: Date, currency: Currency) {
  if (!product.publicPrice) return null;

  const regularAmount = currency === 'JPY' ? product.regularPriceJPY : product.regularPriceUSD;
  if (product.status !== 'intro-sale') return typeof regularAmount === 'number' && regularAmount > 0 ? { amount: regularAmount, kind: 'regular' as const } : null;

  const introEnd = product.introSaleEndDate && new Date(`${product.introSaleEndDate}T23:59:59Z`);
  if (!introEnd || Number.isNaN(introEnd.valueOf())) return null;

  const introActive = today <= introEnd;
  const amount = introActive
    ? currency === 'JPY' ? product.introPriceJPY : product.introPriceUSD
    : regularAmount;

  return typeof amount === 'number' && amount > 0 ? { amount, kind: introActive ? 'intro' as const : 'regular' as const } : null;
}

export function formatPrice(amount: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
