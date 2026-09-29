import { describe, expect, it } from 'vitest';
import { resolveCheckout } from '../../src/lib/checkout';

const sandbox = `test_${'a'.repeat(27)}`;
const live = `live_${'b'.repeat(27)}`;
const sandboxPrice = 'pri_01m3eaewadnm7grc2armnnkbsr';
const livePrice = 'pri_01m3ghef9jmn9tx2f7ja5z62he';

describe('checkout build boundary', () => {
  it('enables catalogue-priced sandbox checkout in a private build or local preview', () => {
    expect(resolveCheckout(sandbox, 'sandbox', 'sandbox', sandboxPrice)).toMatchObject({
      url: 'https://www.studiocucurbits.com/purchase/suspended/', sandbox: true,
      token: sandbox, priceId: sandboxPrice,
    });
    expect(resolveCheckout(sandbox, 'sandbox', 'development', sandboxPrice).sandbox).toBe(true);
    for (const mode of ['production', 'test']) {
      expect(resolveCheckout(sandbox, 'sandbox', mode, sandboxPrice).url).toBeNull();
      expect(resolveCheckout(sandbox, 'sandbox', mode, sandboxPrice).token).toBeNull();
    }
  });

  it('fails closed for missing configuration or the wrong Paddle environment', () => {
    for (const token of [undefined, '', live, 'pdl_sdbx_apikey_private',
      'https://sandbox-pay.paddle.io/hsc_test', `test_${'a'.repeat(26)}`, `${sandbox}\"`]) {
      expect(resolveCheckout(token, 'sandbox', 'sandbox', sandboxPrice).url).toBeNull();
      expect(resolveCheckout(token, 'sandbox', 'sandbox', sandboxPrice).token).toBeNull();
    }
    expect(resolveCheckout(sandbox, 'sandbox', 'sandbox', null).url).toBeNull();
    expect(resolveCheckout(live, undefined, 'production', livePrice).url).toBeNull();
    expect(resolveCheckout(sandbox, 'live', 'production', livePrice).url).toBeNull();
    expect(resolveCheckout(live, 'live', 'sandbox', livePrice).url).toBeNull();
    expect(resolveCheckout(live, 'live', 'production', livePrice)).toMatchObject({
      sandbox: false, token: live, priceId: livePrice,
    });
  });
});
