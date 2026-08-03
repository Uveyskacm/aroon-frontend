import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { Link, getPathname } from "@/i18n/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from "@/lib/api/products";
import { getCatalogById } from "@/lib/api/catalogs";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { SpecTable } from "@/components/products/SpecTable";
import { DownloadsList } from "@/components/products/DownloadsList";
import { Card } from "@/components/ui/Card";
import { FadeInStagger } from "@/components/motion/FadeInStagger";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { translationsToParamsByLocale } from "@/i18n/translationsToParamsByLocale";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ slug, locale }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const product = await getProductBySlug(slug, typedLocale);
  if (!product) return {};

  const pathname = getPathname({ locale: typedLocale, href: { pathname: "/products/[slug]", params: { slug } } });
  return resolveMetadata({
    seo: product.seo,
    locale: typedLocale,
    pathname,
    translations: product.translations,
    fallbackTitle: product.title,
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const product = await getProductBySlug(slug, typedLocale);
  if (!product) notFound();

  const [relatedProducts, relatedCatalog] = await Promise.all([
    getRelatedProducts(product, typedLocale),
    product.relatedCatalogId ? getCatalogById(product.relatedCatalogId, typedLocale) : null,
  ]);

  const t =
    typedLocale === "tr"
      ? { home: "Ana Sayfa", products: "Ürünler", related: "İlgili Ürünler", quote: "Teklif Al", downloads: "Dokümanlar" }
      : { home: "Home", products: "Products", related: "Related Products", quote: "Get a Quote", downloads: "Downloads" };

  const quickSpecKeys = ["Malzeme Türü", "Ölçü Seçenekleri", "Et Kalınlığı", "Material Type", "Size Range", "Wall Thickness"];
  const quickSpecs = product.specTable.filter((row) => quickSpecKeys.includes(row.label)).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.content.replace(/<[^>]*>/g, "").slice(0, 300),
          image: product.gallery.map((g) => g.url),
          sku: product.code || undefined,
          brand: { "@type": "Brand", name: "Aroon" },
          category: product.category?.name,
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-1.5 text-sm text-text-muted">
        <Link href="/">{t.home}</Link>
        <span>/</span>
        <Link href="/products">{t.products}</Link>
        {product.category ? (
          <>
            <span>/</span>
            <Link href={{ pathname: "/products", query: { category: product.category.slug } }}>
              {product.category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-text-primary">{product.title}</span>
      </nav>

      <LanguageSwitcher
        className="mb-6 flex items-center gap-3 text-sm text-text-muted"
        linkClassName="rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-accent hover:text-accent-primary"
        paramsByLocale={translationsToParamsByLocale(product.translations)}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-alt">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.sizes.large ?? product.featuredImage.url}
                alt={product.featuredImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {product.gallery.length ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.gallery.map((img) => (
                <div key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-alt">
                  <Image src={img.sizes.thumbnail ?? img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {product.category ? (
            <span className="inline-block rounded-full bg-surface-accent px-3 py-1 text-xs font-semibold text-accent-primary">
              {product.category.name}
            </span>
          ) : null}
          <h1 className="mt-3 text-[length:var(--text-h1)] text-text-primary">{product.title}</h1>
          {product.code ? <p className="mt-1 text-sm text-text-muted">{product.code}</p> : null}

          {quickSpecs.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {quickSpecs.map((spec, i) => (
                <span key={i} className="rounded-full border border-border-default px-3 py-1 text-xs text-text-primary">
                  {spec.label}: {spec.value}
                </span>
              ))}
            </div>
          ) : null}

          {product.content ? (
            <div
              className="prose mt-6 max-w-[65ch] text-text-muted"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          ) : null}

          <Link
            href="/quote"
            className="mt-8 flex h-[52px] w-full items-center justify-center rounded-[var(--radius-sm)] bg-accent-primary text-base font-semibold text-text-inverse lg:hidden"
          >
            {t.quote}
          </Link>
        </div>
      </div>

      {product.specTable.length ? (
        <div className="mt-16">
          <h2 className="mb-5 text-[length:var(--text-h3)] text-text-primary">
            {typedLocale === "tr" ? "Teknik Özellikler" : "Technical Specifications"}
          </h2>
          <SpecTable rows={product.specTable} locale={typedLocale} />
        </div>
      ) : null}

      {product.downloads.length ? (
        <div className="mt-16">
          <h2 className="mb-5 text-[length:var(--text-h3)] text-text-primary">{t.downloads}</h2>
          <DownloadsList downloads={product.downloads} locale={typedLocale} />
        </div>
      ) : null}

      {relatedCatalog ? (
        <div className="mt-16">
          <Card
            href={getPathname({ locale: typedLocale, href: { pathname: "/catalogs/[slug]", params: { slug: relatedCatalog.slug } } })}
            title={relatedCatalog.title}
            description={relatedCatalog.excerpt}
            image={relatedCatalog.coverImage}
          />
        </div>
      ) : null}

      {relatedProducts.length ? (
        <div className="mt-16">
          <h2 className="mb-5 text-[length:var(--text-h3)] text-text-primary">{t.related}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FadeInStagger>
              {relatedProducts.map((p) => (
                <Card
                  key={p.id}
                  href={getPathname({ locale: typedLocale, href: { pathname: "/products/[slug]", params: { slug: p.slug } } })}
                  title={p.title}
                  description={p.materialType}
                  image={p.featuredImage}
                />
              ))}
            </FadeInStagger>
          </div>
        </div>
      ) : null}

      <Link
        href="/quote"
        className="fixed inset-x-4 bottom-4 z-[900] hidden h-12 items-center justify-center rounded-[var(--radius-sm)] bg-accent-primary text-sm font-semibold text-text-inverse max-lg:flex"
      >
        {t.quote}
      </Link>
    </div>
  );
}
