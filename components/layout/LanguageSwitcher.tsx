"use client";

import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { clsx } from "clsx";
import type { Translations } from "@/lib/types/wordpress";

/** Shared by every `[slug]` detail page to build `paramsByLocale` from a WP item's own `translations` map. */
export function translationsToParamsByLocale(
  translations: Translations,
): Partial<Record<Locale, Record<string, string> | null>> {
  const result: Partial<Record<Locale, Record<string, string> | null>> = {};
  for (const locale of routing.locales) {
    const entry = translations[locale];
    result[locale] = entry ? { slug: entry.slug } : null;
  }
  return result;
}

interface LanguageSwitcherProps {
  className?: string;
  linkClassName?: string;
  /**
   * Per-locale param override for dynamic detail routes (Step 2 Important
   * #6) — e.g. the *actual* translated `slug` for a Product/Catalog/News/
   * Reference, sourced from that item's own `translations` map. `null`
   * means "no translation exists for this item in that locale": we never
   * guess a slug across locales (they're independent per-language values,
   * not guaranteed to match), so that locale is simply not offered rather
   * than linking to a wrong or 404ing page.
   */
  paramsByLocale?: Partial<Record<Locale, Record<string, string> | null>>;
}

/**
 * Locale switcher (Step 2 Important #6: previously no UI existed anywhere
 * to move between /tr and /en despite full backend translation wiring).
 * `usePathname()` here returns next-intl's *internal* route template
 * (e.g. "/products/[slug]"), not the localized URL — for a route with no
 * dynamic segment this is enough on its own; for a `[slug]` route without
 * a `paramsByLocale` override we deliberately fall back to that section's
 * root rather than reusing the current locale's slug in the target locale.
 */
export function LanguageSwitcher({ className, linkClassName, paramsByLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const params = useParams<Record<string, string>>();
  const currentLocale = params.locale as Locale;
  const isDynamicRoute = pathname.includes("[");

  return (
    <div className={className}>
      {routing.locales.map((loc) => {
        if (loc === currentLocale) {
          return (
            <span key={loc} aria-current="true" className={clsx(linkClassName, "font-semibold")}>
              {loc.toUpperCase()}
            </span>
          );
        }

        const override = paramsByLocale?.[loc];
        if (paramsByLocale && override === null) {
          return null;
        }

        if (isDynamicRoute && !override) {
          const root = "/" + (pathname.split("/").filter(Boolean)[0] ?? "");
          return (
            // @ts-expect-error -- root is a runtime-computed section path, not statically known here
            <Link key={loc} href={root} locale={loc} className={linkClassName}>
              {loc.toUpperCase()}
            </Link>
          );
        }

        return (
          <Link
            key={loc}
            // @ts-expect-error -- pathname is a next-intl internal route template resolved at runtime, not statically known here
            href={{ pathname, params: override ?? params }}
            locale={loc}
            className={linkClassName}
          >
            {loc.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
