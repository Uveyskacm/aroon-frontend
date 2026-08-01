"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { resolveIcon } from "@/lib/icons";
import type { HomeFields } from "@/lib/types/wordpress";

gsap.registerPlugin(ScrollTrigger);

/**
 * The one GSAP-pinned section on the page (Phase 3/Phase 6 §4). Desktop
 * (lg+) pins and scroll-links step activation; mobile plain-fades via
 * Motion. ScrollTrigger.matchMedia() owns its own teardown/rebuild across
 * the breakpoint, no hand-rolled resize logic.
 */
export function ProcessSection({ process }: { process: HomeFields["process"] }) {
  const container = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const steps = process.steps;

  useGSAP(
    () => {
      if (reduceMotion || !steps.length) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const stepEls = gsap.utils.toArray<HTMLElement>(".process-step");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: `+=${steps.length * 60}%`,
            pin: true,
            scrub: 0.5,
          },
        });

        stepEls.forEach((el, i) => {
          tl.to(
            {},
            {
              duration: 1,
              onStart: () => setActiveStep(i),
              onReverseComplete: () => setActiveStep(Math.max(0, i - 1)),
            },
          );
        });

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: container, dependencies: [steps.length, reduceMotion] },
  );

  if (!steps.length) return null;

  return (
    <section
      ref={container}
      className="bg-surface-inverse py-[clamp(64px,8vw,128px)] text-text-inverse"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)]">
        {process.heading ? (
          <h2 className="text-[length:var(--text-h2)]">{process.heading}</h2>
        ) : null}

        <div
          className="relative mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[repeat(var(--process-steps),1fr)]"
          style={{ ["--process-steps" as string]: Math.max(steps.length, 1) }}
        >
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border-inverse lg:block">
            <div
              className="h-full bg-white transition-[width] duration-300"
              style={{ width: `${(activeStep / Math.max(steps.length - 1, 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = resolveIcon(step.icon);
            const isActive = i === activeStep;
            return (
              <motion.div
                key={i}
                className="process-step relative"
                initial={reduceMotion ? undefined : { opacity: 0.9, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
                style={{
                  opacity: isActive ? 1 : 0.55,
                  transform: `scale(${isActive ? 1 : 0.96})`,
                  transition: "opacity 300ms ease, transform 300ms ease",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  {Icon ? <Icon aria-hidden size={22} /> : <span>{i + 1}</span>}
                </div>
                <h3 className="mt-4 text-[length:var(--text-h4)]">{step.title}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
