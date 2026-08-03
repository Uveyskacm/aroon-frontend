import type { Locale } from "@/i18n/routing";
import type { SpecTableRow } from "@/lib/types/wordpress";

const NUMERIC_PATTERN = /\d/;

const HEADER_LABELS: Record<Locale, { spec: string; value: string }> = {
  tr: { spec: "Özellik", value: "Değer" },
  en: { spec: "Specification", value: "Value" },
};

/** Zebra-striped, mono-value spec table; collapses to bordered cards below md (Phase 2 §8, Phase 4 §6). */
export function SpecTable({ rows, locale }: { rows: SpecTableRow[]; locale: Locale }) {
  if (!rows.length) return null;
  const t = HEADER_LABELS[locale];

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border-default shadow-[var(--shadow-elevation-1)]">
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="bg-surface-inverse text-text-inverse">
            <th className="w-1/3 px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em]">
              {t.spec}
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.04em]">{t.value}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-surface-alt" : undefined}>
              <td className="w-1/3 px-5 py-3.5 font-medium text-text-muted">{row.label}</td>
              <td
                className="px-5 py-3.5 font-semibold text-text-primary"
                style={NUMERIC_PATTERN.test(row.value) ? { fontFamily: "var(--font-mono-tech)" } : undefined}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-border-default md:hidden">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm font-medium text-text-muted">{row.label}</span>
            <span
              className="text-right font-semibold text-text-primary"
              style={NUMERIC_PATTERN.test(row.value) ? { fontFamily: "var(--font-mono-tech)" } : undefined}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
