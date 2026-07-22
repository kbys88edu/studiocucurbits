import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';

describe('optional product data', () => {
  it('keeps SC Suspended compatibility and media unpublished while retaining supplied editorial copy', () => {
    const product = getProductBySlug('suspended');

    expect(product?.editorial.en.description).toBe(
      'SC Suspended holds incoming audio as a granular sound body, preserving subtle motion and change within it.',
    );
    expect(product?.supportedFormats).toEqual(['VST3']);
    expect(product?.supportedPlatforms).toEqual(['Windows Beta']);
    expect(product?.compatibilityNotes).toBeNull();
    expect(product?.media.audioExamples).toEqual([]);
    expect(product?.media.video.status).toBe('in-production');
    expect(product?.demoUrl).toBeNull();
  });
});
