import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import type { Seo, Translations } from "@/lib/types/wordpress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aroon.com.tr";

interface ResolveMetadataArgs {
  seo: Seo | null | undefined;
  locale: Locale;
  pathname: string;
  translations?: Translations;
  fallbackTitle?: string;
}

/**
 * The one place canonical/robots/OG resolution happens (Phase 7 §1).
 * Canonical precedence: only trust Yoast's stored canonical when an editor
 * explicitly set it (canonicalIsExplicit) — otherwise Next.js computes its
 * own canonical from the current locale+route, since Yoast's own computed
 * default would incorrectly point at cms.aroon.com.tr (Phase 1 §4).
 */
export function resolveMetadata({
  seo,
  locale,
  pathname,
  translations = {},
  fallbackTitle,
}: ResolveMetadataArgs): Metadata {
  const selfUrl = `${SITE_URL}/${locale}${pathname}`;
  const canonical =
    seo?.canonicalIsExplicit && seo.canonicalUrl ? seo.canonicalUrl : selfUrl;

  const languages: Record<string, string> = {};
  for (const [lang, entry] of Object.entries(translations)) {
    if (entry) {
      languages[lang] = `${SITE_URL}/${lang}${pathname}`;
    }
  }
  if (languages.tr) {
    languages["x-default"] = languages.tr;
  }

  const robotsIndex = seo?.robots?.index ?? true;
  const robotsFollow = seo?.robots?.follow ?? true;

  return {
    title: seo?.title || fallbackTitle,
    description: seo?.metaDescription || undefined,
    alternates: {
      canonical,
      languages: Object.keys(languages).length ? languages : undefined,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    openGraph: {
      title: seo?.title || fallbackTitle,
      description: seo?.metaDescription || undefined,
      url: selfUrl,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
      locale,
    },
  };
}
