import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getCatalogs } from "@/lib/api/catalogs";
import { getPathname } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { FadeInStagger } from "@/components/motion/FadeInStagger";

/** Only catalogs with a working PDF link are actionable — WP's own gating (Phase 1 §3) should already ensure this, but a missing pdfUrl here must never render a dead/download-nothing card. */
function withPdf<T extends { pdfUrl: string | null }>(catalogs: T[]): (T & { pdfUrl: string })[] {
  return catalogs.filter((c): c is T & { pdfUrl: string } => Boolean(c.pdfUrl));
}

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
  const catalogs = withPdf(await getCatalogs(typedLocale));

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
                href={catalog.pdfUrl}
                download
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
