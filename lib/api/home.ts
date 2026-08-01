/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations } from "./adapters";
import type { Locale } from "@/i18n/routing";
import type { HomeFields, Seo, Translations } from "@/lib/types/wordpress";

const FALLBACK_SEO: Seo = {
  title: null,
  metaDescription: null,
  ogImage: null,
  canonicalUrl: null,
  canonicalIsExplicit: false,
  robots: { index: true, follow: true },
};

const EMPTY_HOME: HomeFields = {
  hero: {
    headline: "",
    subheadline: "",
    primaryCtaLabel: "",
    secondaryCtaLabel: "",
    visualMode: "image",
    fallbackImage: null,
  },
  intro: { eyebrow: "", heading: "", body: "", ctaLabel: "" },
  stats: [],
  why: { heading: "", items: [] },
  process: { heading: "", steps: [] },
  featured: {
    catalogsHeading: "",
    catalogsCount: 3,
    referencesHeading: "",
    referencesCount: 3,
    newsHeading: "",
    newsCount: 3,
  },
  cta: { heading: "", body: "", buttonLabel: "" },
};

export interface HomePageData {
  fields: HomeFields;
  seo: Seo;
  translations: Translations;
  /** False whenever nothing real came back from WP — either the request itself
   * failed (API unreachable/non-2xx) or it succeeded but no homeFields were set
   * yet. Lets the page tell "genuinely no content yet" apart from a silent blank
   * render, without fabricating any copy. */
  hasContent: boolean;
  /** Only set when the request itself failed (network error / non-2xx) — never
   * set for the "reachable but empty" case. Dev-only diagnostic, never rendered
   * in production. */
  fetchError?: string;
}

/** Home's editable copy is structured custom fields, scoped to page_template=template-home (Phase 3). */
export async function getHomePage(locale: Locale): Promise<HomePageData> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/pages?page_template=template-home&lang=${locale}&_embed=1`,
      { tags: ["pages", "home"] },
    );
    const page = raw?.[0];
    const seo = adaptSeo(page?.seo);
    const translations = adaptTranslations(page?.translations);
    const f = page?.homeFields;
    if (!f) return { fields: EMPTY_HOME, seo, translations, hasContent: false };

    return {
      seo,
      translations,
      hasContent: true,
      fields: {
      hero: {
        headline: f.hero?.headline ?? "",
        subheadline: f.hero?.subheadline ?? "",
        primaryCtaLabel: f.hero?.primary_cta_label ?? "",
        secondaryCtaLabel: f.hero?.secondary_cta_label ?? "",
        visualMode: f.hero?.visual_mode === "3d" ? "3d" : "image",
        fallbackImage: adaptMedia(f.hero?.fallback_image),
      },
      intro: {
        eyebrow: f.intro?.eyebrow ?? "",
        heading: f.intro?.heading ?? "",
        body: f.intro?.body ?? "",
        ctaLabel: f.intro?.cta_label ?? "",
      },
      stats: (f.stats ?? []).filter((s: any) => s.label && s.value),
      why: {
        heading: f.why?.heading ?? "",
        items: f.why?.items ?? [],
      },
      process: {
        heading: f.process?.heading ?? "",
        steps: f.process?.steps ?? [],
      },
      featured: {
        catalogsHeading: f.featured?.catalogs_heading ?? "",
        catalogsCount: f.featured?.catalogs_count ?? 3,
        referencesHeading: f.featured?.references_heading ?? "",
        referencesCount: f.featured?.references_count ?? 3,
        newsHeading: f.featured?.news_heading ?? "",
        newsCount: f.featured?.news_count ?? 3,
      },
      cta: {
        heading: f.cta?.heading ?? "",
        body: f.cta?.body ?? "",
        buttonLabel: f.cta?.button_label ?? "",
      },
      },
    };
  } catch (error) {
    return {
      fields: EMPTY_HOME,
      seo: FALLBACK_SEO,
      translations: {},
      hasContent: false,
      fetchError: error instanceof Error ? error.message : String(error),
    };
  }
}
