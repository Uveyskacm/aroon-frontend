/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations, stripHtml } from "./adapters";
import { sortFeaturedFirst } from "./featured";
import type { Locale } from "@/i18n/routing";
import type { NewsItem } from "@/lib/types/wordpress";

function adaptNews(raw: any): NewsItem {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title?.rendered ?? ""),
    excerpt: stripHtml(raw.excerpt?.rendered ?? ""),
    content: raw.content?.rendered ?? "",
    featuredImage: adaptMedia(raw._embedded?.["wp:featuredmedia"]?.[0]),
    publishedAt: raw.date ?? "",
    featured: Boolean(raw.featured),
    featuredOrder: raw.featured_order ?? null,
    seo: adaptSeo(raw.seo),
    translations: adaptTranslations(raw.translations),
    lang: (raw.lang as Locale) ?? "tr",
  };
}

export async function getNews(locale: Locale): Promise<NewsItem[]> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/news?lang=${locale}&per_page=100&_embed=1`,
      { tags: ["news"] },
    );
    return raw.map(adaptNews);
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string, locale: Locale): Promise<NewsItem | null> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/news?slug=${encodeURIComponent(slug)}&lang=${locale}&_embed=1`,
      { tags: ["news", `news:${slug}`] },
    );
    return raw.length ? adaptNews(raw[0]) : null;
  } catch {
    return null;
  }
}

export async function getFeaturedNews(locale: Locale, count: number): Promise<NewsItem[]> {
  const all = await getNews(locale);
  return sortFeaturedFirst(all, count);
}
