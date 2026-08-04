import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/api/settings";
import { getNav } from "@/lib/api/nav";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aroon.com.tr";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = hasLocale(routing.locales, locale) ? (locale as Locale) : routing.defaultLocale;
  const settings = await getSettings(typedLocale);

  return {
    title: {
      default: "Aroon",
      template: "%s | Aroon",
    },
    verification: settings.searchConsoleTag ? { google: settings.searchConsoleTag } : undefined,
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [settings, primaryNav, footerLegalNav] = await Promise.all([
    getSettings(typedLocale),
    getNav("primary", typedLocale),
    getNav("footer_legal", typedLocale),
  ]);

  // "Kurumsal/Corporate" and "Kaynaklar/Resources" are the two dropdowns in
  // the confirmed nav order (Phase 2 §7: Ana Sayfa / Kurumsal▾ / Ürünler /
  // Kaynaklar▾ / Teklif Al / İletişim) — first and last respectively.
  const dropdowns = primaryNav.filter((item) => item.children.length > 0);
  const corporateNav = dropdowns.at(0)?.children ?? [];
  const resourcesNav = dropdowns.length > 1 ? dropdowns.at(-1)?.children ?? [] : [];

  const quoteLabel = typedLocale === "tr" ? "Teklif Al" : "Get a Quote";

  // Organization schema, site-wide (Phase 17 SEO pass) — helps search
  // engines resolve who AROON is and where it operates independent of any
  // one page's content; areaServed lists the real export markets from WP
  // settings rather than inventing scope.
  const organizationJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName || "Aroon",
    url: SITE_URL,
  };
  if (settings.logoUrl) organizationJsonLd.logo = settings.logoUrl;
  if (settings.hqAddress) {
    organizationJsonLd.address = { "@type": "PostalAddress", streetAddress: settings.hqAddress };
  }
  if (settings.phone) organizationJsonLd.telephone = settings.phone;
  if (settings.email) organizationJsonLd.email = settings.email;
  if (settings.foundingYear) organizationJsonLd.foundingDate = String(settings.foundingYear);
  if (settings.socialLinks.length) {
    organizationJsonLd.sameAs = settings.socialLinks.map((link) => link.url);
  }
  if (settings.exportCountries.length) {
    organizationJsonLd.areaServed = settings.exportCountries.map((country) => ({
      "@type": "Country",
      name: country,
    }));
  }

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationJsonLd} />
        {settings.ga4MeasurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4MeasurementId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${settings.ga4MeasurementId}');`}
            </Script>
          </>
        ) : null}
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {typedLocale === "tr" ? "İçeriğe geç" : "Skip to content"}
          </a>
          <Header
            nav={primaryNav}
            quoteLabel={quoteLabel}
            companyName={settings.companyName}
            logoUrl={settings.logoUrl}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer
            locale={typedLocale}
            settings={settings}
            corporateNav={corporateNav}
            resourcesNav={resourcesNav}
            legalNav={footerLegalNav}
            companyName={settings.companyName}
          />
          <WhatsAppButton phoneNumber={settings.whatsappNumber || settings.phone} locale={typedLocale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
