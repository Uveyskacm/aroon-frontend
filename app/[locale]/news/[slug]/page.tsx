import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import { getNewsBySlug, getNews } from "@/lib/api/news";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { LanguageSwitcher, translationsToParamsByLocale } from "@/components/layout/LanguageSwitcher";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const [tr, en] = await Promise.all([getNews("tr"), getNews("en")]);
  return [
    ...tr.map((n) => ({ locale: "tr", slug: n.slug })),
    ...en.map((n) => ({ locale: "en", slug: n.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const item = await getNewsBySlug(slug, typedLocale);
  if (!item) return {};

  const pathname = getPathname({ locale: typedLocale, href: { pathname: "/news/[slug]", params: { slug } } });
  return resolveMetadata({
    seo: item.seo,
    locale: typedLocale,
    pathname,
    translations: item.translations,
    fallbackTitle: item.title,
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const item = await getNewsBySlug(slug, typedLocale);
  if (!item) notFound();

  const t = typedLocale === "tr" ? { home: "Ana Sayfa", news: "Haberler" } : { home: "Home", news: "News" };
  const dateFormatter = new Intl.DateTimeFormat(typedLocale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "long",
  });

  return (
    <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,64px)] py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: item.title,
          description: item.excerpt,
          image: item.featuredImage?.url,
          datePublished: item.publishedAt || undefined,
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-1.5 text-sm text-text-muted">
        <Link href="/">{t.home}</Link>
        <span>/</span>
        <Link href="/news">{t.news}</Link>
        <span>/</span>
        <span className="text-text-primary">{item.title}</span>
      </nav>

      <LanguageSwitcher
        className="mb-6 flex items-center gap-3 text-sm text-text-muted"
        linkClassName="rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-accent hover:text-accent-primary"
        paramsByLocale={translationsToParamsByLocale(item.translations)}
      />

      <h1 className="text-[length:var(--text-h1)] text-text-primary">{item.title}</h1>
      {item.publishedAt ? (
        <p className="mt-2 text-sm text-text-muted">{dateFormatter.format(new Date(item.publishedAt))}</p>
      ) : null}

      {item.featuredImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-surface-alt">
          <Image
            src={item.featuredImage.sizes.large ?? item.featuredImage.url}
            alt={item.featuredImage.alt}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-cover"
          />
        </div>
      ) : null}

      {item.content ? (
        <div
          className="prose mt-8 max-w-[70ch] text-text-muted"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      ) : null}
    </div>
  );
}
