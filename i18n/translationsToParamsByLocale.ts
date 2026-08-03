import { routing, type Locale } from "@/i18n/routing";
import type { Translations } from "@/lib/types/wordpress";

/** Shared by every `[slug]` detail page to build `paramsByLocale` from a WP item's own `translations` map. */
export function translationsToParamsByLocale(
  translations: Translations,
): Partial<Record<Locale, Record<string, string> | null>> {
  const result: Partial<Record<Locale, Record<string, string> | null>> = {};
  for (const locale of routing.locales) {
    const entry = translations[locale];
    result[locale] = entry ? { slug: entry.slug } : null;
  }
  return result;
}
