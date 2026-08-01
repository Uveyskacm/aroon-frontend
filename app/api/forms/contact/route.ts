import { NextResponse, type NextRequest } from "next/server";
import { getLegalStatus } from "@/lib/api/legal";
import type { Locale } from "@/i18n/routing";

const WP_API_URL = process.env.WP_API_URL ?? "https://cms.aroon.com.tr";
const BRIDGE_SECRET = process.env.AROON_API_BRIDGE_SECRET;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

const REQUIRED_FIELDS = ["name", "email", "message", "kvkkConsent"];

async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;
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

export async function POST(request: NextRequest) {
  if (!BRIDGE_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json();

  const locale = (body.locale as Locale | undefined) ?? "tr";
  const legalStatus = await getLegalStatus(locale);
  if (!legalStatus.kvkk.ready) {
    return NextResponse.json(
      { error: "Form submission is temporarily unavailable (KVKK notice not configured)." },
      { status: 503 },
    );
  }

  const turnstileOk = await verifyTurnstile(body.turnstileToken ?? null);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Doğrulama başarısız" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || (field === "kvkkConsent" && body[field] !== true)) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const payload = { ...body };
  delete payload.turnstileToken;

  try {
    const wpRes = await fetch(`${WP_API_URL}/wp-json/aroon/v1/contact-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Bridge-Secret": BRIDGE_SECRET },
      body: JSON.stringify(payload),
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
