import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import { getReferenceBySlug, getReferences } from "@/lib/api/references";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { translationsToParamsByLocale } from "@/i18n/translationsToParamsByLocale";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const [tr, en] = await Promise.all([getReferences("tr"), getReferences("en")]);
  return [
    ...tr.map((r) => ({ locale: "tr", slug: r.slug })),
    ...en.map((r) => ({ locale: "en", slug: r.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const reference = await getReferenceBySlug(slug, typedLocale);
  if (!reference) return {};

  const pathname = getPathname({ locale: typedLocale, href: { pathname: "/references/[slug]", params: { slug } } });
  return resolveMetadata({
    seo: reference.seo,
    locale: typedLocale,
    pathname,
    translations: reference.translations,
    fallbackTitle: reference.title,
  });
}

export default async function ReferenceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const reference = await getReferenceBySlug(slug, typedLocale);
  if (!reference) notFound();

  const t =
    typedLocale === "tr"
      ? { home: "Ana Sayfa", references: "Referanslar", client: "Müşteri", location: "Konum", year: "Tamamlanma Yılı" }
      : { home: "Home", references: "References", client: "Client", location: "Location", year: "Completion Year" };

  const facts = [
    { label: t.client, value: reference.clientName },
    { label: t.location, value: reference.projectLocation },
    { label: t.year, value: reference.completionYear ? String(reference.completionYear) : "" },
  ].filter((f) => f.value);

  return (
    <div className="mx-auto max-w-[1000px] px-[clamp(20px,4vw,64px)] py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: reference.title,
          about: reference.clientName || undefined,
          image: reference.featuredImage?.url,
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-1.5 text-sm text-text-muted">
        <Link href="/">{t.home}</Link>
        <span>/</span>
        <Link href="/references">{t.references}</Link>
        <span>/</span>
        <span className="text-text-primary">{reference.title}</span>
      </nav>

      <LanguageSwitcher
        className="mb-6 flex items-center gap-3 text-sm text-text-muted"
        linkClassName="rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-accent hover:text-accent-primary"
        paramsByLocale={translationsToParamsByLocale(reference.translations)}
      />

      <h1 className="text-[length:var(--text-h1)] text-text-primary">{reference.title}</h1>

      {facts.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {facts.map((f) => (
            <span key={f.label} className="rounded-full border border-border-default px-3 py-1 text-xs text-text-primary">
              {f.label}: {f.value}
            </span>
          ))}
        </div>
      ) : null}

      {reference.featuredImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-surface-alt">
          <Image
            src={reference.featuredImage.sizes.large ?? reference.featuredImage.url}
            alt={reference.featuredImage.alt}
            fill
            priority
            sizes="(max-width: 1000px) 100vw, 1000px"
            className="object-cover"
          />
        </div>
      ) : null}

      {reference.description ? (
        <div
          className="prose mt-8 max-w-[70ch] text-text-muted"
          dangerouslySetInnerHTML={{ __html: reference.description }}
        />
      ) : null}

      {reference.gallery.length ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {reference.gallery.map((img) => (
            <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-surface-alt">
              <Image
                src={img.sizes.medium ?? img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
