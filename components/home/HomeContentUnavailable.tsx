import type { Locale } from "@/i18n/routing";

interface HomeContentUnavailableProps {
  locale: Locale;
  fetchError?: string;
}

/**
 * Renders whenever `getHomePage()` couldn't resolve real content — either
 * the WP request failed outright or it succeeded with no `homeFields` set
 * yet (Phase 11 Step 2's "no fabrication" rule: never invent hero copy,
 * stats, or CTAs). Without this, every homepage section still renders its
 * markup with empty strings, which reads to a visitor as a blank page —
 * this replaces that with an honest, clearly-intentional notice instead.
 * `fetchError` (dev-only — never set for the reachable-but-empty case) is
 * shown only outside production, so a misconfigured live site never leaks
 * a raw error message to a real visitor.
 */
export function HomeContentUnavailable({ locale, fetchError }: HomeContentUnavailableProps) {
  const t =
    locale === "tr"
      ? {
          heading: "İçerik henüz yayınlanmadı",
          body: "Bu sayfanın ana içeriği WordPress'ten geliyor ve henüz girilmemiş ya da API'ye şu an ulaşılamıyor. Gerçek içerik girildiğinde bu bölüm otomatik olarak görünecektir.",
          devLabel: "Geliştirici notu",
        }
      : {
          heading: "Content not published yet",
          body: "This page's main content comes from WordPress and hasn't been entered yet, or the API can't be reached right now. It will appear automatically once real content is published.",
          devLabel: "Developer note",
        };

  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-24">
      <div className="rounded-[var(--radius-sm)] border border-dashed border-border-default bg-surface-alt px-8 py-16 text-center">
        <h1 className="text-[length:var(--text-h2)] text-text-primary">{t.heading}</h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">{t.body}</p>
        {process.env.NODE_ENV !== "production" && fetchError ? (
          <p className="mx-auto mt-6 max-w-xl rounded-[var(--radius-sm)] bg-surface-page px-4 py-3 text-left text-sm text-text-muted">
            <strong>{t.devLabel}:</strong> {fetchError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
