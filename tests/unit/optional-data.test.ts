import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';

describe('optional product data', () => {
  it('keeps SC Suspended compatibility and media unpublished while retaining supplied editorial copy', () => {
    const product = getProductBySlug('suspended');

    expect(product?.editorial.en.description).toBe(
      'Capture a sound and hold it in suspension. Grain size, density and internal movement remain active inside the frozen material.',
    );
    expect(product?.supportedFormats).toEqual([]);
    expect(product?.supportedPlatforms).toEqual([]);
    expect(product?.compatibilityNotes).toBeNull();
    expect(product?.media.audioExamples).toEqual([]);
    expect(product?.media.video.status).toBeNull();
    expect(product?.demoUrl).toBeNull();
  });
});
