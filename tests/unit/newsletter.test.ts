import { describe, expect, it } from 'vitest';
import { newsletterState, validateNewsletter } from '../../src/scripts/newsletter';

describe('newsletter validation', () => {
  it('returns an email error for an invalid address', () => {
    expect(validateNewsletter({ email: 'not-an-email' }).email).toBe('Enter a valid email address.');
  });

  it('reports an unconfigured newsletter instead of a success state', () => {
    expect(newsletterState()).toEqual({ status: 'unavailable', message: 'Newsletter signup is not configured yet.' });
  });

  it('localizes unavailable and validation messages for Japanese forms', () => {
    expect(newsletterState(undefined, 'ja')).toEqual({ status: 'unavailable', message: 'ニュースレターの登録は現在準備中です。' });
    expect(validateNewsletter({ email: 'not-an-email' }, 'ja').email).toBe('有効なメールアドレスを入力してください。');
  });
});
