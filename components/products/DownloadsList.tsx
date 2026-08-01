import { FileText, ShieldCheck, BookOpen, Ruler, Download } from "lucide-react";
import type { DownloadItem, DownloadType } from "@/lib/types/wordpress";

const TYPE_META: Record<DownloadType, { icon: typeof FileText; label: { tr: string; en: string } }> = {
  technical_datasheet: { icon: FileText, label: { tr: "Teknik Veri Föyü", en: "Technical Datasheet" } },
  certificate: { icon: ShieldCheck, label: { tr: "Sertifika", en: "Certificate" } },
  installation_guide: { icon: BookOpen, label: { tr: "Montaj Kılavuzu", en: "Installation Guide" } },
  cad_drawing: { icon: Ruler, label: { tr: "CAD Çizimi", en: "CAD Drawing" } },
  pdf_catalogue: { icon: FileText, label: { tr: "PDF Katalog", en: "PDF Catalogue" } },
};

function formatSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** Grouped by type, direct-linked to WP media, no proxy (Phase 4 §7). */
export function DownloadsList({ downloads, locale }: { downloads: DownloadItem[]; locale: "tr" | "en" }) {
  if (!downloads.length) return null;

  const grouped = downloads.reduce<Record<string, DownloadItem[]>>((acc, item) => {
    (acc[item.type] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {(Object.keys(grouped) as DownloadType[]).map((type) => {
        const meta = TYPE_META[type];
        const Icon = meta?.icon ?? FileText;
        return (
          <div key={type}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Icon aria-hidden size={18} className="text-accent-primary" />
              {meta?.label[locale] ?? type}
            </div>
            <div className="flex flex-col gap-2">
              {grouped[type].map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border-default px-4 py-3 hover:bg-surface-accent"
                >
                  <span className="text-sm text-text-primary">
                    {item.label || item.filename}
                    <span className="ml-2 text-xs text-text-muted">{formatSize(item.filesize)}</span>
                  </span>
                  <Download aria-hidden size={16} className="text-accent-primary" />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
