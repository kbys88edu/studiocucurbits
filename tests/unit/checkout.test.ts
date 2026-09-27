import { describe, expect, it } from 'vitest';
import { resolveCheckout } from '../../src/lib/checkout';

const sandbox = `test_${'a'.repeat(27)}`;
const live = `live_${'b'.repeat(27)}`;

describe('checkout build boundary', () => {
  it('enables sandbox checkout only in an explicitly labelled sandbox build', () => {
    expect(resolveCheckout(sandbox, 'sandbox', 'sandbox')).toMatchObject({
      url: 'https://www.studiocucurbits.com/purchase/suspended/', sandbox: true,
      token: sandbox, priceId: 'pri_01m3eaewadnm7grc2armnnkbsr',
    });
    for (const mode of ['production', 'development', 'test']) {
      expect(resolveCheckout(sandbox, 'sandbox', mode).url).toBeNull();
      expect(resolveCheckout(sandbox, 'sandbox', mode).token).toBeNull();
    }
  });

  it('fails closed for missing configuration or the wrong Paddle environment', () => {
    for (const token of [undefined, '', live, 'pdl_sdbx_apikey_private',
      'https://sandbox-pay.paddle.io/hsc_test', `test_${'a'.repeat(26)}`, `${sandbox}\"`]) {
      expect(resolveCheckout(token, 'sandbox', 'sandbox').url).toBeNull();
      expect(resolveCheckout(token, 'sandbox', 'sandbox').token).toBeNull();
    }
    expect(resolveCheckout(live, undefined, 'production').url).toBeNull();
    expect(resolveCheckout(sandbox, 'live', 'production').url).toBeNull();
    expect(resolveCheckout(live, 'live', 'sandbox').url).toBeNull();
    expect(resolveCheckout(live, 'live', 'production')).toMatchObject({
      sandbox: false, token: live, priceId: 'pri_01m3ghef9jmn9tx2f7ja5z62he',
    });
  });
});
