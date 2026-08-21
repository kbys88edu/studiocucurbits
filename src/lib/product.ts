import type { Currency, LaunchContent, Product } from '../data/products';
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
    // The marketing strategy quotes $19 / $29, not $19.00. Keep the minimum at
    // zero so whole amounts stay clean while a fractional price still renders.
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export interface LaunchRelease {
  isReleased: boolean;
  canBuy: boolean;
  checkoutUrl: string | null;
  currency: Currency;
  introAmount: number | null;
  regularAmount: number | null;
  showIntroPrice: boolean;
  showRegularPrice: boolean;
  showNotify: boolean;
}

function positiveAmount(value: number | undefined): number | null {
  return typeof value === 'number' && value > 0 ? value : null;
}

/**
 * Resolves what the launch page may show about buying. Every field is derived
 * from launch.release, so a release is performed by editing that record alone.
 * An unset or non-https checkout URL always falls back to the notify route
 * rather than rendering a broken purchase button. Conversely, canBuy suppresses
 * every notify affordance on the page, so a release cannot leave a stale
 * "Notify me" link next to a working buy button.
 */
export function getLaunchRelease(launch: LaunchContent, locale: Locale): LaunchRelease {
  const currency = launch.release.currency[locale];
  const checkoutUrl = httpsUrl(launch.release.checkoutUrl[currency]);
  const introAmount = positiveAmount(launch.release.introPrice[currency]);
  const regularAmount = positiveAmount(launch.release.regularPrice[currency]);

  const canBuy = launch.release.showBuyButton && Boolean(checkoutUrl);

  return {
    isReleased: launch.release.releaseState === 'released',
    canBuy,
    checkoutUrl,
    currency,
    introAmount,
    regularAmount,
    showIntroPrice: launch.release.showPrice && introAmount !== null,
    showRegularPrice: launch.release.showPrice && regularAmount !== null,
    showNotify: !canBuy && launch.release.showNewsletterCTA,
  };
}

function httpsUrl(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}
