"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { HomeFields } from "@/lib/types/wordpress";

gsap.registerPlugin(ScrollTrigger);

export function CorporateIntro({ intro, stats }: { intro: HomeFields["intro"]; stats: HomeFields["stats"] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      gsap.set([".intro-media", ".intro-copy"], { opacity: 0.9, y: 24 });
      gsap.to(".intro-media", {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
      gsap.to(".intro-copy", {
        opacity: 1,
        y: 0,
        duration: 0.45,
        delay: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: container, dependencies: [reduceMotion] },
  );

  if (!intro.heading) return null;

  return (
    <section ref={container} className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-[clamp(64px,8vw,128px)]">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="intro-media relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-alt order-2 lg:order-1">
          {intro.image ? (
            <Image
              src={intro.image.sizes.large ?? intro.image.url}
              alt={intro.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="intro-copy order-1 lg:order-2">
          {intro.eyebrow ? (
            <span className="text-[length:var(--text-caption)] font-medium uppercase tracking-[0.04em] text-text-muted">
              {intro.eyebrow}
            </span>
          ) : null}
          <h2 className="mt-2 text-[length:var(--text-h2)] text-text-primary">{intro.heading}</h2>
          {intro.body ? <p className="mt-4 max-w-[65ch] text-text-muted">{intro.body}</p> : null}
          {intro.ctaLabel ? (
            <Link href="/about" className="mt-6 inline-block font-semibold text-text-link hover:text-text-link-hover">
              {intro.ctaLabel} →
            </Link>
          ) : null}
        </div>
      </div>

      {stats.length ? (
        <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 lg:justify-start">
          {stats.map((stat, i) => (
            <div key={i} className="text-center lg:text-left">
              <div className="text-[length:var(--text-h2)] font-medium text-accent-primary">{stat.value}</div>
              <div className="mt-1 text-[length:var(--text-body-sm)] text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
