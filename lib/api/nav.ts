/* eslint-disable @typescript-eslint/no-explicit-any -- raw, untyped WP REST payloads; adapters below narrow them */
import { fetchWp } from "./client";
import type { Locale } from "@/i18n/routing";
import type { NavItem } from "@/lib/types/wordpress";

export async function getNav(location: "primary" | "footer_legal", locale: Locale): Promise<NavItem[]> {
  try {
    const raw = await fetchWp<any>(
      `/aroon/v1/nav?location=${location}&lang=${locale}`,
      { tags: ["nav"], revalidate: 86400 },
    );
    return raw?.data ?? [];
  } catch {
    return [];
  }
}
