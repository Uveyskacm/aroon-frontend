"use client";

import { motion, useReducedMotion } from "motion/react";

const LABEL: Record<"tr" | "en", string> = {
  tr: "WhatsApp'tan yaz",
  en: "Chat on WhatsApp",
};

/** wa.me only accepts bare digits (country code + number, no +/spaces/parens). */
function toWhatsAppDigits(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

/**
 * Fixed, site-wide contact shortcut (Phase 15 follow-up). Offset higher on
 * mobile (`bottom-20`) so it never sits on top of the product detail page's
 * own fixed mobile "Get a Quote" bar (`fixed inset-x-4 bottom-4`).
 */
export function WhatsAppButton({ phoneNumber, locale }: { phoneNumber: string; locale: "tr" | "en" }) {
  const reduceMotion = useReducedMotion();
  const digits = toWhatsAppDigits(phoneNumber);
  if (!digits) return null;

  return (
    <motion.a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL[locale]}
      title={LABEL[locale]}
      className="fixed bottom-20 right-4 z-[950] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-elevation-2)] transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.94.55 3.826 1.593 5.464L2 22l4.657-1.575A9.94 9.94 0 0 0 12.004 22C17.522 22 22 17.522 22 12.004 22 6.486 17.522 2 12.004 2zm0 18.166a8.14 8.14 0 0 1-4.15-1.135l-.298-.177-3.055 1.034 1.02-3.007-.194-.31a8.155 8.155 0 0 1-1.253-4.367c0-4.507 3.667-8.174 8.174-8.174s8.174 3.667 8.174 8.174-3.667 8.174-8.174 8.174z" />
      </svg>
    </motion.a>
  );
}
