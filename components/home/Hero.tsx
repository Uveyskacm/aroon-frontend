"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useWebglSupport } from "@/lib/useWebglSupport";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Link } from "@/i18n/navigation";
import type { HomeFields } from "@/lib/types/wordpress";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

interface HeroProps {
  hero: HomeFields["hero"];
}

/**
 * Poster is the LCP element in the initial payload; the R3F canvas mounts
 * post-hydration only at md+, only with WebGL2 support, only without
 * prefers-reduced-motion — then crossfades in over the poster on its
 * first rendered frame (Phase 6 §6, §7, §8).
 */
export function Hero({ hero }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const webglSupported = useWebglSupport();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sceneReady, setSceneReady] = useState(false);

  const shouldMount3d =
    hero.visualMode === "3d" && isDesktop && webglSupported === true && !reduceMotion;

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden bg-surface-stage text-text-inverse">
      <div className="absolute inset-0">
        {hero.fallbackImage ? (
          <Image
            src={hero.fallbackImage.sizes.large ?? hero.fallbackImage.url}
            alt={hero.fallbackImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ opacity: sceneReady ? 0 : 1, transition: "opacity 350ms ease" }}
          />
        ) : null}
        {shouldMount3d ? (
          <div
            className="absolute inset-0"
            style={{ opacity: sceneReady ? 1 : 0, transition: "opacity 350ms ease" }}
          >
            <HeroScene onFirstFrame={() => setSceneReady(true)} />
          </div>
        ) : null}
      </div>

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
