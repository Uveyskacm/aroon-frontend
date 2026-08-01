import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { getLegalStatus } from "@/lib/api/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "tr" ? "Teklif Al" : "Get a Quote" };
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const legalStatus = await getLegalStatus(typedLocale);

  return (
    <div className="mx-auto max-w-[720px] px-[clamp(20px,4vw,64px)] py-16">
      <h1 className="text-[length:var(--text-h1)] text-text-primary">
        {typedLocale === "tr" ? "Teklif Al" : "Get a Quote"}
      </h1>
      <p className="mt-3 text-text-muted">
        {typedLocale === "tr"
          ? "Ürün ihtiyacınızı aşağıdaki formla bize iletin, en kısa sürede dönüş yapalım."
          : "Tell us about your requirements below and we'll get back to you shortly."}
      </p>
      <div className="mt-10">
        <QuoteForm locale={typedLocale} kvkkReady={legalStatus.kvkk.ready} />
      </div>
    </div>
  );
}
