/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import { adaptMedia, adaptSeo, adaptTranslations, stripHtml } from "./adapters";
import type { Locale } from "@/i18n/routing";
import type { ContentPage } from "@/lib/types/wordpress";

function adaptContentPage(raw: any): ContentPage {
  return {
    id: raw.id,
    title: stripHtml(raw.title?.rendered ?? ""),
    content: raw.content?.rendered ?? "",
    featuredImage: adaptMedia(raw._embedded?.["wp:featuredmedia"]?.[0]),
    seo: adaptSeo(raw.seo),
    translations: adaptTranslations(raw.translations),
    lang: (raw.lang as Locale) ?? "tr",
  };
}

/**
 * Native WP `page` post type, resolved by its `_wp_page_template` value
 * (page-templates.php) rather than a dedicated CPT — covers every static,
 * editor-authored page (About, Mission & Vision, Management Approach,
 * KVKK, Privacy, Cookie) that has no structured fields of its own, only a
 * title + WYSIWYG body. Mirrors getHomePage()'s page_template lookup.
 */
export async function getPageByTemplate(
  templateKey: string,
  locale: Locale,
): Promise<ContentPage | null> {
  try {
    const raw = await fetchWp<any[]>(
      `/wp/v2/pages?page_template=${encodeURIComponent(templateKey)}&lang=${locale}&_embed=1`,
      { tags: ["pages", `page-template:${templateKey}`] },
    );
    return raw.length ? adaptContentPage(raw[0]) : null;
  } catch {
    return null;
  }
}
