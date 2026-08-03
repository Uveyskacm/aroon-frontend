"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NavItem } from "@/lib/types/wordpress";

interface HeaderProps {
  nav: NavItem[];
  quoteLabel: string;
  companyName: string;
  logoUrl?: string | null;
}

/** Sticky header, desktop dropdowns + mobile hamburger (Phase 2 §7). */
export function Header({ nav, quoteLabel, companyName, logoUrl }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[1000] border-b border-border-default bg-surface-page">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-[clamp(20px,4vw,64px)]">
        <Link href="/" className="flex items-center gap-2 text-[1.4rem] font-bold text-accent-primary">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={companyName || "AROON"}
              width={0}
              height={0}
              sizes="200px"
              className="h-14 w-auto"
              priority
            />
          ) : (
            companyName || "AROON"
          )}
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                // @ts-expect-error dynamic WP-driven href, not statically typed pathname
                href={item.url}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-4 py-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-accent hover:text-accent-primary"
              >
                {item.label}
                {item.children.length ? (
                  <ChevronDown
                    aria-hidden
                    size={14}
                    className="transition-transform group-hover:rotate-180"
                  />
                ) : null}
              </Link>
              {item.children.length ? (
                <div className="invisible absolute left-0 top-full min-w-[240px] translate-y-2 rounded-[var(--radius-md)] border border-border-default bg-surface-page p-2 opacity-0 shadow-[var(--shadow-elevation-2)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      // @ts-expect-error dynamic WP-driven href
                      href={child.url}
                      className="block rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-accent hover:text-accent-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          <LanguageSwitcher
            className="hidden items-center gap-2 text-sm text-text-muted lg:flex"
            linkClassName="rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-accent hover:text-accent-primary"
          />
          <Link
            href="/quote"
            className={clsx(
              "hidden h-11 items-center rounded-[var(--radius-sm)] bg-accent-primary px-5 text-sm font-semibold text-text-inverse lg:flex",
              "transition-colors hover:bg-accent-primary-hover",
            )}
          >
            {quoteLabel}
          </Link>
          <button
            aria-label="Menüyü aç"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex items-center p-1.5 lg:hidden"
          >
            <Menu aria-hidden />
          </button>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={nav}
        quoteLabel={quoteLabel}
        companyName={companyName}
        logoUrl={logoUrl}
      />
    </header>
  );
}
