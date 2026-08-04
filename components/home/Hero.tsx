"use client";

import { motion } from "motion/react";
import { HeroSlider, type HeroSlide } from "@/components/home/HeroSlider";
import { Link } from "@/i18n/navigation";
import type { HomeFields } from "@/lib/types/wordpress";

/**
 * Hardcoded for now (Phase 16 follow-up to the old 3D pipe canvas) — add
 * more entries here once more hero photography is ready, no other changes
 * needed. Falls back to the WP-managed `hero.fallbackImage` if this array
 * is ever emptied out.
 */
const SLIDES: HeroSlide[] = [{ src: "/hero/hero-pipes-1.png", alt: "" }];

interface HeroProps {
  hero: HomeFields["hero"];
}

export function Hero({ hero }: HeroProps) {
  const slides = SLIDES.length ? SLIDES : hero.fallbackImage ? [{ src: hero.fallbackImage.url, alt: hero.fallbackImage.alt }] : [];

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden bg-surface-stage text-text-inverse">
      <HeroSlider images={slides} />

      <div className="relative mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-32">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-[length:var(--text-display)] font-medium"
        >
          {hero.headline}
        </motion.h1>
        {hero.subheadline ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-[length:var(--text-body-lg)] text-text-inverse-muted"
          >
            {hero.subheadline}
          </motion.p>
        ) : null}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap gap-4"
        >
          {hero.primaryCtaLabel ? (
            <Link
              href="/products"
              className="flex h-[52px] items-center rounded-[var(--radius-sm)] bg-white px-7 text-base font-semibold text-accent-primary"
            >
              {hero.primaryCtaLabel}
            </Link>
          ) : null}
          {hero.secondaryCtaLabel ? (
            <Link
              href="/quote"
              className="flex h-[52px] items-center rounded-[var(--radius-sm)] border border-border-inverse px-7 text-base font-semibold text-text-inverse"
            >
              {hero.secondaryCtaLabel}
            </Link>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
