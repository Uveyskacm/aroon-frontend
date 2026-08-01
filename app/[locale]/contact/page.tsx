import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/api/settings";
import { getLegalStatus } from "@/lib/api/legal";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "tr" ? "İletişim" : "Contact" };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [settings, legalStatus] = await Promise.all([
    getSettings(typedLocale),
    getLegalStatus(typedLocale),
  ]);

  return (
    <div className="mx-auto max-w-[1000px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">
        {typedLocale === "tr" ? "İletişim" : "Contact"}
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4 text-text-muted">
          {settings.hqAddress ? <p>{settings.hqAddress}</p> : null}
          {settings.phone ? <p>{settings.phone}</p> : null}
          {settings.email ? <p>{settings.email}</p> : null}
          {settings.businessHours ? <p>{settings.businessHours}</p> : null}
          {settings.mapsEmbedUrl ? (
            <iframe
              src={settings.mapsEmbedUrl}
              className="mt-4 h-64 w-full rounded-[var(--radius-md)] border border-border-default"
              loading="lazy"
              title="Harita"
            />
          ) : null}
        </div>
        <ContactForm locale={typedLocale} kvkkReady={legalStatus.kvkk.ready} />
      </div>
    </div>
  );
}
