export interface BusinessArea {
  slug: string;
  title: string;
  description: string | null;
  href: string;
}

export interface LatestItem {
  type: 'instrument' | 'studio' | 'work';
  title: string;
  summary: string;
  summaryJa?: string;
  href: string;
  status: string | null;
  image: string | null;
}

export interface SiteData {
  name: string;
  businessAreas: BusinessArea[];
  supportEmail: string | null;
  pressEmail: string | null;
  socialLinks: { label: string; href: string }[];
}

export const site: SiteData = {
  name: 'Studio Cucurbits.',
  businessAreas: [
    { slug: 'composition-sound-design', title: 'Composition / Sound Design', description: null, href: '/work/' },
    { slug: 'creative-technology-ai-audio', title: 'Creative Technology / AI Audio', description: null, href: '/work/' },
    { slug: 'audio-instruments', title: 'Audio Instruments', description: null, href: '/products/' },
  ],
  supportEmail: null,
  pressEmail: null,
  socialLinks: [],
};

export const latestItem: LatestItem = {
  type: 'instrument',
  title: 'SC Suspended',
  summary: 'Sound in suspension. A body still in motion.',
  summaryJa: '浮遊する音。動き続ける身体。',
  href: '/products/suspended/',
  status: 'coming-soon',
  image: '/images/products/SC_Suspended_mockup_20260722.png',
};
