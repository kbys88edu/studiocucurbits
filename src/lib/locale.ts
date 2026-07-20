export const locales = ['en', 'ja'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocale(url: URL): Locale {
  const requestedLocale = url.searchParams.get('lang');
  return requestedLocale && isLocale(requestedLocale) ? requestedLocale : defaultLocale;
}
