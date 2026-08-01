import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getCatalogs } from "@/lib/api/catalogs";
import { getPathname } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { FadeInStagger } from "@/components/motion/FadeInStagger";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aroon.com.tr";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const basePath = getPathname({ locale: typedLocale, href: "/catalogs" });

  return {
    title: typedLocale === "tr" ? "Kataloglar" : "Catalogs",
    alternates: { canonical: `${SITE_URL}/${locale}${basePath}` },
  };
}

export default async function CatalogsArchivePage({ params }: PageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const catalogs = await getCatalogs(typedLocale);

  const t =
    typedLocale === "tr"
      ? { title: "Kataloglar", empty: "Henüz yayınlanmış katalog bulunmuyor." }
      : { title: "Catalogs", empty: "No catalogs have been published yet." };

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">{t.title}</h1>

      {catalogs.length ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FadeInStagger>
            {catalogs.map((catalog) => (
              <Card
                key={catalog.id}
                href={getPathname({
                  locale: typedLocale,
                  href: { pathname: "/catalogs/[slug]", params: { slug: catalog.slug } },
                })}
                title={catalog.title}
                description={catalog.excerpt}
                image={catalog.coverImage}
              />
            ))}
          </FadeInStagger>
        </div>
      ) : (
        <p className="mt-12 text-center text-text-muted">{t.empty}</p>
      )}
    </div>
  );
}
