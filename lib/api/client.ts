import type { Locale } from "@/i18n/routing";

const WP_API_URL = process.env.WP_API_URL ?? "https://cms.aroon.com.tr";

export class WpApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "WpApiError";
  }
}

interface FetchWpOptions {
  tags?: string[];
  revalidate?: number;
  cache?: RequestCache;
}

/**
 * Every WP REST read goes through here so error shape stays consistent
 * across every lib/api/* module. Failures are thrown, not swallowed —
 * callers decide whether a missing WP response is fatal (build-time SSG)
 * or recoverable (a "no content yet" render).
 *
 * Always fetches fresh (no ISR tag/revalidate caching): the on-demand
 * revalidateTag webhook proved unreliable in practice — WP edits (settings,
 * home page content) kept serving stale data well after save, even with a
 * manually-triggered revalidate call. `cache` is a caller override, never
 * exercised via `tags`/`revalidate` alone.
 */
export async function fetchWp<T>(
  path: string,
  { cache }: FetchWpOptions = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${WP_API_URL}${path}`;

  const res = await fetch(url, { cache: cache ?? "no-store" });

  if (!res.ok) {
    throw new WpApiError(
      `WordPress REST request failed: ${res.status} ${url}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

export function withLang(path: string, locale: Locale, params: Record<string, string | number | undefined> = {}) {
  const search = new URLSearchParams();
  search.set("lang", locale);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  return `${path}?${search.toString()}`;
}
