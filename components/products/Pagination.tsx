import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

/**
 * Numbered, crawlable pagination that preserves active category/search
 * state (Phase 4 §1). Renders nothing when the result set fits one page.
 */
export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const query: Record<string, string> = {};
    if (searchParams.category) query.category = searchParams.category;
    if (searchParams.q) query.q = searchParams.q;
    if (targetPage > 1) query.page = String(targetPage);
    return { pathname: "/products" as const, query };
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Sayfalar" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-border-default ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-accent"
        }`}
      >
        <ChevronLeft aria-hidden size={16} />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-sm font-semibold ${
            p === page ? "bg-accent-primary text-text-inverse" : "border border-border-default hover:bg-surface-accent"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-border-default ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-accent"
        }`}
      >
        <ChevronRight aria-hidden size={16} />
      </Link>
    </nav>
  );
}
