/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations, stripHtml } from "./adapters";
import { sortFeaturedFirst } from "./featured";
import type { Locale } from "@/i18n/routing";
import type { ReferenceItem } from "@/lib/types/wordpress";

function adaptReference(raw: any): ReferenceItem {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title?.rendered ?? ""),
    description: raw.content?.rendered ?? "",
    featuredImage: adaptMedia(raw._embedded?.["wp:featuredmedia"]?.[0]),
    gallery: (raw.gallery ?? []).map(adaptMedia).filter(Boolean),
    clientName: raw.client_name ?? "",
    projectLocation: raw.project_location ?? "",
    completionYear: raw.completion_year ?? null,
    featured: Boolean(raw.featured),
    featuredOrder: raw.featured_order ?? null,
    seo: adaptSeo(raw.seo),
    translations: adaptTranslations(raw.translations),
    lang: (raw.lang as Locale) ?? "tr",
  };
}

export async function getReferences(locale: Locale): Promise<ReferenceItem[]> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/reference?lang=${locale}&per_page=100&_embed=1`,
      { tags: ["references"] },
    );
    return raw.map(adaptReference);
  } catch {
    return [];
  }
}

export async function getReferenceBySlug(slug: string, locale: Locale): Promise<ReferenceItem | null> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/reference?slug=${encodeURIComponent(slug)}&lang=${locale}&_embed=1`,
      { tags: ["references", `reference:${slug}`] },
    );
    return raw.length ? adaptReference(raw[0]) : null;
  } catch {
    return null;
  }
}

export async function getFeaturedReferences(locale: Locale, count: number): Promise<ReferenceItem[]> {
  const all = await getReferences(locale);
  return sortFeaturedFirst(
    all.map((r) => ({ ...r, publishedAt: String(r.completionYear ?? "") })),
    count,
  );
}
