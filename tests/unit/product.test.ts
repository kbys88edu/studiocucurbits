import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';
import { formatPrice, getDisplayPrice, getProductCta } from '../../src/lib/product';

describe('product CTA', () => {
  it('uses notification when a coming-soon product has no checkout URL', () => {
    expect(
      getProductCta(
        { status: 'coming-soon', checkoutUrlUSD: null } as never,
        new Date('2026-07-20'),
      ),
    ).toEqual({ label: 'notify', href: '/newsletter/', disabled: false });
  });

  it('does not error when a product has unknown fields', () => {
    expect(() =>
      getProductCta(
        {
          status: 'demo-available',
          checkoutUrlUSD: null,
          demoUrl: null,
        } as never,
        new Date('2026-07-20'),
      ),
    ).not.toThrow();
  });
});

it('formats configured JPY without conversion', () => {
  expect(formatPrice(4400, 'JPY', 'en')).toBe('¥4,400');
});

it('keeps an unknown video state unpublished', () => {
  expect(getProductBySlug('suspended')?.media.video.status).toBeNull();
});

it('does not expose a stored price before it is public', () => {
  const product = getProductBySlug('suspended');

  expect(product).toBeDefined();
  expect(getDisplayPrice(product!, new Date('2026-07-20'), 'JPY')).toBeNull();
});
