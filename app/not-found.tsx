import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="card max-w-md p-8 text-center">
        <p className="text-sm font-bold text-gold-600">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-muted">Aradığınız kayıt silinmiş veya bağlantı değişmiş olabilir.</p>
        <Link href="/panel" className="primary-button mt-6 w-full">
          <ArrowLeft size={17} aria-hidden="true" /> Panele dön
        </Link>
      </section>
    </main>
  );
}
