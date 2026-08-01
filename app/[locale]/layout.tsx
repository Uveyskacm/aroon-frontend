import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/api/settings";
import { getNav } from "@/lib/api/nav";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "Aroon",
    template: "%s | Aroon",
  },
};

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

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
