import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import { getCatalogBySlug, getCatalogs } from "@/lib/api/catalogs";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { translationsToParamsByLocale } from "@/i18n/translationsToParamsByLocale";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const [tr, en] = await Promise.all([getCatalogs("tr"), getCatalogs("en")]);
  return [
    ...tr.map((c) => ({ locale: "tr", slug: c.slug })),
    ...en.map((c) => ({ locale: "en", slug: c.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const catalog = await getCatalogBySlug(slug, typedLocale);
  if (!catalog) return {};

  const pathname = getPathname({ locale: typedLocale, href: { pathname: "/catalogs/[slug]", params: { slug } } });
  return resolveMetadata({
    seo: catalog.seo,
    locale: typedLocale,
    pathname,
    translations: catalog.translations,
    fallbackTitle: catalog.title,
  });
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default async function CatalogDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const catalog = await getCatalogBySlug(slug, typedLocale);
  if (!catalog) notFound();

  const t =
    typedLocale === "tr"
      ? { home: "Ana Sayfa", catalogs: "Kataloglar", download: "Kataloğu İndir" }
      : { home: "Home", catalogs: "Catalogs", download: "Download Catalog" };

  return (
    <div className="mx-auto max-w-[1000px] px-[clamp(20px,4vw,64px)] py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: catalog.title,
          description: catalog.excerpt,
          image: catalog.coverImage?.url,
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-1.5 text-sm text-text-muted">
        <Link href="/">{t.home}</Link>
        <span>/</span>
        <Link href="/catalogs">{t.catalogs}</Link>
        <span>/</span>
        <span className="text-text-primary">{catalog.title}</span>
      </nav>

      <LanguageSwitcher
        className="mb-6 flex items-center gap-3 text-sm text-text-muted"
        linkClassName="rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-accent hover:text-accent-primary"
        paramsByLocale={translationsToParamsByLocale(catalog.translations)}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        {catalog.coverImage ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-alt">
            <Image
              src={catalog.coverImage.sizes.large ?? catalog.coverImage.url}
              alt={catalog.coverImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div>
          <h1 className="text-[length:var(--text-h1)] text-text-primary">{catalog.title}</h1>
          {catalog.excerpt ? <p className="mt-4 text-text-muted">{catalog.excerpt}</p> : null}

          {catalog.pdfUrl ? (
            <a
              href={catalog.pdfUrl}
              className="mt-8 inline-flex h-[52px] items-center gap-2.5 rounded-[var(--radius-sm)] bg-accent-primary px-7 text-base font-semibold text-text-inverse transition-colors hover:bg-accent-primary-hover"
            >
              <Download aria-hidden size={18} />
              {t.download}
              {catalog.fileSize ? (
                <span className="text-sm font-normal opacity-80">({formatSize(catalog.fileSize)})</span>
              ) : null}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
