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

export type Localized<T> = { en: T; ja: T };

export interface LaunchContent {
  hero: Localized<{ tagline: string; description: string; concept: string }>;
  features: Array<Localized<{ title: string; description: string }>>;
  controls: { parameters: string[]; operations: string[] };
  uses: Localized<string[]>;
  comparison: { whatIs: string[]; whatIsNot: string[] };
  freezeRelease: Localized<{ title: string; paragraphs: string[] }>;
  presets: string[];
  specifications: Localized<Array<{ label: string; value: string }>>;
  beta: Localized<{ title: string; paragraphs: string[] }>;
  publicBeta: Localized<{ implementedTitle: string; implemented: string[]; comingTitle: string; coming: string[] }>;
  credits: { concept: string; publisher: string };
  support: Localized<{ intro: string; topics: string[]; bugReportTitle: string; bugReport: string[] }>;
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
  launch?: LaunchContent;
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
    launch: undefined,
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
    ...product('suspended', 'SC Suspended', 'traces', 'coming-soon', tracesPrice),
    productType: 'Granular suspension processor',
    editorial: {
      en: {
        shortDescription: 'Sound in suspension. A body still in motion.',
        description: 'SC Suspended holds incoming audio as a granular sound body, preserving subtle motion and change within it.',
        features: ['Grain size', 'Density', 'Drift', 'Scatter', 'Breath', 'Fragility'],
      },
      ja: {
        shortDescription: '浮遊する音。動き続ける身体。',
        description: 'SC Suspendedは、入力音を粒子状の音響体として空間に留め、その内側で微細な動きと変化を持続させるグラニュラー・エフェクトです。',
        features: [],
      },
    },
    media: {
      heroImage: '/images/products/SC_Suspended_mockup_20260722.png',
      gallery: [],
      video: { status: 'in-production', poster: null, mp4: null, webm: null, captions: null },
      audioExamples: [],
    },
    supportedFormats: ['VST3'],
    supportedPlatforms: ['Windows Beta'],
    checkoutUrlJPY: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_JPY?.trim() || null,
    checkoutUrlUSD: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_USD?.trim() || null,
    demoUrl: import.meta.env.SUSPENDED_DEMO_URL?.trim() || null,
    manualUrl: import.meta.env.SUSPENDED_MANUAL_URL?.trim() || null,
    seo: {
      title: 'SC Suspended — Granular audio effect | Studio Cucurbits.',
      description: 'SC Suspended is a live-input granular effect for holding sound in suspension while preserving internal motion.',
      image: '/images/products/SC_Suspended_mockup_20260722.png',
      keywords: ['granular processor', 'audio effect', 'sound design'],
    },
    launch: {
      hero: {
        en: {
          tagline: 'Sound in suspension. A body still in motion.',
          description: 'SC Suspended holds incoming audio as a granular sound body, preserving subtle motion and change within it.',
          concept: 'Freeze live input and hold it as a granular sound body whose internal motion continues over time.',
        },
        ja: {
          tagline: '浮遊する音。動き続ける身体。',
          description: 'SC Suspendedは、入力音を粒子状の音響体として空間に留め、その内側で微細な動きと変化を持続させるグラニュラー・エフェクトです。',
          concept: 'ライブ入力をFreezeで保持し、粒状再生によって、静止した音の内部に動きを生み出します。',
        },
      },
      features: [
        { en: { title: 'Freeze', description: 'Capture and hold incoming sound.' }, ja: { title: 'Freeze', description: '入力音を取り込み、そのまま保持します。' } },
        { en: { title: 'Release', description: 'Release the suspended material gradually.' }, ja: { title: 'Release', description: '保持した音を少しずつ解放します。' } },
        { en: { title: 'Grain / Density', description: 'Shape grain duration and population.' }, ja: { title: 'Grain / Density', description: '粒の長さと密度を調整します。' } },
        { en: { title: 'Drift', description: 'Move through the captured material.' }, ja: { title: 'Drift', description: '再生方向を変え、音の内部に移動感をつくります。' } },
        { en: { title: 'Scatter / Fragility', description: 'Introduce dispersion, instability and interrupted continuity.' }, ja: { title: 'Scatter / Fragility', description: '音の広がりや不安定さ、途切れを加えます。' } },
        { en: { title: 'Breath', description: 'Add slow, non-periodic expansion and contraction.' }, ja: { title: 'Breath', description: 'ゆっくりとした、周期に縛られない揺らぎを加えます。' } },
        { en: { title: 'Release Tail', description: 'Control the duration of the release tail.' }, ja: { title: 'Release Tail', description: '解放後の余韻を調整します。' } },
      ],
      controls: {
        parameters: ['Grain', 'Density', 'Drift', 'Scatter', 'Breath', 'Fragility', 'Release Tail'],
        operations: ['Freeze', 'Release'],
      },
      uses: {
        en: [
          'Transform voices and instruments into suspended textures',
          'Add delicate motion and fragility to synthesizer pads',
          'Turn field recordings into playable clouds of sound',
          'Create breaks, introductions and ambient layers',
          'Build sustained electroacoustic and installation material',
          'Preserve the resonant body after percussive attacks',
        ],
        ja: [
          'ボーカルや楽器のフレーズを、空間に漂うテクスチャへ変える',
          'シンセパッドに微細な動きと脆さを加える',
          'フィールドレコーディングを、演奏できる音の雲として扱う',
          '楽曲のブレイクやイントロ、アンビエントなレイヤーをつくる',
          '電子音響作品やインスタレーションの持続する素材をつくる',
          '打楽器のアタック後に残る共鳴を保持する',
        ],
      },
      comparison: {
        whatIs: ['A live-input granular effect', 'A sound-suspension instrument', 'A way to compose internal movement', 'Usable as a fully wet texture generator', 'A processor for instruments, voices and recorded environments'],
        whatIsNot: ['A conventional looper', 'A standard freeze plug-in', 'A generic granular delay', 'A static reverb', 'A realistic acoustic instrument emulation'],
      },
      freezeRelease: {
        en: {
          title: 'FREEZE / RELEASE',
          paragraphs: ['Freeze does not simply stop the sound.', 'It holds a portion of the input while grain size, density, position, scatter, breath and fragility continue to move inside it.', 'Release opens the suspended material gradually according to the Release Tail setting.'],
        },
        ja: {
          title: 'FREEZE / RELEASE',
          paragraphs: ['Freezeは、音をただ止めるための操作ではありません。', '入力音の一部を保持し、その内部で粒の大きさ、密度、位置、散らばり、呼吸、脆さが動き続けます。', 'Releaseは保持した音をすぐに消去せず、Release Tailに合わせて少しずつ解放します。'],
        },
      },
      presets: ['Almost Motionless', 'Frozen Distance', 'Fine Particles', 'Large Breath', 'Glass Suspension', 'Sudden Opening', 'Fragile Continuum', 'A Sound Held in Air'],
      specifications: {
        en: [
          { label: 'Product', value: 'SC Suspended' },
          { label: 'Type', value: 'Granular audio effect' },
          { label: 'Format', value: 'VST3' },
          { label: 'Channels', value: 'Stereo' },
          { label: 'Operations', value: 'Freeze / Release' },
          { label: 'Parameters', value: 'Grain, Density, Drift, Scatter, Breath, Fragility, Release Tail' },
          { label: 'Presets', value: '8 factory presets' },
          { label: 'Environment', value: 'Windows Beta' },
          { label: 'Status', value: 'Beta / Coming Soon' },
        ],
        ja: [
          { label: '製品名', value: 'SC Suspended' },
          { label: '種別', value: 'グラニュラー・エフェクト' },
          { label: '形式', value: 'VST3' },
          { label: 'チャンネル', value: 'ステレオ' },
          { label: '主な操作', value: 'Freeze / Release' },
          { label: '主なパラメーター', value: 'Grain, Density, Drift, Scatter, Breath, Fragility, Release Tail' },
          { label: 'プリセット', value: 'ファクトリープリセット 8種' },
          { label: '対応環境', value: 'Windows（ベータ版）' },
          { label: 'ステータス', value: 'ベータ版 / 近日公開' },
        ],
      },
      beta: {
        en: { title: 'BETA INFORMATION', paragraphs: ['SC Suspended is currently in beta.', 'The current build includes Freeze, granular playback, Release, factory preset loading and essential output-safety checks.', 'Sound behaviour, interface details, supported environments and parameter response may change during development.', 'Please verify operation in your own DAW and production environment before relying on the beta in critical work.'] },
        ja: { title: 'ベータ情報', paragraphs: ['SC Suspendedは現在ベータ版です。', '現在のビルドには、Freeze、粒状再生、Release、ファクトリープリセットの読み込み、基本的な出力安全チェックを実装しています。', '開発中は、音の振る舞い、インターフェース、対応環境、パラメーターの反応が変わる場合があります。', '重要な制作で利用する前に、お使いのDAWと制作環境で動作をご確認ください。'] },
      },
      publicBeta: {
        en: { implementedTitle: 'IMPLEMENTED IN THE CURRENT BETA', implemented: ['Live-input Freeze', 'Granular playback', 'Freeze / Release interaction', 'Grain and density control', 'Internal motion controls', 'Release Tail', '8 factory presets', 'Stereo VST3 processing', 'Essential output-safety checks'], comingTitle: 'COMING DURING BETA', coming: ['Sound refinements', 'UI refinements', 'Expanded environment testing', 'Improved parameter response', 'Documentation and installation guidance'] },
        ja: { implementedTitle: '現在のベータ版で利用できる機能', implemented: ['ライブ入力のFreeze', '粒状再生', 'Freeze / Releaseの操作', '粒と密度の調整', '音の内部の動きの調整', 'Release Tail', 'ファクトリープリセット 8種', 'ステレオVST3処理', '基本的な出力安全チェック'], comingTitle: 'ベータ期間中に予定している更新', coming: ['音の仕上げ', 'UIの調整', '対応環境の追加テスト', 'パラメーターの反応の改善', 'ドキュメントとインストール案内'] },
      },
      credits: { concept: 'Concept, sound design and artistic direction: Sachie Kobayashi', publisher: 'Developed and published by: Studio Cucurbits.' },
      support: {
        en: { intro: 'SC Suspended support guidance will expand with the beta. Use the checklist below when reporting a problem.', topics: ['Installation', 'Windows VST3 location', 'Rescan plug-ins', 'Supported format', 'Stereo operation', 'Factory preset loading', 'Reporting a bug', 'Uninstallation', 'Beta limitations'], bugReportTitle: 'INCLUDE WITH A BUG REPORT', bugReport: ['Windows version', 'DAW and version', 'SC Suspended version', 'Sample rate', 'Buffer size', 'Steps to reproduce', 'Screenshot', 'Crash log if available'] },
        ja: { intro: 'SC Suspendedのサポート情報は、ベータの進行に合わせて更新します。問題をご報告いただく際は、以下の項目をご用意ください。', topics: ['インストール', 'Windows VST3の場所', 'プラグインの再スキャン', '対応フォーマット', 'ステレオ動作', 'ファクトリープリセットの読み込み', '不具合の報告', 'アンインストール', 'ベータ版の制限'], bugReportTitle: 'バグ報告に含める情報', bugReport: ['Windowsのバージョン', 'DAW名とバージョン', 'SC Suspendedのバージョン', 'サンプルレート', 'バッファサイズ', '再現手順', 'スクリーンショット', '可能であればクラッシュログ'] },
      },
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
