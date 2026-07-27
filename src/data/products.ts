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
const websiteMedia = (individual: string, centre: string, extraCentre: string[] = []): ProductMedia => ({
  heroImage: `/images/products/website/individual/${individual}.png`,
  gallery: [`/images/products/centre/${centre}.png`, ...extraCentre.map((asset) => `/images/products/centre/${asset}.png`)],
  video: { status: null, poster: null, mp4: null, webm: null, captions: null },
  audioExamples: [],
});

export const products: Product[] = [
  product('hidden-prototype', 'Hidden prototype', null, 'hidden'),
  {
    ...product('palimpsest', 'SC Palimpsest', 'traces', 'hidden', tracesPrice),
    editorial: { en: { shortDescription: 'Sounds remain as overwritten spectral traces.', description: null, features: [] }, ja: { shortDescription: '上書きされたスペクトルの痕跡として音が残ります。', description: null, features: [] } },
    media: websiteMedia('traces_palimpsest', 'central_sc_palimpsest'),
  },
  {
    ...product('suspended', 'SC Suspended', 'traces', 'coming-soon', tracesPrice),
    productType: 'Granular suspension processor',
    editorial: {
      en: {
        shortDescription: 'Sound in suspension. A body still in motion.',
        description: 'SC Suspended holds incoming audio as a granular sound body, preserving subtle motion and change within it.',
        features: ['Grain', 'Density', 'Drift', 'Spread', 'Agitation', 'Grain Skip', 'Release Tail', 'Mix', 'Output'],
      },
      ja: {
        shortDescription: '浮遊する音。動き続ける身体。',
        description: 'SC Suspendedは、入力音を粒子状の音響体として空間に留め、その内側で微細な動きと変化を持続させるグラニュラー・エフェクトです。',
        features: ['Grain', 'Density', 'Drift', 'Spread', 'Agitation', 'Grain Skip', 'Release Tail', 'Mix', 'Output'],
      },
    },
    media: { ...websiteMedia('traces_suspended', 'central_sc_suspended'), video: { status: 'in-production', poster: null, mp4: null, webm: null, captions: null } },
    supportedFormats: ['VST3'],
    supportedPlatforms: ['Windows Beta'],
    checkoutUrlJPY: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_JPY?.trim() || null,
    checkoutUrlUSD: import.meta.env.STRIPE_SUSPENDED_PAYMENT_LINK_USD?.trim() || null,
    demoUrl: import.meta.env.SUSPENDED_DEMO_URL?.trim() || null,
    manualUrl: import.meta.env.SUSPENDED_MANUAL_URL?.trim() || null,
    seo: {
      title: 'SC Suspended — Granular audio effect | Studio Cucurbits.',
      description: 'SC Suspended is a live-input granular effect for holding sound in suspension while preserving internal motion.',
      image: '/images/products/website/individual/traces_suspended.png',
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
        { en: { title: 'Grain', description: '8–1200 ms. Smaller values create shorter, finer grains; larger values create longer, larger grains.' }, ja: { title: 'Grain', description: '8–1200 ms。小さい値ほど短く細かいグレイン、大きい値ほど長く大きいグレインになります。' } },
        { en: { title: 'Density', description: '0.5–90 gr/s. Sets grain generation density; the centre animation changes across ten density steps.' }, ja: { title: 'Density', description: '0.5–90 gr/s。グレインの発生密度を設定し、中央アニメーションは10段階で変化します。' } },
        { en: { title: 'Drift', description: 'Move the playback position through frozen sound. Left moves backward; right moves forward.' }, ja: { title: 'Drift', description: 'Freezeした音の再生位置を移動します。左で逆方向、右で順方向に動きます。' } },
        { en: { title: 'Spread', description: 'Widen grain start position, length and stereo position; the mesh spacing also expands during Freeze.' }, ja: { title: 'Spread', description: 'グレインの開始位置・長さ・ステレオ位置を広げ、Freeze中はメッシュ間隔も拡大します。' } },
        { en: { title: 'Agitation', description: 'Vary grain density over time; during Freeze, each fragment moves irregularly.' }, ja: { title: 'Agitation', description: 'グレイン密度を時間的に揺らし、Freeze中は分割片ごとに不規則に動かします。' } },
        { en: { title: 'Grain Skip', description: 'Probabilistically omit grains; during Freeze, the divided mesh fades away step by step.' }, ja: { title: 'Grain Skip', description: 'グレインを確率的に省略し、Freeze中の分割メッシュも段階的に消します。' } },
        { en: { title: 'Release Tail', description: 'Sets the time to return from frozen sound to live input: approximately 80 ms–6 s.' }, ja: { title: 'Release Tail', description: 'Freeze音から入力音へ戻る時間を設定します。約80 ms–6 sです。' } },
        { en: { title: 'Mix', description: 'Dry/Wet balance.' }, ja: { title: 'Mix', description: 'Dry/Wetバランスを調整します。' } },
        { en: { title: 'Output', description: 'Output gain from −24 to +12 dB.' }, ja: { title: 'Output', description: '出力ゲインを−24〜+12 dBで調整します。' } },
      ],
      controls: {
        parameters: ['Grain', 'Density', 'Drift', 'Spread', 'Agitation', 'Grain Skip', 'Release Tail', 'Mix', 'Output', 'Attack Threshold'],
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
          paragraphs: ['Freeze holds the sound rather than simply stopping it.', 'When Attack is enabled, each detected input attack re-captures and re-triggers the sound using Attack Threshold from −60 to −6 dB, with a default of −42 dB.', 'Only during Freeze does the mesh divide: each grain is shown with a closed perimeter, while normal playback uses a continuous mesh.', 'Release returns to live input over the Release Tail setting.'],
        },
        ja: {
          title: 'FREEZE / RELEASE',
          paragraphs: ['Freezeは音をただ止めるのではなく、音を保持します。', 'Attackを有効にすると、入力アタックを検出するたびに再キャプチャ・再トリガーします。Attack Thresholdは−60〜−6 dB、初期値は−42 dBです。', 'メッシュが分割されるのはFreeze中のみで、各グレインの外周は閉じて表示されます。通常再生時は連続メッシュです。', 'ReleaseはRelease Tailの時間でライブ入力へ戻ります。'],
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
          { label: 'Grain', value: '8–1200 ms' },
          { label: 'Density', value: '0.5–90 gr/s' },
          { label: 'Drift', value: 'Frozen playback position, left backward / right forward' },
          { label: 'Spread', value: 'Grain position, length and stereo spread' },
          { label: 'Agitation', value: 'Time-varying density and irregular Freeze fragment motion' },
          { label: 'Grain Skip', value: 'Probabilistic grain omission' },
          { label: 'Release Tail', value: 'Approximately 80 ms–6 s' },
          { label: 'Mix', value: 'Dry/Wet' },
          { label: 'Output', value: '−24 to +12 dB' },
          { label: 'Attack Threshold', value: '−60 to −6 dB (default −42 dB)' },
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
          { label: 'Grain', value: '8–1200 ms' },
          { label: 'Density', value: '0.5–90 gr/s' },
          { label: 'Drift', value: 'Freezeした再生位置。左で逆方向、右で順方向' },
          { label: 'Spread', value: 'グレインの位置・長さ・ステレオ位置の広がり' },
          { label: 'Agitation', value: '時間的な密度変化とFreeze中の不規則な分割片の動き' },
          { label: 'Grain Skip', value: 'グレインの確率的な省略' },
          { label: 'Release Tail', value: '約80 ms–6 s' },
          { label: 'Mix', value: 'Dry/Wet' },
          { label: 'Output', value: '−24〜+12 dB' },
          { label: 'Attack Threshold', value: '−60〜−6 dB（初期値−42 dB）' },
          { label: 'プリセット', value: 'ファクトリープリセット 8種' },
          { label: '対応環境', value: 'Windows（ベータ版）' },
          { label: 'ステータス', value: 'ベータ版 / 近日公開' },
        ],
      },
      beta: {
        en: { title: 'BETA INFORMATION', paragraphs: ['SC Suspended is currently in beta.', 'The current build includes Freeze, granular playback, Release, factory preset loading and essential output-safety checks.', 'During Freeze, the mesh divides into closed-perimeter grain fragments; normal playback uses a continuous mesh. The centre animation uses Y-axis rotation only, with no zoom in or zoom out.', 'Sound behaviour, interface details, supported environments and parameter response may change during development.', 'Please verify operation in your own DAW and production environment before relying on the beta in critical work.'] },
        ja: { title: 'ベータ情報', paragraphs: ['SC Suspendedは現在ベータ版です。', '現在のビルドには、Freeze、粒状再生、Release、ファクトリープリセットの読み込み、基本的な出力安全チェックを実装しています。', 'Freeze中はメッシュが分割され、各グレインの外周は閉じて表示されます。通常再生時は連続メッシュです。中央アニメーションはY軸回転のみで、ズームイン／ズームアウトはありません。', '開発中は、音の振る舞い、インターフェース、対応環境、パラメーターの反応が変わる場合があります。', '重要な制作で利用する前に、お使いのDAWと制作環境で動作をご確認ください。'] },
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
    media: websiteMedia('traces_refraction', 'central_sc_refraction'),
  },
  { ...product('piano-string', 'SC Piano String', 'tendril', 'hidden', { regularPriceJPY: 2800, regularPriceUSD: 19, introPriceJPY: 1800, introPriceUSD: 12 }), media: websiteMedia('single_piano_string', 'central_sc_piano_string') },
  { ...product('gong', 'SC Gong', 'tendril', 'hidden'), media: websiteMedia('tendril_gong', 'central_sc_gong') },
  { ...product('flute', 'SC Flute', 'tendril', 'hidden', tendrilPrice), media: websiteMedia('tendril_flute', 'central_sc_flute') },
  { ...product('clarinet', 'SC Clarinet', 'tendril', 'hidden', tendrilPrice), media: websiteMedia('tendril_clarinet', 'central_sc_clarinet') },
  { ...product('trumpet', 'SC Trumpet', 'tendril', 'hidden', tendrilPrice), media: websiteMedia('tendril_trumpet', 'central_sc_trumpet') },
  { ...product('violin', 'SC Violin', 'tendril', 'hidden', { regularPriceJPY: 5900, regularPriceUSD: 39, introPriceJPY: 3900, introPriceUSD: 25 }), media: websiteMedia('tendril_violin_v2', 'central_sc_violin_v3', ['central_sc_violin_v2']) },
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
    media: websiteMedia('material_study_01_vitreous', 'central_sc_vitreous'),
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
    heroImage: '/images/products/website/bundles/traces.png',
    editorial: {
      en: { shortDescription: 'Three processors for composing memory, suspension and spectral transformation.', description: null, features: [] },
      ja: { shortDescription: '記憶、サスペンション、スペクトル変換を作曲するための三つのプロセッサー。', description: null, features: [] },
    },
  },
  {
    ...collection('tendril', 'Tendril', ['piano-string', 'gong', 'flute', 'clarinet', 'trumpet', 'violin', 'cello'], { regularPriceJPY: 19800, regularPriceUSD: 139, introPriceJPY: 13800, introPriceUSD: 99 }),
    status: 'archived',
    heroImage: '/images/products/website/bundles/tendril.png',
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
  { ...collection('future-artist-collection', 'Future Artist Collection', [], { regularPriceJPY: 24800, regularPriceUSD: 169, introPriceJPY: 17800, introPriceUSD: 119 }, ['traces', 'tendril']), heroImage: '/images/products/website/bundles/material_study_01.png' },
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
