import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const REVALIDATE_SECRET = process.env.WP_REVALIDATE_SECRET;

type RevalidateType =
  | "product"
  | "catalog"
  | "news"
  | "reference"
  | "page"
  | "settings"
  | "nav"
  | "home";

interface RevalidatePayload {
  type: RevalidateType;
  slug?: string;
  locale?: string;
  featured?: boolean;
}

/**
 * WP fires this on save_post/settings-save (Phase 1 §"Resolved decisions"
 * item 8). Constant-time secret compare, then maps `type` to the specific
 * cache tags/paths that need invalidating — never a blanket revalidateTag
 * of everything, since that would defeat the point of tagged caching.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("X-Revalidate-Secret");

  if (!REVALIDATE_SECRET || !secret || !timingSafeEqual(secret, REVALIDATE_SECRET)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const payload = (await request.json()) as RevalidatePayload;
  const { type, slug, locale } = payload;

  const pluralTag: Record<RevalidateType, string> = {
    product: "products",
    catalog: "catalogs",
    news: "news",
    reference: "references",
    page: "pages",
    settings: "settings",
    nav: "nav",
    home: "home",
  };

  revalidateTag(pluralTag[type]);
  if (slug) revalidateTag(`${type}:${slug}`);
  if (type === "settings") revalidateTag("nav");
  if (type === "product" && locale && slug) revalidatePath(`/${locale}/urunler/${slug}`);
  if (type === "catalog" && payload.featured) revalidateTag("featured-catalogs");
  if (type === "reference" && payload.featured) revalidateTag("featured-references");
  if (type === "news" && payload.featured) revalidateTag("featured-news");

  revalidatePath("/sitemap.xml");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
