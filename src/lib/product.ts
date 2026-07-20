import type { Currency, Product } from '../data/products';
import type { Locale } from './locale';

export interface ProductCta {
  label: 'buy' | 'buy-intro' | 'demo' | 'notify';
  href: string;
  disabled: false;
}

export function getProductCta(product: Product, _today: Date): ProductCta | null {
  if (product.status === 'hidden' || product.status === 'discontinued') return null;
  if (product.status === 'announcement' || product.status === 'coming-soon') {
    return { label: 'notify', href: '/newsletter/', disabled: false };
  }

  const checkoutUrl = product.checkoutUrlUSD?.trim();
  if ((product.status === 'available' || product.status === 'intro-sale') && checkoutUrl) {
    return { label: product.status === 'intro-sale' ? 'buy-intro' : 'buy', href: checkoutUrl, disabled: false };
  }

  const demoUrl = product.demoUrl?.trim();
  return demoUrl
    ? { label: 'demo', href: demoUrl, disabled: false }
    : { label: 'notify', href: '/newsletter/', disabled: false };
}

export function getDisplayPrice(product: Product, today: Date, currency: Currency) {
  const introEnd = product.introSaleEndDate ? new Date(`${product.introSaleEndDate}T23:59:59Z`) : null;
  const introActive = product.status === 'intro-sale' && introEnd !== null && today <= introEnd;
  const amount = introActive
    ? currency === 'JPY' ? product.introPriceJPY : product.introPriceUSD
    : currency === 'JPY' ? product.regularPriceJPY : product.regularPriceUSD;

  return amount === null ? null : { amount, kind: introActive ? 'intro' as const : 'regular' as const };
}

export function formatPrice(amount: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
