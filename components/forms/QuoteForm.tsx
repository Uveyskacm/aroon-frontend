"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const LABELS = {
  tr: {
    name: "Ad Soyad", company: "Şirket", phone: "Telefon", email: "E-posta",
    country: "Ülke", city: "Şehir", interestedGroup: "İlgilenilen Ürün Grubu",
    productName: "Ürün Adı", materialType: "Malzeme Türü", size: "Ölçü",
    wallThickness: "Et Kalınlığı", length: "Uzunluk", quantity: "Miktar",
    useCase: "Kullanım Alanı", deliveryLocation: "Teslimat Yeri", description: "Açıklama",
    technicalFile: "Teknik Dosya (opsiyonel)",
    kvkkConsentBefore: "", kvkkConsentLink: "KVKK Aydınlatma Metni'ni", kvkkConsentAfter: " okudum, kabul ediyorum.",
    submit: "Teklif Talebini Gönder", submitting: "Gönderiliyor...",
    success: (ref: string) => `Talebiniz alındı. Referans numaranız: ${ref}`,
    error: "Bir hata oluştu, lütfen tekrar deneyin.",
    fileTooLarge: "Dosya boyutu 10MB sınırını aşıyor.",
    notReady: "Form gönderimi şu anda kullanılamıyor. Lütfen bizimle doğrudan iletişime geçin veya daha sonra tekrar deneyin.",
  },
  en: {
    name: "Full Name", company: "Company", phone: "Phone", email: "Email",
    country: "Country", city: "City", interestedGroup: "Product Group of Interest",
    productName: "Product Name", materialType: "Material Type", size: "Size",
    wallThickness: "Wall Thickness", length: "Length", quantity: "Quantity",
    useCase: "Use Case", deliveryLocation: "Delivery Location", description: "Description",
    technicalFile: "Technical File (optional)",
    kvkkConsentBefore: "I have read and accept the ", kvkkConsentLink: "KVKK Privacy Notice", kvkkConsentAfter: ".",
    submit: "Submit Quote Request", submitting: "Submitting...",
    success: (ref: string) => `Your request has been received. Reference: ${ref}`,
    error: "Something went wrong, please try again.",
    fileTooLarge: "File exceeds the 10MB limit.",
    notReady: "Form submission is temporarily unavailable. Please contact us directly, or try again later.",
  },
};

const FIELDS: { name: string; type: "text" | "email" | "tel" | "number" | "textarea"; required?: boolean }[] = [
  { name: "name", type: "text", required: true },
  { name: "company", type: "text" },
  { name: "phone", type: "tel", required: true },
  { name: "email", type: "email", required: true },
  { name: "country", type: "text" },
  { name: "city", type: "text" },
  { name: "interestedGroup", type: "text" },
  { name: "productName", type: "text" },
  { name: "materialType", type: "text" },
  { name: "size", type: "text" },
  { name: "wallThickness", type: "text" },
  { name: "length", type: "text" },
  { name: "quantity", type: "number" },
  { name: "useCase", type: "text" },
  { name: "deliveryLocation", type: "text" },
  { name: "description", type: "textarea" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function QuoteForm({ locale, kvkkReady }: { locale: Locale; kvkkReady: boolean }) {
  const t = LABELS[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [referenceId, setReferenceId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileError, setFileError] = useState("");
  // Lazy initializer — read once at mount for the anti-spam elapsed-time check (Phase 1 "Resolved decisions" §1).
  const [formLoadedAt] = useState(() => Date.now());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_FILE_BYTES) {
      setFileError(t.fileTooLarge);
      e.target.value = "";
    } else {
      setFileError("");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kvkkReady) return;
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    if (TURNSTILE_SITE_KEY) {
      const token = (window as unknown as { turnstile?: { getResponse: () => string } }).turnstile?.getResponse();
      if (token) formData.set("turnstileToken", token);
    }

    try {
      const res = await fetch("/api/forms/quote", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.error);
      setReferenceId(data.referenceId ?? "");
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-md)] bg-surface-accent p-8 text-center">
        <p className="text-lg font-semibold text-accent-primary">{t.success(referenceId)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Honeypot field — hidden from real users, filled only by bots (Phase 1 "Resolved decisions" §1) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input type="hidden" name="formLoadedAt" value={formLoadedAt} />
      <input type="hidden" name="locale" value={locale} />

      {!kvkkReady ? (
        <p role="alert" className="rounded-[var(--radius-sm)] border border-state-error bg-surface-alt p-3.5 text-sm text-state-error">
          {t.notReady}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
            <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-text-primary">
              {t[field.name as keyof typeof t] as string}
              {field.required ? " *" : ""}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                className="w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 py-2.5 text-sm"
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-alt px-3.5 text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="technicalFile" className="mb-1.5 block text-sm font-medium text-text-primary">
          {t.technicalFile}
        </label>
        <input
          id="technicalFile"
          name="technicalFile"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.dwg,.zip"
          onChange={handleFileChange}
          className="w-full text-sm"
        />
        {fileError ? <p className="mt-1 text-sm text-state-error">{fileError}</p> : null}
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

      <Button type="submit" size="lg" loading={status === "submitting"} disabled={Boolean(fileError) || !kvkkReady}>
        {status === "submitting" ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
