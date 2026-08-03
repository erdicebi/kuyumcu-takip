"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center p-6"><div className="card max-w-md p-8 text-center"><h1 className="text-2xl font-bold">Bir sorun oluştu</h1><p className="mt-3 text-sm opacity-70">Sayfayı yeniden deneyin.</p><button className="btn-primary mt-6" onClick={reset}>Tekrar dene</button></div></main>;
}
