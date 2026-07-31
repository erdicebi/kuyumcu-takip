import type { Metadata } from "next";
import { Gem, LockKeyhole, Smartphone } from "lucide-react";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-gold-300/10 blur-3xl" />
        <Brand />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gold-300">
            <Gem size={14} aria-hidden="true" /> Kuyumcular için tasarlandı
          </span>
          <h1 className="mt-6 text-6xl font-bold leading-[1.02] tracking-[-0.055em]">Faturalarınız,<br /><span className="text-gold-300">tek bakışta.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">24 ayar işlemlerinizi hızlıca kaydedin, bekleyenleri takip edin ve kesilen faturaları güvenle saklayın.</p>
        </div>
        <div className="relative flex gap-6 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-2"><LockKeyhole size={14} /> Güvenli erişim</span>
          <span className="flex items-center gap-2"><Smartphone size={14} /> iPhone&apos;a kurulabilir</span>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <div className="card p-6 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Hoş geldiniz</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em]">Hesabınıza giriş yapın</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Fatura panelinize güvenli şekilde erişin.</p>
            <div className="mt-8"><LoginForm /></div>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-muted">iPhone&apos;da Safari paylaş menüsünden “Ana Ekrana Ekle” seçeneğini kullanabilirsiniz.</p>
        </div>
      </section>
    </main>
  );
}
