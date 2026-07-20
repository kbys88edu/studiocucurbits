import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '../../src/data/products';

describe('collection editorial copy', () => {
  it('stores the supplied Traces product summaries', () => {
    expect(getProductBySlug('palimpsest')?.editorial.en.shortDescription).toBe('Sounds remain as overwritten spectral traces.');
    expect(getProductBySlug('suspended')?.editorial.en.shortDescription).toBe('A held sound continues to move internally.');
    expect(getProductBySlug('refraction')?.editorial.en.shortDescription).toBe('Coherent spectral regions bend into new relationships.');
  });
});
