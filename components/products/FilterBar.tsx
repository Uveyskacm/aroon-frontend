"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import type { ProductCategory } from "@/lib/types/wordpress";

interface FilterBarProps {
  categories: ProductCategory[];
  locale: "tr" | "en";
}

const LABELS = {
  tr: { search: "Ürün ara...", allCategories: "Tüm Kategoriler", clear: "Filtreleri Temizle" },
  en: { search: "Search products...", allCategories: "All Categories", clear: "Clear Filters" },
};

/** Every filter state is a real URL — server-rendered, never client-only (Phase 4 §5). */
export function FilterBar({ categories, locale }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = LABELS[locale];

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const category = searchParams.get("category") ?? "";
  const hasActiveFilter = Boolean(category || searchParams.get("q"));

  function updateParams(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    params.delete("page"); // reset to page 1 on any filter change (Phase 4 §5)
    startTransition(() => {
      router.push({ pathname, query: Object.fromEntries(params) } as never);
    });
  }

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function handleSearchChange(value: string) {
    setQ(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => updateParams({ q: value }), 300);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search aria-hidden size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t.search}
          className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt pl-10 pr-4 text-sm"
        />
      </div>
      <select
        value={category}
        onChange={(e) => updateParams({ category: e.target.value })}
        className="h-11 rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3 text-sm"
      >
        <option value="">{t.allCategories}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      {hasActiveFilter ? (
        <button
          onClick={() => {
            setQ("");
            router.push(pathname as never);
          }}
          className="flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] px-4 text-sm font-semibold text-accent-primary hover:bg-surface-accent"
        >
          <X aria-hidden size={16} />
          {t.clear}
        </button>
      ) : null}
    </div>
  );
}
