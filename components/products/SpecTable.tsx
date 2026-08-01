import type { SpecTableRow } from "@/lib/types/wordpress";

const NUMERIC_PATTERN = /\d/;

/** Zebra-striped, mono-value spec table; collapses to stacked cards below md (Phase 2 §8, Phase 4 §6). */
export function SpecTable({ rows }: { rows: SpecTableRow[] }) {
  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border-default">
      <table className="hidden w-full text-sm md:table">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-surface-alt" : undefined}>
              <td className="w-1/3 px-5 py-3 text-text-muted">{row.label}</td>
              <td
                className="px-5 py-3 text-text-primary"
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
          <div key={i} className="flex flex-col gap-1 p-4">
            <span className="text-xs text-text-muted">{row.label}</span>
            <span
              className="text-text-primary"
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
