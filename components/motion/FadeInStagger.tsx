"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const STAGGER_CAP = 6;
const CHILD_DELAY = 0.06;
const REVEAL_DISTANCE = 24;
const REVEAL_OPACITY_START = 0.9;

/**
 * Shared entrance mechanism for every repeated/list content grid site-wide
 * (Product/Catalog/News/Reference/Category/Why grids — Phase 2 §9, Phase 6
 * §3). Individually staggers the first STAGGER_CAP children, then group-
 * fades the rest so a large grid never takes seconds to finish appearing.
 */
export function FadeInStagger({ children }: { children: ReactNode[] }) {
  const reduceMotion = useReducedMotion();
  const items = children;
  const individually = items.slice(0, STAGGER_CAP);
  const rest = items.slice(STAGGER_CAP);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <>
      {individually.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: REVEAL_OPACITY_START, y: REVEAL_DISTANCE }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
            delay: i * CHILD_DELAY,
          }}
        >
          {child}
        </motion.div>
      ))}
      {rest.length ? (
        <motion.div
          initial={{ opacity: REVEAL_OPACITY_START }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="contents"
        >
          {rest}
        </motion.div>
      ) : null}
    </>
  );
}
