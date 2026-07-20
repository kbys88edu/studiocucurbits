import { en } from './en';
import { ja } from './ja';
import { defaultLocale, type Locale } from '../lib/locale';

export const dictionaries = { en, ja } as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale];
}
