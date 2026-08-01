import type { Seo, Translations, WpMedia } from "@/lib/types/wordpress";

/**
 * Normalizes native WP media / register_rest_field shapes into the
 * frontend's own camelCase types (Phase 1 §3's "adapters, no changes to
 * WP's native controllers" rule). Every adapter here defends against a
 * null/missing upstream value — the deletion/relationship-integrity
 * contract (Phase 5 §13) guarantees WP returns null for a broken
 * reference, never a broken object, but a field can also simply be absent
 * if the mu-plugin isn't deployed yet.
 */

interface RawWpMedia {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url: string }>;
  };
}

export function adaptMedia(raw: RawWpMedia | null | undefined): WpMedia | null {
  if (!raw || !raw.source_url) return null;
  const sizes = raw.media_details?.sizes ?? {};
  return {
    id: raw.id ?? 0,
    url: raw.source_url,
    alt: raw.alt_text ?? "",
    width: raw.media_details?.width ?? 0,
    height: raw.media_details?.height ?? 0,
    sizes: {
      thumbnail: sizes.thumbnail?.source_url,
      medium: sizes.medium?.source_url,
      large: sizes.large?.source_url,
      full: raw.source_url,
    },
  };
}

interface RawSeo {
  title?: string | null;
  metaDescription?: string | null;
  ogImage?: { url: string; width: number; height: number } | null;
  canonicalUrl?: string | null;
  canonicalIsExplicit?: boolean;
  robots?: { index?: boolean; follow?: boolean };
}

const FALLBACK_SEO: Seo = {
  title: null,
  metaDescription: null,
  ogImage: null,
  canonicalUrl: null,
  canonicalIsExplicit: false,
  robots: { index: true, follow: true },
};

export function adaptSeo(raw: RawSeo | null | undefined): Seo {
  if (!raw) return FALLBACK_SEO;
  return {
    title: raw.title ?? null,
    metaDescription: raw.metaDescription ?? null,
    ogImage: raw.ogImage ?? null,
    canonicalUrl: raw.canonicalUrl ?? null,
    canonicalIsExplicit: raw.canonicalIsExplicit ?? false,
    robots: {
      index: raw.robots?.index ?? true,
      follow: raw.robots?.follow ?? true,
    },
  };
}

export function adaptTranslations(
  raw: Record<string, { id: number; slug: string }> | null | undefined,
): Translations {
  return raw ?? {};
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
