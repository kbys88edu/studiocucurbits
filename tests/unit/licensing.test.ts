import { expect, test } from 'vitest';
import { licensingBase } from '../../src/lib/licensing';

test('licensing requires an explicit production Tokyo API, with staging only in local development', () => {
  const api = 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com';
  expect(licensingBase(`${api}/production/`)).toBe(`${api}/production`);
  expect(licensingBase(`${api}/staging`, true)).toBe(`${api}/staging`);
  for (const input of [undefined, '', `${api}/staging`, 'https://evil.test/production',
    `${api}/production?token=x`, `${api}/production#x`, `${api}/production/extra`, `https://user@abcdefghij.execute-api.ap-northeast-1.amazonaws.com/production`]) {
    expect(licensingBase(input)).toBe('');
  }
});
