import { NextResponse, type NextRequest } from "next/server";
import { getLegalStatus } from "@/lib/api/legal";
import type { Locale } from "@/i18n/routing";

const WP_API_URL = process.env.WP_API_URL ?? "https://cms.aroon.com.tr";
const BRIDGE_SECRET = process.env.AROON_API_BRIDGE_SECRET;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB (Phase 1 file-hardening addendum)
const REQUIRED_FIELDS = ["name", "email", "phone", "kvkkConsent"];

async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // not configured yet in this environment — scaffold-time bypass
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Browser never calls WordPress directly for writes (Phase 1 §3). This
 * handler verifies Turnstile + required fields server-side (never trusts
 * client validation alone), then forwards to the WP custom endpoint with
 * the bridge secret, which the browser never sees.
 */
export async function POST(request: NextRequest) {
  if (!BRIDGE_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const formData = await request.formData();

  const locale = (formData.get("locale") as Locale | null) ?? "tr";
  const legalStatus = await getLegalStatus(locale);
  if (!legalStatus.kvkk.ready) {
    return NextResponse.json(
      { error: "Form submission is temporarily unavailable (KVKK notice not configured)." },
      { status: 503 },
    );
  }

  const turnstileOk = await verifyTurnstile(formData.get("turnstileToken") as string | null);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Doğrulama başarısız" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = formData.get(field);
    if (!value || (field === "kvkkConsent" && value !== "true")) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const file = formData.get("technicalFile");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Dosya boyutu 10MB sınırını aşıyor" }, { status: 400 });
    }
    const allowedExt = [".pdf", ".jpg", ".jpeg", ".png", ".dwg", ".zip"];
    const hasAllowedExt = allowedExt.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExt) {
      return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
    }
  }

  const proxyBody = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === "turnstileToken") continue;
    proxyBody.append(key, value);
  }

  try {
    const wpRes = await fetch(`${WP_API_URL}/wp-json/aroon/v1/quote-request`, {
      method: "POST",
      headers: { "X-Bridge-Secret": BRIDGE_SECRET },
      body: proxyBody,
    });

    if (!wpRes.ok) {
      return NextResponse.json({ error: "Gönderim başarısız oldu, lütfen tekrar deneyin." }, { status: 502 });
    }

    const data = await wpRes.json();
    return NextResponse.json({ success: true, referenceId: data.referenceId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamıyor." }, { status: 502 });
  }
}
