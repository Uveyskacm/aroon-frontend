"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NavItem } from "@/lib/types/wordpress";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  quoteLabel: string;
  companyName: string;
  logoUrl?: string | null;
}

/**
 * Accessible accordion group for "Kurumsal"/"Kaynaklar" (Phase 2 §7):
 * <button aria-expanded aria-controls> triggers, not links; Escape
 * collapses and returns focus to the trigger.
 */
export function MobileNav({ open, onClose, nav, quoteLabel, companyName, logoUrl }: MobileNavProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-[1100] transition-opacity",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        style={{ background: "rgba(6,29,69,0.45)" }}
        onClick={onClose}
        aria-hidden
      />
      <aside
        aria-label="Mobil menü"
        className={clsx(
          "fixed inset-y-0 right-0 z-[1200] w-[min(340px,86vw)] overflow-y-auto bg-surface-page shadow-[var(--shadow-elevation-3)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border-default px-5 py-5">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={companyName || "AROON"}
              width={0}
              height={0}
              sizes="160px"
              className="h-10 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-accent-primary">{companyName || "AROON"}</span>
          )}
          <button aria-label="Menüyü kapat" onClick={onClose}>
            <X aria-hidden />
          </button>
        </div>

        <ul className="p-3">
          {nav.map((item) => {
            const isExpanded = expanded === item.id;
            const hasChildren = item.children.length > 0;
            return (
              <li key={item.id} className="border-b border-surface-alt">
                {hasChildren ? (
                  <>
                    <button
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-submenu-${item.id}`}
                      onClick={() => setExpanded(isExpanded ? null : item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setExpanded(null);
                      }}
                      className="flex w-full items-center justify-between px-2.5 py-4 text-left text-base font-semibold text-text-primary"
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden
                        className={clsx("transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>
                    <div
                      id={`mobile-submenu-${item.id}`}
                      role="region"
                      className={clsx("pl-3.5", isExpanded ? "block" : "hidden")}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          // @ts-expect-error dynamic WP-driven href
                          href={child.url}
                          onClick={onClose}
                          className="block px-2.5 py-3 text-sm font-medium text-text-muted"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    // @ts-expect-error dynamic WP-driven href
                    href={item.url}
                    onClick={onClose}
                    className="flex items-center justify-between px-2.5 py-4 text-base font-semibold text-text-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="p-5">
          <Link
            href="/quote"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-accent-primary text-sm font-semibold text-text-inverse"
          >
            {quoteLabel}
          </Link>
          <LanguageSwitcher
            className="mt-4 flex items-center justify-center gap-3 text-sm text-text-muted"
            linkClassName="rounded-[var(--radius-sm)] px-2.5 py-1.5 hover:bg-surface-accent hover:text-accent-primary"
          />
        </div>
      </aside>
    </>
  );
}
