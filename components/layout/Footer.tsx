import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NavItem, SiteSettings } from "@/lib/types/wordpress";

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
};

interface FooterProps {
  locale: Locale;
  settings: SiteSettings;
  corporateNav: NavItem[];
  resourcesNav: NavItem[];
  legalNav: NavItem[];
  companyName: string;
}

/**
 * Structural column headings below are generic UI chrome (not content),
 * kept as a tiny local locale dictionary rather than a WP round-trip for a
 * handful of static labels — every actual link label/URL still comes from
 * the WP nav endpoint (Phase 1 §3), never hardcoded here.
 */
const LABELS: Record<Locale, Record<string, string>> = {
  tr: {
    corporate: "Kurumsal",
    productsResources: "Ürünler",
    products: "Ürünler",
    quickLinks: "Hızlı Bağlantılar",
    quote: "Teklif Al",
    contact: "İletişim",
    contactHeading: "İletişim",
  },
  en: {
    corporate: "Corporate",
    productsResources: "Products",
    products: "Products",
    quickLinks: "Quick Links",
    quote: "Get a Quote",
    contact: "Contact",
    contactHeading: "Contact",
  },
};

/** 5-column footer on surface-inverse; legal links live only in the bottom bar (Phase 2 §7). */
export function Footer({ locale, settings, corporateNav, resourcesNav, legalNav, companyName }: FooterProps) {
  const year = new Date().getFullYear();
  const t = LABELS[locale];

  return (
    <footer className="bg-surface-inverse text-text-inverse">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-[clamp(20px,4vw,64px)] py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:col-span-1">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={companyName || "AROON"}
              width={0}
              height={0}
              sizes="220px"
              className="h-16 w-auto"
            />
          ) : (
            <span className="text-xl font-bold">{companyName || "AROON"}</span>
          )}
          {settings.footerBlurb ? (
            <p className="mt-3 text-sm text-text-inverse-muted">{settings.footerBlurb}</p>
          ) : null}
          {settings.socialLinks.length ? (
            <ul className="mt-4 flex flex-col items-center gap-2 sm:items-start">
              {settings.socialLinks.map((link) => (
                <li key={link.platform + link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-text-inverse-muted hover:text-text-inverse"
                  >
                    {SOCIAL_PLATFORM_LABELS[link.platform] ?? link.platform}
                    <ExternalLink aria-hidden size={12} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.04em]">{t.corporate}</h4>
          <ul className="flex flex-col gap-2 text-sm text-text-inverse-muted">
            {corporateNav.map((item) => (
              <li key={item.id}>
                {/* @ts-expect-error dynamic WP-driven href */}
                <Link href={item.url}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.04em]">{t.productsResources}</h4>
          <ul className="flex flex-col gap-2 text-sm text-text-inverse-muted">
            <li>
              <Link href="/products">{t.products}</Link>
            </li>
            {resourcesNav.map((item) => (
              <li key={item.id}>
                {/* @ts-expect-error dynamic WP-driven href */}
                <Link href={item.url}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.04em]">{t.quickLinks}</h4>
          <ul className="flex flex-col gap-2 text-sm text-text-inverse-muted">
            <li>
              <Link href="/quote">{t.quote}</Link>
            </li>
            <li>
              <Link href="/contact">{t.contact}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.04em]">{t.contactHeading}</h4>
          <ul className="flex flex-col gap-2 text-sm text-text-inverse-muted">
            {settings.phone ? <li>{settings.phone}</li> : null}
            {settings.email ? <li>{settings.email}</li> : null}
            {settings.hqAddress ? <li>{settings.hqAddress}</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border-inverse">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-[clamp(20px,4vw,64px)] py-5 text-xs text-text-inverse-muted">
          <span>© {year} {companyName || "AROON"}</span>
          <div className="flex gap-4">
            {legalNav.map((item) => (
              // @ts-expect-error dynamic WP-driven href
              <Link key={item.id} href={item.url}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
