import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FadeInStagger } from "@/components/motion/FadeInStagger";
import { resolveIcon } from "@/lib/icons";
import type { Locale } from "@/i18n/routing";
import type { ProductCategory } from "@/lib/types/wordpress";

const HEADING: Record<Locale, string> = {
  tr: "Ürün Kategorileri",
  en: "Product Categories",
};

export function ProductCategoriesGrid({ categories, locale }: { categories: ProductCategory[]; locale: Locale }) {
  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-[clamp(64px,8vw,128px)]">
      <h2 className="text-[length:var(--text-h2)] text-text-primary">{HEADING[locale]}</h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FadeInStagger>
          {categories.map((category) => {
            const Icon = resolveIcon(category.icon);
            return (
              <Link
                key={category.id}
                href={{ pathname: "/products", query: { category: category.slug } }}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-border-default bg-surface-page shadow-[var(--shadow-elevation-1)] transition-all duration-[var(--motion-base)] ease-[var(--ease-confident)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevation-2)]"
              >
                <div className="relative aspect-square w-full bg-surface-alt">
                  {category.image ? (
                    <Image
                      src={category.image.sizes.large ?? category.image.url}
                      alt={category.image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center gap-2">
                    {Icon ? <Icon aria-hidden size={18} className="text-accent-primary" /> : null}
                    <h3 className="text-[length:var(--text-h4)] text-text-primary">{category.name}</h3>
                  </div>
                  {category.description ? (
                    <p className="line-clamp-2 text-[length:var(--text-body-sm)] text-text-muted">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </FadeInStagger>
      </div>
    </section>
  );
}
