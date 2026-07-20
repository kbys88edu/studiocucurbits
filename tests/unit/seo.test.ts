import { describe, expect, it } from 'vitest';
import type { Product } from '../../src/data/products';
import { getProductOffer } from '../../src/lib/seo';

const availableProduct = {
  status: 'available',
  publicPrice: true,
  regularPriceUSD: 29,
  checkoutUrlUSD: 'https://checkout.example.com/suspended',
} as Product;

describe('product structured data', () => {
  it('publishes an offer only for an available product with a valid HTTPS checkout URL', () => {
    expect(getProductOffer({ ...availableProduct, checkoutUrlUSD: 'not-a-url' })).toBeNull();
    expect(getProductOffer({ ...availableProduct, checkoutUrlUSD: 'mailto:orders@example.com' })).toBeNull();
    expect(getProductOffer(availableProduct)).toMatchObject({
      '@type': 'Offer',
      price: 29,
      priceCurrency: 'USD',
      url: 'https://checkout.example.com/suspended',
    });
  });
});
