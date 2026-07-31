"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="card max-w-md p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-600">
          <AlertCircle aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Bir sorun oluştu</h1>
        <p className="mt-2 text-sm leading-6 text-muted">İşlem tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.</p>
        <button type="button" onClick={reset} className="primary-button mt-6 w-full">
          <RefreshCw size={17} aria-hidden="true" /> Tekrar dene
        </button>
      </section>
    </main>
  );
}
