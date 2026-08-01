"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const LABELS = {
  tr: {
    name: "Ad Soyad", company: "Şirket", email: "E-posta", phone: "Telefon",
    subject: "Konu", message: "Mesajınız",
    kvkkConsentBefore: "", kvkkConsentLink: "KVKK Aydınlatma Metni'ni", kvkkConsentAfter: " okudum, kabul ediyorum.",
    submit: "Gönder", submitting: "Gönderiliyor...",
    success: "Mesajınız alındı, en kısa sürede size dönüş yapacağız.",
    error: "Bir hata oluştu, lütfen tekrar deneyin.",
    notReady: "Form gönderimi şu anda kullanılamıyor. Lütfen bizimle doğrudan iletişime geçin veya daha sonra tekrar deneyin.",
  },
  en: {
    name: "Full Name", company: "Company", email: "Email", phone: "Phone",
    subject: "Subject", message: "Message",
    kvkkConsentBefore: "I have read and accept the ", kvkkConsentLink: "KVKK Privacy Notice", kvkkConsentAfter: ".",
    submit: "Send", submitting: "Sending...",
    success: "Your message has been received — we'll get back to you shortly.",
    error: "Something went wrong, please try again.",
    notReady: "Form submission is temporarily unavailable. Please contact us directly, or try again later.",
  },
};

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ locale, kvkkReady }: { locale: Locale; kvkkReady: boolean }) {
  const t = LABELS[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kvkkReady) return;
    setStatus("submitting");
    setErrorMessage("");

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.kvkkConsent = form.get("kvkkConsent") === "true";

    if (TURNSTILE_SITE_KEY) {
      const token = (window as unknown as { turnstile?: { getResponse: () => string } }).turnstile?.getResponse();
      if (token) payload.turnstileToken = token;
    }

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.error);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-md)] bg-surface-accent p-8 text-center">
        <p className="text-lg font-semibold text-accent-primary">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input type="hidden" name="locale" value={locale} />

      {!kvkkReady ? (
        <p role="alert" className="rounded-[var(--radius-sm)] border border-state-error bg-surface-alt p-3.5 text-sm text-state-error">
          {t.notReady}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.name} *
          </label>
          <input id="name" name="name" required className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm" />
        </div>
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.company}
          </label>
          <input id="company" name="company" className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.email} *
          </label>
          <input id="email" name="email" type="email" required className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.phone}
          </label>
          <input id="phone" name="phone" type="tel" className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.subject}
          </label>
          <input id="subject" name="subject" className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-primary">
            {t.message} *
          </label>
          <textarea id="message" name="message" required rows={5} className="w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 py-2.5 text-sm" />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-text-muted">
        <input type="checkbox" name="kvkkConsent" value="true" required disabled={!kvkkReady} className="mt-0.5" />
        {kvkkReady ? (
          <span>
            {t.kvkkConsentBefore}
            <Link href="/kvkk" className="underline">
              {t.kvkkConsentLink}
            </Link>
            {t.kvkkConsentAfter}
          </span>
        ) : (
          <span>{t.kvkkConsentBefore + t.kvkkConsentLink + t.kvkkConsentAfter}</span>
        )}
      </label>

      <TurnstileWidget locale={locale} />

      {status === "error" ? (
        <p role="alert" aria-live="polite" className="text-sm text-state-error">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={status === "submitting"} disabled={!kvkkReady}>
        {status === "submitting" ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
