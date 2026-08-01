"use client";

import Script from "next/script";
import type { Locale } from "@/i18n/routing";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Renders nothing when no site key is configured (today, pre-launch) — the
 * moment `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set in production this starts
 * rendering the real widget, which is what QuoteForm/ContactForm's
 * `window.turnstile?.getResponse()` call expects to find (Step 1 Blocker
 * #3: without this, a live secret key + no widget silently fails every
 * submission). Implicit rendering (Cloudflare's default `cf-turnstile`
 * class scan) — matches the no-widget-id `getResponse()` call already in
 * both forms, which only works for a single, implicitly-rendered widget.
 */
export function TurnstileWidget({ locale }: { locale: Locale }) {
  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-language={locale} />
    </>
  );
}
