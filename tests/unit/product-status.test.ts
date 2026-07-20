import { describe, expect, it } from 'vitest';
import type { Product } from '../../src/data/products';
import { getDisplayPrice, getProductCta } from '../../src/lib/product';

const introProduct = {
  status: 'intro-sale',
  publicPrice: true,
  introPriceUSD: 49,
  regularPriceUSD: 69,
  introSaleEndDate: '2026-08-15',
} as Product;

describe('status-driven pricing', () => {
  it('selects the configured intro price on its end date and regular price afterwards', () => {
    expect(getDisplayPrice(introProduct, new Date('2026-08-15T23:59:59Z'), 'USD')).toEqual({ amount: 49, kind: 'intro' });
    expect(getDisplayPrice(introProduct, new Date('2026-08-16T00:00:00Z'), 'USD')).toEqual({ amount: 69, kind: 'regular' });
  });

  it('withholds a price when sale-state data is incomplete or private', () => {
    expect(getDisplayPrice({ ...introProduct, introSaleEndDate: null }, new Date('2026-08-01'), 'USD')).toBeNull();
    expect(getDisplayPrice({ ...introProduct, introPriceUSD: null }, new Date('2026-08-01'), 'USD')).toBeNull();
    expect(getDisplayPrice({ ...introProduct, publicPrice: false }, new Date('2026-08-01'), 'USD')).toBeNull();
  });
});

describe('status-driven CTAs', () => {
  it('omits CTAs for hidden and discontinued products', () => {
    for (const status of ['hidden', 'discontinued'] as const) {
      expect(getProductCta({ status } as Product, new Date())).toBeNull();
    }
  });

  it('uses notify for announcement and coming-soon products', () => {
    for (const status of ['announcement', 'coming-soon'] as const) {
      expect(getProductCta({ status } as Product, new Date())).toMatchObject({ label: 'notify' });
    }
  });

  it('only offers a demo when a demo-available product has a URL', () => {
    expect(getProductCta({ status: 'demo-available', demoUrl: 'https://example.com/demo' } as Product, new Date())).toMatchObject({ label: 'demo' });
    expect(getProductCta({ status: 'demo-available', demoUrl: null } as Product, new Date())).toMatchObject({ label: 'notify' });
  });

  it('uses notify instead of a buy link when an available or intro-sale product has no checkout URL', () => {
    for (const status of ['available', 'intro-sale'] as const) {
      expect(getProductCta({ status, checkoutUrlUSD: '   ', demoUrl: 'https://example.com/demo' } as Product, new Date('2026-08-01'))).toMatchObject({ label: 'notify' });
    }
  });

  it('uses the checkout URL configured for the selected currency', () => {
    const product = { status: 'available', checkoutUrlJPY: 'https://example.com/jpy', checkoutUrlUSD: 'https://example.com/usd' } as Product;

    expect(getProductCta(product, new Date(), 'JPY')).toMatchObject({ label: 'buy', href: 'https://example.com/jpy' });
    expect(getProductCta(product, new Date(), 'USD')).toMatchObject({ label: 'buy', href: 'https://example.com/usd' });
  });

  it('prioritizes an application over a beta download and never returns an empty href', () => {
    expect(getProductCta({ status: 'beta', applicationUrl: 'https://example.com/apply', downloadUrl: 'https://example.com/download' } as Product, new Date())).toEqual({ label: 'apply', href: 'https://example.com/apply', disabled: false });
    expect(getProductCta({ status: 'beta', applicationUrl: null, downloadUrl: 'https://example.com/download' } as Product, new Date())).toEqual({ label: 'download', href: 'https://example.com/download', disabled: false });
    expect(getProductCta({ status: 'beta', applicationUrl: ' ', downloadUrl: ' ' } as Product, new Date())).toMatchObject({ label: 'notify' });
  });
});
