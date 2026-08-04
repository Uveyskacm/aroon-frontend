import { Navigation } from "lucide-react";
import type { Locale } from "@/i18n/routing";

const TEXT: Record<Locale, { heading: string; directions: string }> = {
  tr: { heading: "Konum", directions: "Yol Tarifi Al" },
  en: { heading: "Location", directions: "Get Directions" },
};

/** AROON HQ / factory — Şemsibey OSB 4. Etap, Urartu Cad. No: 268, Tuşba / Van. */
const LAT = 38.5635;
const LNG = 43.3442;

export function LocationMap({ locale }: { locale: Locale }) {
  const t = TEXT[locale];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;
  const embedSrc = `https://www.google.com/maps?q=${LAT},${LNG}&z=16&output=embed`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border-default bg-surface-page shadow-[var(--shadow-elevation-1)]">
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.directions}
        className="group relative block aspect-[4/3] w-full sm:aspect-[16/10]"
      >
        <iframe
          src={embedSrc}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={t.heading}
        />
        <div className="absolute inset-0 bg-surface-stage/0 transition-colors duration-[var(--motion-base)] group-hover:bg-surface-stage/10" />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-surface-page px-3 py-1.5 text-[length:var(--text-caption)] font-semibold text-text-primary shadow-[var(--shadow-elevation-1)] transition-transform duration-[var(--motion-base)] group-hover:-translate-y-0.5">
          <Navigation aria-hidden size={13} />
          {t.directions}
        </span>
      </a>
      <div className="p-5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-[var(--radius-sm)] bg-accent-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-hover"
        >
          <Navigation aria-hidden size={16} />
          {t.directions}
        </a>
      </div>
    </div>
  );
}
