import type { Product } from '../data/products';

export function getProductOffer(product: Product) {
  const checkoutUrl = product.checkoutUrlUSD?.trim();
  if (product.status !== 'available' || !product.publicPrice || typeof product.regularPriceUSD !== 'number' || product.regularPriceUSD <= 0 || !checkoutUrl) {
    return null;
  }

  try {
    const url = new URL(checkoutUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    return { '@type': 'Offer', price: product.regularPriceUSD, priceCurrency: 'USD', url: url.toString(), availability: 'https://schema.org/InStock' };
  } catch {
    return null;
  }
}
