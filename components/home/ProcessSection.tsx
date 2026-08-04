"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { resolveIcon } from "@/lib/icons";
import type { HomeFields } from "@/lib/types/wordpress";

const STEP_DURATION_MS = 2600;

/**
 * Auto-advancing step showcase (replaces the old scroll-scrubbed/pinned
 * version — that required the visitor to actively scroll through the
 * section to see anything happen, which read as static on first glance).
 * Starts cycling once the section scrolls into view, loops continuously,
 * and pulses a glow on the active icon so each step visibly "lights up"
 * rather than just swapping a background color.
 */
export function ProcessSection({ process }: { process: HomeFields["process"] }) {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container, { once: false, amount: 0.4 });
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const steps = process.steps;

  useEffect(() => {
    if (!inView || reduceMotion || steps.length < 2) return;
    const timer = setInterval(() => {
      setActiveStep((i) => (i + 1) % steps.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(timer);
  }, [inView, reduceMotion, steps.length]);

  if (!steps.length) return null;

  return (
    <section
      ref={container}
      className="bg-surface-inverse py-[clamp(64px,8vw,128px)] text-text-inverse"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] text-center">
        {process.heading ? (
          <motion.h2
            className="text-[length:var(--text-h2)]"
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {process.heading}
          </motion.h2>
        ) : null}

        <div
          className="relative mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[repeat(var(--process-steps),1fr)]"
          style={{ ["--process-steps" as string]: Math.max(steps.length, 1) }}
        >
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border-inverse lg:block">
            <motion.div
              className="h-full origin-left bg-white"
              initial={reduceMotion ? undefined : { scaleX: 0 }}
              animate={reduceMotion ? undefined : { scaleX: activeStep / Math.max(steps.length - 1, 1) }}
              transition={{ duration: STEP_DURATION_MS / 1000, ease: "linear" }}
              style={reduceMotion ? { width: `${(activeStep / Math.max(steps.length - 1, 1)) * 100}%` } : undefined}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = resolveIcon(step.icon);
            const isActive = i === activeStep;
            return (
              <motion.div
                key={i}
                className="process-step relative flex flex-col items-center text-center"
                initial={reduceMotion ? undefined : { opacity: 0, y: 28, scale: 0.85 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <div className="relative flex h-12 w-12 items-center justify-center">
                  {isActive && !reduceMotion ? (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.9 }}
                      transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity }}
                    />
                  ) : null}
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-all duration-300 ease-out ${
                      isActive ? "scale-110 bg-white text-surface-inverse shadow-[0_0_20px_4px_rgba(255,255,255,0.45)]" : "opacity-55"
                    }`}
                  >
                    {Icon ? <Icon aria-hidden size={22} /> : <span>{i + 1}</span>}
                  </div>
                </div>
                <h3
                  className={`mt-4 text-[length:var(--text-h4)] transition-opacity duration-300 ease-out ${
                    isActive ? "" : "opacity-55"
                  }`}
                >
                  {step.title}
                </h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
