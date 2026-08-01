import { defineRouting } from "next-intl/routing";

export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

/**
 * Internal route keys are English (matching the app/[locale]/... folder
 * names, Phase 1 §1) — only the externally-visible pathname per locale is
 * localized here. This keeps the file-system route tree stable regardless
 * of which language segment a visitor is actually looking at.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/about": {
      tr: "/hakkimizda",
      en: "/about",
    },
    "/mission-vision": {
      tr: "/misyon-vizyon",
      en: "/mission-vision",
    },
    "/management-approach": {
      tr: "/yonetim-yaklasimi",
      en: "/management-approach",
    },
    "/products": {
      tr: "/urunler",
      en: "/products",
    },
    "/products/[slug]": {
      tr: "/urunler/[slug]",
      en: "/products/[slug]",
    },
    "/catalogs": {
      tr: "/kataloglar",
      en: "/catalogs",
    },
    "/catalogs/[slug]": {
      tr: "/kataloglar/[slug]",
      en: "/catalogs/[slug]",
    },
    "/news": {
      tr: "/haberler",
      en: "/news",
    },
    "/news/[slug]": {
      tr: "/haberler/[slug]",
      en: "/news/[slug]",
    },
    "/references": {
      tr: "/referanslar",
      en: "/references",
    },
    "/references/[slug]": {
      tr: "/referanslar/[slug]",
      en: "/references/[slug]",
    },
    "/quote": {
      tr: "/teklif-al",
      en: "/get-a-quote",
    },
    "/contact": {
      tr: "/iletisim",
      en: "/contact",
    },
    "/kvkk": {
      tr: "/kvkk",
      en: "/kvkk",
    },
    "/privacy": {
      tr: "/gizlilik-politikasi",
      en: "/privacy-policy",
    },
    "/cookie": {
      tr: "/cerez-politikasi",
      en: "/cookie-policy",
    },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
