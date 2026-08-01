/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations, stripHtml } from "./adapters";
import { sortFeaturedFirst } from "./featured";
import type { Locale } from "@/i18n/routing";
import type { Catalog } from "@/lib/types/wordpress";

function adaptCatalog(raw: any): Catalog {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title?.rendered ?? ""),
    excerpt: stripHtml(raw.excerpt?.rendered ?? ""),
    coverImage: adaptMedia(raw._embedded?.["wp:featuredmedia"]?.[0]),
    pdfUrl: raw.pdf_file_url ?? null,
    fileSize: raw.file_size ?? null,
    lastUpdated: raw.last_updated ?? raw.modified ?? "",
    featured: Boolean(raw.featured),
    featuredOrder: raw.featured_order ?? null,
    seo: adaptSeo(raw.seo),
    translations: adaptTranslations(raw.translations),
    lang: (raw.lang as Locale) ?? "tr",
  };
}

/**
 * PDF-gating is enforced server-side by WP (Phase 1 §3 rest_catalog_query
 * filter) — this client trusts the collection response is already gated,
 * it does not re-filter.
 */
export async function getCatalogs(locale: Locale): Promise<Catalog[]> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/catalog?lang=${locale}&per_page=100&_embed=1`,
      { tags: ["catalogs"] },
    );
    return raw.map(adaptCatalog);
  } catch {
    return [];
  }
}

export async function getCatalogBySlug(slug: string, locale: Locale): Promise<Catalog | null> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/catalog?slug=${encodeURIComponent(slug)}&lang=${locale}&_embed=1`,
      { tags: ["catalogs", `catalog:${slug}`] },
    );
    return raw.length ? adaptCatalog(raw[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Deletion/relationship integrity (Phase 5 §13): a Product's related_catalog
 * is a stored ID that may point at a deleted/unpublished catalog — this
 * returns null rather than throwing, so the caller simply omits the card.
 */
export async function getCatalogById(id: number, locale: Locale): Promise<Catalog | null> {
  try {
    const raw = await fetchWp<any>(`/wp/v2/catalog/${id}?lang=${locale}&_embed=1`, {
      tags: ["catalogs", `catalog:${id}`],
    });
    return raw ? adaptCatalog(raw) : null;
  } catch {
    return null;
  }
}

export async function getFeaturedCatalogs(locale: Locale, count: number): Promise<Catalog[]> {
  const all = await getCatalogs(locale);
  return sortFeaturedFirst(
    all.map((c) => ({ ...c, publishedAt: c.lastUpdated })),
    count,
  );
}
