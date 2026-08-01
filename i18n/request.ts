import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * next-intl is used here purely for locale-aware routing (the pathnames
 * dictionary in routing.ts) and locale-aware date/number formatting.
 * All visible copy — nav labels, form labels, UI chrome — is sourced from
 * WordPress (lib/api), never from a static message catalog, per the
 * architecture's "nothing hardcoded" rule. `messages` stays empty.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {},
  };
});
