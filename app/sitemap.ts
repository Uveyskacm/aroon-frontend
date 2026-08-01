import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getAllProductSlugs } from "@/lib/api/products";
import { getCatalogs } from "@/lib/api/catalogs";
import { getNews } from "@/lib/api/news";
import { getReferences } from "@/lib/api/references";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aroon.com.tr";

export const revalidate = 3600;

const STATIC_PATHS = [
  "/",
  "/about",
  "/mission-vision",
  "/management-approach",
  "/products",
  "/catalogs",
  "/news",
  "/references",
  "/quote",
  "/contact",
  "/kvkk",
  "/privacy",
  "/cookie",
] as const;

/** WP-driven, dynamic sitemap (Phase 7 §1) — excludes noindex-flagged items. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales as readonly Locale[]) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${getPathname({ locale, href: path })}`,
        changeFrequency: "weekly",
      });
    }
  }

  const [productSlugs, catalogsTr, catalogsEn, newsTr, newsEn, refsTr, refsEn] = await Promise.all([
    getAllProductSlugs(),
    getCatalogs("tr"),
    getCatalogs("en"),
    getNews("tr"),
    getNews("en"),
    getReferences("tr"),
    getReferences("en"),
  ]);

  for (const { slug, locale } of productSlugs) {
    entries.push({
      url: `${SITE_URL}/${locale}${getPathname({ locale, href: { pathname: "/products/[slug]", params: { slug } } })}`,
    });
  }

  const dynamicSets: [Locale, { slug: string; seo: { robots: { index: boolean } } }[]][] = [
    ["tr", catalogsTr],
    ["en", catalogsEn],
  ];
  for (const [locale, items] of dynamicSets) {
    for (const item of items) {
      if (!item.seo.robots.index) continue;
      entries.push({
        url: `${SITE_URL}/${locale}${getPathname({ locale, href: { pathname: "/catalogs/[slug]", params: { slug: item.slug } } })}`,
      });
    }
  }

  const newsSets: [Locale, { slug: string; seo: { robots: { index: boolean } } }[]][] = [
    ["tr", newsTr],
    ["en", newsEn],
  ];
  for (const [locale, items] of newsSets) {
    for (const item of items) {
      if (!item.seo.robots.index) continue;
      entries.push({
        url: `${SITE_URL}/${locale}${getPathname({ locale, href: { pathname: "/news/[slug]", params: { slug: item.slug } } })}`,
      });
    }
  }

  const refSets: [Locale, { slug: string; seo: { robots: { index: boolean } } }[]][] = [
    ["tr", refsTr],
    ["en", refsEn],
  ];
  for (const [locale, items] of refSets) {
    for (const item of items) {
      if (!item.seo.robots.index) continue;
      entries.push({
        url: `${SITE_URL}/${locale}${getPathname({ locale, href: { pathname: "/references/[slug]", params: { slug: item.slug } } })}`,
      });
    }
  }

  return entries;
}
