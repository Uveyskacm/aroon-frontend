import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getHomePage } from "@/lib/api/home";
import { getProductCategories } from "@/lib/api/products";
import { getFeaturedCatalogs } from "@/lib/api/catalogs";
import { getFeaturedReferences } from "@/lib/api/references";
import { getFeaturedNews } from "@/lib/api/news";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { HomeContentUnavailable } from "@/components/home/HomeContentUnavailable";
import { CorporateIntro } from "@/components/home/CorporateIntro";
import { ProductCategoriesGrid } from "@/components/home/ProductCategoriesGrid";
import { WhySection } from "@/components/home/WhySection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const { seo, translations } = await getHomePage(typedLocale);
  return resolveMetadata({
    seo,
    locale: typedLocale,
    pathname: "/",
    translations,
    fallbackTitle: "Aroon — Çelik & Demir Boru, Tüp, Profil Üretimi",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  const { fields, hasContent, fetchError } = await getHomePage(typedLocale);
  const [categories, catalogs, references, news] = await Promise.all([
    getProductCategories(typedLocale),
    getFeaturedCatalogs(typedLocale, fields.featured.catalogsCount),
    getFeaturedReferences(typedLocale, fields.featured.referencesCount),
    getFeaturedNews(typedLocale, fields.featured.newsCount),
  ]);

  if (!hasContent) {
    return <HomeContentUnavailable locale={typedLocale} fetchError={fetchError} />;
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: fields.hero.headline,
        }}
      />
      <Hero hero={fields.hero} />
      <CorporateIntro intro={fields.intro} stats={fields.stats} />
      <ProductCategoriesGrid categories={categories} />
      <WhySection why={fields.why} />
      <ProcessSection process={fields.process} />
      <FeaturedGrid
        heading={fields.featured.catalogsHeading}
        items={catalogs.map((c) => ({
          id: c.id,
          href: getPathname({ locale: typedLocale, href: { pathname: "/catalogs/[slug]", params: { slug: c.slug } } }),
          title: c.title,
          description: c.excerpt,
          image: c.coverImage,
        }))}
      />
      <FeaturedGrid
        heading={fields.featured.referencesHeading}
        items={references.map((r) => ({
          id: r.id,
          href: getPathname({ locale: typedLocale, href: { pathname: "/references/[slug]", params: { slug: r.slug } } }),
          title: r.title,
          description: r.clientName,
          image: r.featuredImage,
        }))}
      />
      <FeaturedGrid
        heading={fields.featured.newsHeading}
        items={news.map((n) => ({
          id: n.id,
          href: getPathname({ locale: typedLocale, href: { pathname: "/news/[slug]", params: { slug: n.slug } } }),
          title: n.title,
          description: n.excerpt,
          image: n.featuredImage,
        }))}
      />
      <CtaBand cta={fields.cta} />
    </>
  );
}
