import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getPageByTemplate } from "@/lib/api/pages";
import { getPathname } from "@/i18n/navigation";
import { resolveMetadata } from "@/lib/seo/resolveMetadata";

const FALLBACK_TITLE: Record<Locale, string> = {
  tr: "Misyon ve Vizyon",
  en: "Mission & Vision",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const page = await getPageByTemplate("template-mission-vision", typedLocale);
  const pathname = getPathname({ locale: typedLocale, href: "/mission-vision" });

  return resolveMetadata({
    seo: page?.seo,
    locale: typedLocale,
    pathname,
    translations: page?.translations,
    fallbackTitle: page?.title || FALLBACK_TITLE[typedLocale],
  });
}

export default async function MissionVisionPage({ params }: PageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const page = await getPageByTemplate("template-mission-vision", typedLocale);

  return (
    <div className="mx-auto max-w-[900px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">
        {page?.title || FALLBACK_TITLE[typedLocale]}
      </h1>
      {page?.content ? (
        <div
          className="prose mt-8 max-w-[70ch] text-text-muted"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : null}
    </div>
  );
}
