"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { HomeFields } from "@/lib/types/wordpress";

export function CtaBand({ cta }: { cta: HomeFields["cta"] }) {
  if (!cta.heading) return null;

  return (
    <motion.section
      initial={{ opacity: 0.9, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="bg-accent-primary py-16 text-text-inverse"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-[clamp(20px,4vw,64px)] text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-[length:var(--text-h2)]">{cta.heading}</h2>
          {cta.body ? <p className="mt-2 text-text-inverse-muted">{cta.body}</p> : null}
        </div>
        {cta.buttonLabel ? (
          <Link
            href="/quote"
            className="flex h-[52px] shrink-0 items-center rounded-[var(--radius-sm)] bg-white px-7 text-base font-semibold text-accent-primary"
          >
            {cta.buttonLabel}
          </Link>
        ) : null}
      </div>
    </motion.section>
  );
}
