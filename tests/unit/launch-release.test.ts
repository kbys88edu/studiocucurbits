import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';
import { getLaunchRelease } from '../../src/lib/product';

function launchWith(release: Record<string, unknown>) {
  return {
    release: {
      releaseState: 'pre-release',
      showPrice: false,
      showBuyButton: false,
      introPrice: { JPY: 2900, USD: 19 },
      regularPrice: { JPY: 4400, USD: 29 },
      currency: { en: 'USD', ja: 'JPY' },
      checkoutUrl: { JPY: null, USD: null },
      ...release,
    },
  } as never;
}

describe('launch release state', () => {
  it('withholds the purchase route while SC Suspended is pre-release', () => {
    const product = getProductBySlug('suspended');
    const release = getLaunchRelease(product!.launch!, 'en');

    expect(release.isReleased).toBe(false);
    expect(release.canBuy).toBe(false);
    expect(release.showIntroPrice).toBe(false);
    expect(release.showRegularPrice).toBe(false);
  });

  it('opens the purchase route once the release record is flipped', () => {
    const release = getLaunchRelease(launchWith({
      releaseState: 'released',
      showPrice: true,
      showBuyButton: true,
      checkoutUrl: { JPY: 'https://buy.stripe.com/jpy', USD: 'https://buy.stripe.com/usd' },
    }), 'en');

    expect(release.isReleased).toBe(true);
    expect(release.canBuy).toBe(true);
    expect(release.checkoutUrl).toBe('https://buy.stripe.com/usd');
    expect(release.introAmount).toBe(19);
    expect(release.regularAmount).toBe(29);
  });

  it('selects the Japanese currency and checkout URL for the Japanese page', () => {
    const release = getLaunchRelease(launchWith({
      releaseState: 'released',
      showPrice: true,
      showBuyButton: true,
      checkoutUrl: { JPY: 'https://buy.stripe.com/jpy', USD: 'https://buy.stripe.com/usd' },
    }), 'ja');

    expect(release.currency).toBe('JPY');
    expect(release.checkoutUrl).toBe('https://buy.stripe.com/jpy');
    expect(release.introAmount).toBe(2900);
  });

  it('refuses to show a buy button without a usable https checkout URL', () => {
    for (const url of [null, '', '   ', 'http://buy.example.com', 'not a url']) {
      const release = getLaunchRelease(launchWith({
        releaseState: 'released',
        showBuyButton: true,
        checkoutUrl: { JPY: url, USD: url },
      }), 'en');

      expect(release.canBuy).toBe(false);
      expect(release.checkoutUrl).toBeNull();
    }
  });

  it('keeps prices hidden when showPrice is off even after release', () => {
    const release = getLaunchRelease(launchWith({
      releaseState: 'released',
      showPrice: false,
      showBuyButton: true,
      checkoutUrl: { JPY: 'https://buy.stripe.com/jpy', USD: 'https://buy.stripe.com/usd' },
    }), 'en');

    expect(release.canBuy).toBe(true);
    expect(release.showIntroPrice).toBe(false);
    expect(release.showRegularPrice).toBe(false);
  });
});
