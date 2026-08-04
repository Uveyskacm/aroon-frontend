"use client";

import { useEffect } from "react";

const TEXT = {
  heading: "Bir şeyler ters gitti",
  body: "Sayfa yüklenirken beklenmeyen bir hata oluştu. Sorun genelde geçicidir.",
  retry: "Tekrar dene",
};

/**
 * Route-level error boundary. Without this, any uncaught render error
 * (e.g. a third-party asset failing to load) unmounts the whole app and
 * Next.js falls back to its generic blank "Application error" page.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-[length:var(--text-h2)] text-text-primary">{TEXT.heading}</h1>
      <p className="max-w-md text-text-muted">{TEXT.body}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-accent-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-hover"
      >
        {TEXT.retry}
      </button>
    </div>
  );
}
