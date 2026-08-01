import { fetchWp } from "./client";
import type { Locale } from "@/i18n/routing";

export interface LegalPageStatus {
  exists: boolean;
  published: boolean;
  hasContent: boolean;
  ready: boolean;
}

export interface LegalStatus {
  kvkk: LegalPageStatus;
  privacy: LegalPageStatus;
  cookie: LegalPageStatus;
}

const NOT_READY: LegalPageStatus = { exists: false, published: false, hasContent: false, ready: false };

/**
 * Step 2 Blocker #4: neither this function nor its caller ever fabricates
 * KVKK content — a fetch failure fails closed to "not ready" (never
 * "assume ready"), since the consequence of over-trusting here is a live
 * consent checkbox pointing at a broken or empty legal notice.
 */
export async function getLegalStatus(locale: Locale): Promise<LegalStatus> {
  try {
    const raw = await fetchWp<{ data: LegalStatus }>(`/aroon/v1/legal-status?lang=${locale}`, {
      tags: ["pages", "legal-status"],
      revalidate: 300,
    });
    return {
      kvkk: raw?.data?.kvkk ?? NOT_READY,
      privacy: raw?.data?.privacy ?? NOT_READY,
      cookie: raw?.data?.cookie ?? NOT_READY,
    };
  } catch {
    return { kvkk: NOT_READY, privacy: NOT_READY, cookie: NOT_READY };
  }
}
