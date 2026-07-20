import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from '../../src/lib/analytics';

describe('analytics privacy', () => {
  const received: Array<{ event: string; props?: Record<string, string | number | boolean> }> = [];

  beforeEach(() => {
    vi.stubEnv('ANALYTICS_PROVIDER', 'plausible');
    vi.stubEnv('ANALYTICS_ID', 'site-id');
    (globalThis as { window?: Window }).window = {
      plausible: (event: string, options?: { props?: Record<string, string | number | boolean> }) => received.push({ event, props: options?.props }),
    } as unknown as Window;
  });

  afterEach(() => {
    received.length = 0;
    vi.unstubAllEnvs();
    delete (globalThis as { window?: Window }).window;
  });

  it('drops personal and unapproved custom properties', () => {
    trackEvent('audio_comparison_played', {
      variant: 'dry',
      userId: 'user-42',
      city: 'Seoul',
      message: 'hello',
      email: 'listener@example.com',
    });

    expect(received).toEqual([{ event: 'audio_comparison_played', props: { variant: 'dry' } }]);
  });
});
