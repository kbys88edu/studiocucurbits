export type ProductStatus =
  | 'hidden'
  | 'announcement'
  | 'coming-soon'
  | 'beta'
  | 'demo-available'
  | 'intro-sale'
  | 'available'
  | 'discontinued';

export type Currency = 'JPY' | 'USD';
export type CollectionStatus = 'forthcoming' | 'available' | 'archived';

export interface PriceData {
  regularPriceJPY: number | null;
  regularPriceUSD: number | null;
  introPriceJPY: number | null;
  introPriceUSD: number | null;
  introSaleEndDate: string | null;
  publicPrice: boolean;
}

export interface EditorialContent {
  shortDescription: string | null;
  description: string | null;
  features: string[];
}

export interface ProductMedia {
  heroImage: string | null;
  gallery: string[];
  video: {
    status: 'in-production' | 'ready' | null;
    poster: string | null;
    mp4: string | null;
    webm: string | null;
    captions: string | null;
  };
  audioExamples: string[];
}

export interface Product extends PriceData {
  slug: string;
  name: string;
  collection: string | null;
  productType: string | null;
  status: ProductStatus;
  announcementDate: string | null;
  releaseDate: string | null;
  editorial: { en: EditorialContent; ja: EditorialContent };
  media: ProductMedia;
  supportedFormats: string[];
  supportedPlatforms: string[];
  compatibilityNotes: string | null;
  demoUrl: string | null;
  applicationUrl: string | null;
  downloadUrl: string | null;
  manualUrl: string | null;
  checkoutUrlJPY: string | null;
  checkoutUrlUSD: string | null;
  license: { name: string | null; url: string | null };
  support: { url: string | null; email: string | null };
  relatedProductSlugs: string[];
  seo: { title: string | null; description: string | null; image: string | null; keywords: string[] };
}

export interface Collection extends PriceData {
  slug: string;
  name: string;
  status: CollectionStatus;
  productSlugs: string[];
  includedCollectionSlugs: string[];
  releaseDate: string | null;
  editorial: { en: EditorialContent; ja: EditorialContent };
  heroImage: string | null;
  checkoutUrlJPY: string | null;
  checkoutUrlUSD: string | null;
  seo: { title: string | null; description: string | null; image: string | null; keywords: string[] };
}

const emptyEditorial = (): EditorialContent => ({ shortDescription: null, description: null, features: [] });
const emptySeo = () => ({ title: null, description: null, image: null, keywords: [] });
const noPrice: PriceData = {
  regularPriceJPY: null,
  regularPriceUSD: null,
  introPriceJPY: null,
  introPriceUSD: null,
  introSaleEndDate: null,
  publicPrice: false,
};

function product(
  slug: string,
  name: string,
  collection: string | null,
  status: ProductStatus,
  prices: Partial<PriceData> = {},
): Product {
  return {
    slug,
    name,
    collection,
    productType: null,
    status,
    announcementDate: null,
    releaseDate: null,
    editorial: { en: emptyEditorial(), ja: emptyEditorial() },
    ...noPrice,
    ...prices,
    media: { heroImage: null, gallery: [], video: { status: null, poster: null, mp4: null, webm: null, captions: null }, audioExamples: [] },
    supportedFormats: [],
    supportedPlatforms: [],
    compatibilityNotes: null,
    demoUrl: null,
    applicationUrl: null,
    downloadUrl: null,
    manualUrl: null,
    checkoutUrlJPY: null,
    checkoutUrlUSD: null,
    license: { name: null, url: null },
    support: { url: null, email: null },
    relatedProductSlugs: [],
    seo: emptySeo(),
  };
}

const tracesPrice = { regularPriceJPY: 4400, regularPriceUSD: 29, introPriceJPY: 2900, introPriceUSD: 19 };
const tendrilPrice = { regularPriceJPY: 4400, regularPriceUSD: 29, introPriceJPY: 2900, introPriceUSD: 19 };

export const products: Product[] = [
  product('hidden-prototype', 'Hidden prototype', null, 'hidden'),
  {
    ...product('palimpsest', 'SC Palimpsest', 'traces', 'hidden', tracesPrice),
    editorial: { en: { shortDescription: 'Sounds remain as overwritten spectral traces.', description: null, features: [] }, ja: { shortDescription: '上書きされたスペクトルの痕跡として音が残ります。', description: null, features: [] } },
  },
  {
    ...product('suspended', 'SC Suspended', 'traces', 'coming-soon', { ...tracesPrice, publicPrice: true }),
    productType: 'Granular suspension processor',
    editorial: {
      en: {
        shortDescription: 'A held sound continues to move internally.',
        description: 'Capture a sound and hold it in suspension. Grain size, density and internal movement remain active inside the frozen material.',
        features: ['Grain size', 'Density', 'Drift', 'Scatter', 'Breath', 'Fragility'],
      },
      ja: {
        shortDescription: '保たれた音が、内側で動き続けます。',
        description: '音を取り込み、宙づりのまま保持します。粒子の大きさ、密度、内部の動きは、凍結した素材の内側で活動し続けます。',
        features: [],
      },
    },
    media: {
      heroImage: '/images/products/contrast_SC_Hero_2560x1440.png',
      gallery: [],
      video: { status: null, poster: null, mp4: null, webm: null, captions: null },
      audioExamples: [],
    },
    checkoutUrlJPY: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_JPY?.trim() || null,
    checkoutUrlUSD: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_USD?.trim() || null,
    seo: {
      title: 'SC Suspended — Granular suspension processor | Studio Cucurbits.',
      description: 'SC Suspended is an artist-designed audio processor for holding sound in suspension while preserving internal granular motion.',
      image: '/images/products/contrast_SC_Hero_2560x1440.png',
      keywords: ['granular processor', 'audio effect', 'sound design'],
    },
  },
  {
    ...product('refraction', 'SC Refraction', 'traces', 'hidden', tracesPrice),
    editorial: { en: { shortDescription: 'Coherent spectral regions bend into new relationships.', description: null, features: [] }, ja: { shortDescription: 'まとまりあるスペクトル領域が、新しい関係へと曲がります。', description: null, features: [] } },
  },
  product('piano-string', 'SC Piano String', 'tendril', 'hidden', { regularPriceJPY: 2800, regularPriceUSD: 19, introPriceJPY: 1800, introPriceUSD: 12 }),
  product('gong', 'SC Gong', 'tendril', 'hidden'),
  product('flute', 'SC Flute', 'tendril', 'hidden', tendrilPrice),
  product('clarinet', 'SC Clarinet', 'tendril', 'hidden', tendrilPrice),
  product('trumpet', 'SC Trumpet', 'tendril', 'hidden', tendrilPrice),
  product('violin', 'SC Violin', 'tendril', 'hidden', { regularPriceJPY: 5900, regularPriceUSD: 39, introPriceJPY: 3900, introPriceUSD: 25 }),
  product('cello', 'SC Cello', 'tendril', 'hidden', { regularPriceJPY: 5900, regularPriceUSD: 39, introPriceJPY: 3900, introPriceUSD: 25 }),
  {
    ...product('vitreous', 'SC Vitreous', null, 'hidden', { regularPriceJPY: 5900, regularPriceUSD: 39, introPriceJPY: 3900, introPriceUSD: 25 }),
    productType: 'Material Studies',
    editorial: {
      en: {
        shortDescription: 'Turn dynamics and spectrum into impact, shards and luminous debris.',
        description: 'Input-derived fracture synthesizer',
        features: ['Procedural synthesis', 'No prerecorded glass samples', 'No AI or cloud processing', 'Input-derived fracture events'],
      },
      ja: {
        shortDescription: 'ダイナミクスとスペクトルを、衝撃、破片、光る残響へと変えます。',
        description: '入力から導かれるフラクチャー・シンセサイザー',
        features: ['プロシージャル・シンセシス', '録音済みガラスサンプル不使用', 'AI・クラウド処理不使用', '入力由来のフラクチャーイベント'],
      },
    },
  },
];

function collection(
  slug: string,
  name: string,
  productSlugs: string[],
  prices: Partial<PriceData>,
  includedCollectionSlugs: string[] = [],
): Collection {
  return {
    slug,
    name,
    status: 'forthcoming',
    productSlugs,
    includedCollectionSlugs,
    releaseDate: null,
    editorial: { en: emptyEditorial(), ja: emptyEditorial() },
    ...noPrice,
    ...prices,
    heroImage: null,
    checkoutUrlJPY: null,
    checkoutUrlUSD: null,
    seo: emptySeo(),
  };
}

export const collections: Collection[] = [
  {
    ...collection('traces', 'Traces', ['palimpsest', 'suspended', 'refraction'], { regularPriceJPY: 9800, regularPriceUSD: 69, introPriceJPY: 6900, introPriceUSD: 49 }),
    status: 'archived',
    editorial: {
      en: { shortDescription: 'Three processors for composing memory, suspension and spectral transformation.', description: null, features: [] },
      ja: { shortDescription: '記憶、サスペンション、スペクトル変換を作曲するための三つのプロセッサー。', description: null, features: [] },
    },
  },
  {
    ...collection('tendril', 'Tendril', ['piano-string', 'gong', 'flute', 'clarinet', 'trumpet', 'violin', 'cello'], { regularPriceJPY: 19800, regularPriceUSD: 139, introPriceJPY: 13800, introPriceUSD: 99 }),
    status: 'archived',
    editorial: {
      en: {
        shortDescription: 'Experimental physical models for strings, air columns, friction and resonant bodies.',
        description: 'Not a realistic emulation. Designed for unstable resonance, extended technique and non-idiomatic performance.',
        features: [],
      },
      ja: {
        shortDescription: '弦、気柱、摩擦、共鳴体のための実験的な物理モデル。',
        description: '現実的なエミュレーションではありません。不安定な共鳴、拡張奏法、非慣習的な演奏のために設計されています。',
        features: [],
      },
    },
  },
  collection('future-artist-collection', 'Future Artist Collection', [], { regularPriceJPY: 24800, regularPriceUSD: 169, introPriceJPY: 17800, introPriceUSD: 119 }, ['traces', 'tendril']),
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function isVisibleProduct(product: Product): boolean {
  return product.status !== 'hidden';
}

export function isVisibleCollection(collection: Collection): boolean {
  return collection.status !== 'archived' && Boolean(collection.editorial.en.shortDescription);
}
