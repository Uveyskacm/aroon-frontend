import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getNews } from "@/lib/api/news";
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
  const basePath = getPathname({ locale: typedLocale, href: "/news" });

  return {
    title: typedLocale === "tr" ? "Haberler" : "News",
    alternates: { canonical: `${SITE_URL}/${locale}${basePath}` },
  };
}

export default async function NewsArchivePage({ params }: PageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const news = await getNews(typedLocale);

  const t =
    typedLocale === "tr"
      ? { title: "Haberler", empty: "Henüz yayınlanmış haber bulunmuyor." }
      : { title: "News", empty: "No news articles have been published yet." };

  const dateFormatter = new Intl.DateTimeFormat(typedLocale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "long",
  });

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">{t.title}</h1>

      {news.length ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FadeInStagger>
            {news.map((item) => (
              <Card
                key={item.id}
                href={getPathname({
                  locale: typedLocale,
                  href: { pathname: "/news/[slug]", params: { slug: item.slug } },
                })}
                eyebrow={item.publishedAt ? dateFormatter.format(new Date(item.publishedAt)) : undefined}
                title={item.title}
                description={item.excerpt}
                image={item.featuredImage}
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
