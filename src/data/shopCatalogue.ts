import { readFileSync } from 'node:fs';

type Localized = { en: string; ja: string };
type CatalogueProduct = {
  id: string; slug: string; visibility: string; summary: Localized; description: Localized;
  media: { hero: string | null; videos: unknown[]; audio: unknown[] };
  release: { installers: Array<{ url: string; os: string; architecture: string; format: string; pluginFormats?: string[]; minimumOsVersion?: string | null }>;
    testedRequirements: Array<{ en: string; ja: string }> } | null;
  downloadPageUrl: string; offerIds: string[];
};
type CatalogueOffer = {
  id: string; visibility: string; name: Localized; productIds: string[];
  price: { currency: string; amountMinor: number }; paddlePriceId: string | null;
};

const source = import.meta.env.SITE_CATALOGUE_FILE;
const mode = import.meta.env.MODE;
const catalogue = source ? JSON.parse(readFileSync(source, 'utf8')) : null;
if (catalogue && (catalogue.schema !== 'studio.cucurbits.site-catalogue.v1' ||
    (catalogue.preview && mode !== 'development' && mode !== 'sandbox') ||
    ((mode === 'development' || mode === 'sandbox') && catalogue.environment !== 'sandbox') ||
    (mode === 'production' && catalogue.environment !== 'live'))) {
  throw new Error('Invalid site catalogue for this build');
}

export const shopPreview = Boolean(catalogue?.preview);
export const suspendedShopProduct = (catalogue?.products as CatalogueProduct[] | undefined)?.find(({ id }) => id === 'suspended');
export const suspendedShopOffers = ((catalogue?.offers ?? []) as CatalogueOffer[])
  .filter(({ id }) => suspendedShopProduct?.offerIds.includes(id));
export const suspendedShopVisible = Boolean(suspendedShopProduct && (
  shopPreview && (mode === 'development' || mode === 'sandbox') ||
  suspendedShopProduct.visibility === 'public' && suspendedShopProduct.release?.installers.length
));
