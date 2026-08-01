import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getProducts, getProductCategories } from "@/lib/api/products";
import { FilterBar } from "@/components/products/FilterBar";
import { Pagination } from "@/components/products/Pagination";
import { FadeInStagger } from "@/components/motion/FadeInStagger";
import { Card } from "@/components/ui/Card";
import { getPathname } from "@/i18n/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aroon.com.tr";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

/**
 * Archive canonical/robots rule (Phase 4 §9): only `q` (search) gets
 * noindex — category and pagination are self-referencing, indexable
 * pages, since a category view matches real search intent on its own.
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const typedLocale = locale as Locale;
  const basePath = getPathname({ locale: typedLocale, href: "/products" });

  const query = new URLSearchParams();
  if (sp.category) query.set("category", sp.category);
  if (sp.page) query.set("page", sp.page);
  const canonical = `${SITE_URL}/${locale}${basePath}${query.toString() ? `?${query.toString()}` : ""}`;

  const isSearch = Boolean(sp.q);

  return {
    title: typedLocale === "tr" ? "Ürünler" : "Products",
    alternates: { canonical },
    robots: { index: !isSearch, follow: true },
  };
}

export default async function ProductsArchivePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const typedLocale = locale as Locale;
  const page = sp.page ? Number(sp.page) : 1;

  const [result, categories] = await Promise.all([
    getProducts(typedLocale, { category: sp.category, q: sp.q, page }),
    getProductCategories(typedLocale),
  ]);

  const t =
    typedLocale === "tr"
      ? { title: "Ürünler", count: (n: number) => `${n} ürün bulundu`, empty: "Aradığınız kriterlere uygun ürün bulunamadı." }
      : { title: "Products", count: (n: number) => `${n} products found`, empty: "No products match your search." };

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">{t.title}</h1>

      <div className="mt-8">
        <FilterBar categories={categories} locale={typedLocale} />
      </div>

      <p className="mt-6 text-sm text-text-muted">{t.count(result.total)}</p>

      {result.items.length ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FadeInStagger>
            {result.items.map((product) => (
              <Card
                key={product.id}
                href={getPathname({
                  locale: typedLocale,
                  href: { pathname: "/products/[slug]", params: { slug: product.slug } },
                })}
                title={product.title}
                eyebrow={product.category?.name}
                description={product.materialType}
                image={product.featuredImage}
              />
            ))}
          </FadeInStagger>
        </div>
      ) : (
        <p className="mt-12 text-center text-text-muted">{t.empty}</p>
      )}

      <Pagination page={page} totalPages={result.totalPages} searchParams={sp} />
    </div>
  );
}
