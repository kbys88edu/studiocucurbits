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
  summary: 'A held sound that appears motionless while time continues to move inside it.',
  href: '/products/suspended/',
  status: 'coming soon',
  image: null,
};
