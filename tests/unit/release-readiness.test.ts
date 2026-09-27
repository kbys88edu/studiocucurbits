import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';
import { formatPrice } from '../../src/lib/product';

const product = getProductBySlug('suspended')!;
const launch = product.launch!;
const released = launch.release.releaseState === 'released';

/**
 * Marketing strategy P12 PRODUCT requires the Windows / macOS / Linux wording to
 * match reality before release, and P12 COMMERCE requires a working checkout.
 * These assertions are inert while SC Suspended is pre-release and become the
 * release gate the moment launch.release.releaseState is flipped to 'released'.
 */
describe('SC Suspended release readiness', () => {
  it('quotes prices the way the strategy does', () => {
    expect(formatPrice(19, 'USD', 'en')).toBe('USD\u00a019');
    expect(formatPrice(29, 'USD', 'en')).toBe('USD\u00a029');
    expect(formatPrice(2900, 'JPY', 'ja')).toBe('￥2,900');
    expect(formatPrice(4400, 'JPY', 'ja')).toBe('￥4,400');
  });

  it('does not advertise an introductory discount or a second-currency price', () => {
    expect(launch.release.introPrice).toEqual({ USD: null, JPY: null });
    expect(launch.release.regularPrice).toEqual({ USD: 29, JPY: null });
  });

  it.runIf(released)('drops the alpha wording from platforms once released', () => {
    for (const platform of product.supportedPlatforms) {
      expect(platform.toLowerCase()).not.toContain('alpha');
    }
  });

  it.runIf(released)('drops the alpha wording from the published specifications once released', () => {
    for (const locale of ['en', 'ja'] as const) {
      for (const { value } of launch.specifications[locale]) {
        expect(value.toLowerCase()).not.toContain('alpha');
        expect(value).not.toContain('アルファ');
      }
    }
  });

  it.runIf(released)('never offers a buy button without the shared checkout URL', () => {
    if (!launch.release.showBuyButton) return;
    const url = launch.release.checkoutUrl;
    expect(url, 'missing shared checkout URL').toBeTruthy();
    expect(new URL(url!).protocol).toBe('https:');
  });

  it.runIf(released)('leaves the coming-soon status behind once released', () => {
    expect(product.status).not.toBe('coming-soon');
    expect(product.status).not.toBe('announcement');
  });

  it.runIf(!released)('withholds price and purchase while pre-release', () => {
    expect(launch.release.showPrice).toBe(false);
    expect(launch.release.showBuyButton).toBe(false);
    expect(launch.release.showNewsletterCTA).toBe(true);
  });
});
