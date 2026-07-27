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

it('keeps the in-production video unpublished until a source exists', () => {
  expect(getProductBySlug('suspended')?.media.video.status).toBe('in-production');
  expect(getProductBySlug('suspended')?.media.video.mp4).toBeNull();
});

it('withholds the configured price for SC Suspended until launch', () => {
  const product = getProductBySlug('suspended');

  expect(product).toBeDefined();
  expect(getDisplayPrice(product!, new Date('2026-07-20'), 'JPY')).toBeNull();
});

it('stores the approved suspended launch content in one product record', () => {
  const launch = getProductBySlug('suspended')?.launch;

  expect(launch?.hero.en.tagline).toBe('Sound in suspension. A body still in motion.');
  expect(launch?.hero.ja.tagline).toBe('浮遊する音。動き続ける身体。');
  expect(launch?.controls.parameters).toHaveLength(10);
  expect(launch?.presets).toHaveLength(8);
  expect(launch?.publicBeta.en.implemented).toContain('Live-input Freeze');
});

it('stores the current SC Suspended control names and ranges', () => {
  const launch = getProductBySlug('suspended')?.launch;
  const featureTitles = launch?.features.map(({ en }) => en.title);
  const parameterNames = launch?.controls.parameters;
  const specifications = launch?.specifications.en.map(({ label, value }) => `${label}: ${value}`);

  expect(featureTitles).toEqual(['Grain', 'Density', 'Drift', 'Spread', 'Agitation', 'Grain Skip', 'Release Tail', 'Mix', 'Output']);
  expect(parameterNames).toEqual(['Grain', 'Density', 'Drift', 'Spread', 'Agitation', 'Grain Skip', 'Release Tail', 'Mix', 'Output', 'Attack Threshold']);
  expect(specifications).toEqual(expect.arrayContaining([
    'Grain: 8–1200 ms',
    'Density: 0.5–90 gr/s',
    'Release Tail: Approximately 80 ms–6 s',
    'Attack Threshold: −60 to −6 dB (default −42 dB)',
    'Mix: Dry/Wet',
    'Output: −24 to +12 dB',
  ]));
});

it('describes the current freeze mesh and retrigger behaviour', () => {
  const launch = getProductBySlug('suspended')?.launch;
  const paragraphs = launch?.freezeRelease.en.paragraphs.join(' ');
  const beta = launch?.beta.en.paragraphs.join(' ');

  expect(paragraphs).toContain('Attack Threshold');
  expect(paragraphs).toContain('Freeze holds the sound');
  expect(paragraphs).toContain('Release returns to live input over the Release Tail');
  expect(beta).toContain('Y-axis rotation only');
  expect(beta).toContain('closed-perimeter');
});
