/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/lib/types/wordpress";

const EMPTY_SETTINGS: SiteSettings = {
  companyName: "",
  logoUrl: null,
  hqAddress: "",
  factoryAddress: "",
  phone: "",
  email: "",
  whatsappNumber: "",
  businessHours: "",
  mapsEmbedUrl: "",
  socialLinks: [],
  footerBlurb: "",
  foundingYear: null,
  productionCapacity: "",
  employeeCount: null,
  exportCountries: [],
  certifications: [],
  ga4MeasurementId: null,
  metaPixelId: null,
  searchConsoleTag: null,
};

/**
 * Unverified-facts policy (Phase 1 "Resolved decisions" §5): any field WP
 * hasn't been given real data for arrives empty here, and callers must
 * render nothing for an empty value rather than inventing a placeholder.
 */
export async function getSettings(locale: Locale): Promise<SiteSettings> {
  try {
    const raw = await fetchWp<any>(`/aroon/v1/settings?lang=${locale}`, {
      cache: "no-store",
    });
    return { ...EMPTY_SETTINGS, ...(raw?.data ?? {}) };
  } catch {
    return EMPTY_SETTINGS;
  }
}
