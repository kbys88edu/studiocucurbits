export const locales = ['en', 'ja'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocale(url: URL): Locale {
  return url.pathname === '/ja' || url.pathname.startsWith('/ja/') ? 'ja' : defaultLocale;
}

export function localizedPath(path: string, locale: Locale): string {
  const englishPath = path === '/ja/' || path === '/ja'
    ? '/'
    : path.startsWith('/ja/')
      ? path.slice(3)
      : path;

  return locale === 'ja'
    ? englishPath === '/' ? '/ja/' : `/ja${englishPath}`
    : englishPath;
}
