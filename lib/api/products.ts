/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations, stripHtml } from "./adapters";
import type { Locale } from "@/i18n/routing";
import type { PaginatedResult, Product, ProductCategory } from "@/lib/types/wordpress";

const PAGE_SIZE = 12;

/**
 * Generic, extensible filter object (Phase 4 §5) — adding a future facet
 * (material/size/wallThickness/surfaceFinish/useCase) is one optional key
 * here, not a signature change.
 */
export interface ProductFilter {
  category?: string;
  q?: string;
  page?: number;
  material?: string;
  size?: string;
  wallThickness?: string;
  surfaceFinish?: string;
  useCase?: string;
}

function adaptProduct(raw: any): Product {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title?.rendered ?? ""),
    content: raw.content?.rendered ?? "",
    featuredImage: adaptMedia(raw._embedded?.["wp:featuredmedia"]?.[0]),
    gallery: (raw.gallery ?? []).map(adaptMedia).filter(Boolean),
    category: raw.categoryData ? adaptProductCategory(raw.categoryData) : null,
    code: raw.code ?? "",
    materialType: raw.material_type ?? "",
    sizeOptions: raw.size_options ?? "",
    wallThickness: raw.wall_thickness ?? "",
    length: raw.length ?? "",
    surfaceFinish: raw.surface_finish ?? "",
    useCases: raw.use_cases ?? "",
    packagingInfo: raw.packaging_info ?? "",
    specTable: (raw.spec_table ?? []).filter((r: any) => r.label && r.value),
    downloads: raw.downloads ?? [],
    relatedCatalogId: raw.related_catalog ?? null,
    seo: adaptSeo(raw.seo),
    translations: adaptTranslations(raw.translations),
    lang: (raw.lang as Locale) ?? "tr",
  };
}

function adaptProductCategory(raw: any): ProductCategory {
  return {
    id: raw.id,
    slug: raw.slug,
    name: stripHtml(raw.name ?? ""),
    description: raw.aroonco_description_short ?? raw.description ?? "",
    icon: raw.aroonco_icon ?? "",
    image: adaptMedia(raw.aroonco_image),
    count: raw.count ?? 0,
  };
}

export async function getProducts(
  locale: Locale,
  filter: ProductFilter = {},
): Promise<PaginatedResult<Product>> {
  const page = filter.page ?? 1;
  const search = new URLSearchParams({
    lang: locale,
    per_page: String(PAGE_SIZE),
    page: String(page),
    _embed: "1",
  });
  if (filter.category) search.set("category_slug", filter.category);
  if (filter.q) search.set("search", filter.q);

  try {
    const res = await fetch(
      `${process.env.WP_API_URL ?? "https://cms.aroon.com.tr"}/wp/v2/product?${search.toString()}`,
      { cache: "no-store" },
    );
    if (!res.ok) return { items: [], total: 0, totalPages: 0, page };
    const total = Number(res.headers.get("X-WP-Total") ?? 0);
    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 0);
    const raw = await res.json();
    return { items: raw.map(adaptProduct), total, totalPages, page };
  } catch {
    return { items: [], total: 0, totalPages: 0, page };
  }
}

export async function getProductBySlug(
  slug: string,
  locale: Locale,
): Promise<Product | null> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/product?slug=${encodeURIComponent(slug)}&lang=${locale}&_embed=1`,
      { tags: ["products", `product:${slug}`] },
    );
    if (!raw.length) return null;
    return adaptProduct(raw[0]);
  } catch {
    return null;
  }
}

/** Strict same-category rule, cap 4, no cross-category fallback (Phase 4 §8). */
export async function getRelatedProducts(product: Product, locale: Locale): Promise<Product[]> {
  if (!product.category) return [];
  const result = await getProducts(locale, { category: product.category.slug });
  return result.items.filter((p) => p.id !== product.id).slice(0, 4);
}

export async function getProductCategories(locale: Locale): Promise<ProductCategory[]> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/product_category?lang=${locale}&per_page=100&hide_empty=false`,
      { tags: ["product-categories"] },
    );
    return raw.map(adaptProductCategory);
  } catch {
    return [];
  }
}

export async function getAllProductSlugs(): Promise<{ slug: string; locale: Locale }[]> {
  try {
    const results = await Promise.all(
      (["tr", "en"] as Locale[]).map(async (locale) => {
        const raw = await fetchWp<any[]>(
          `/wp/v2/product?lang=${locale}&per_page=100&_fields=slug`,
          { tags: ["products"] },
        );
        return raw.map((p) => ({ slug: p.slug as string, locale }));
      }),
    );
    return results.flat();
  } catch {
    return [];
  }
}
