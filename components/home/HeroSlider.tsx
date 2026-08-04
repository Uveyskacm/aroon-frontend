"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const AUTOPLAY_MS = 6000;

export interface HeroSlide {
  src: string;
  alt: string;
}

/**
 * Full-bleed hero background slideshow — replaces the old 3D pipe canvas
 * (Phase 6) with plain photography. Built to take more than one slide from
 * day one even though only a single image exists right now: add entries to
 * the `images` array passed in from Hero.tsx when more photography is
 * ready, no other changes needed.
 */
export function HeroSlider({ images }: { images: HeroSlide[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2 || reduceMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [images.length, reduceMotion]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0">
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className="object-cover"
          style={{ opacity: i === index ? 1 : 0, transition: "opacity 700ms ease" }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-surface-stage/70 via-surface-stage/20 to-transparent" />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
