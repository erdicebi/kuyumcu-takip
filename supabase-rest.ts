"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clearSession, createInvoice, deleteInvoice, getStoredUser, listInvoices, signIn, updateInvoiceStatus } from "@/lib/supabase-rest";
import { dateTime, money, number } from "@/lib/format";
import type { Invoice, InvoiceStatus } from "@/lib/types";

type Tab = "yeni" | "bekleyen" | "kesilen" | "ara";

export function AppShell() {
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("yeni");
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({ tc: "", customer: "", gram: "", price: "" });

  useEffect(() => {
    const savedDark = localStorage.getItem("theme") === "dark";
    setDark(savedDark);
    document.documentElement.classList.toggle("dark", savedDark);
    setUserEmail(getStoredUser());
    setReady(true);
  }, []);

  const refresh = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    setMessage("");
    try { setItems((await listInvoices()) as Invoice[]); }
    catch (error) {
      const text = error instanceof Error ? error.message : "Kayıtlar alınamadı.";
      setMessage(text);
      if (text.includes("Oturum") || text.includes("401")) setUserEmail(null);
    } finally { setLoading(false); }
  }, [userEmail]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setAuthError("");
    try { await signIn(email.trim(), password); setUserEmail(email.trim()); }
    catch (error) { setAuthError(error instanceof Error ? error.message : "Giriş başarısız."); }
    finally { setLoading(false); }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    const tc = form.tc.trim();
    if (tc && !/^\d{11}$/.test(tc)) { setMessage("TC boş bırakılmalı veya 11 rakam olmalıdır."); return; }
    const gram = Number(form.gram.replace(",", "."));
    const price = Number(form.price.replace(",", "."));
    if (!(gram > 0) || !(price > 0)) { setMessage("Gram ve gram fiyatı sıfırdan büyük olmalıdır."); return; }
    setLoading(true);
    try {
      await createInvoice({ p_tc: tc || null, p_customer_name: form.customer.trim() || null, p_gram: gram, p_gram_price: price });
      setForm({ tc: "", customer: "", gram: "", price: form.price });
      await refresh(); setTab("bekleyen"); setMessage("Kayıt başarıyla eklendi.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kayıt eklenemedi."); }
    finally { setLoading(false); }
  }

  async function changeStatus(id: string, status: InvoiceStatus) {
    try { await updateInvoiceStatus(id, status); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Durum değiştirilemedi."); }
  }

  async function remove(id: string) {
    if (!window.confirm("Bu kayıt kalıcı olarak silinsin mi?")) return;
    try { await deleteInvoice(id); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Kayıt silinemedi."); }
  }

  function logout() { clearSession(); setUserEmail(null); setItems([]); }
  function toggleTheme() { const next = !dark; setDark(next); localStorage.setItem("theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next); }

  const visible = useMemo(() => items.filter((invoice) => {
    if (tab === "bekleyen") return invoice.status === "Bekliyor";
    if (tab === "kesilen") return invoice.status === "Kesildi";
    if (tab === "ara") {
      const q = query.trim().toLocaleLowerCase("tr");
      if (!q) return true;
      return String(invoice.invoice_number).includes(q) || (invoice.tc ?? "").includes(q) || (invoice.customer_name ?? "").toLocaleLowerCase("tr").includes(q);
    }
    return false;
  }), [items, query, tab]);

  const waiting = items.filter((invoice) => invoice.status === "Bekliyor");
  const totalPreview = (Number(form.gram.replace(",", ".")) || 0) * (Number(form.price.replace(",", ".")) || 0);

  if (!ready) return <main className="grid min-h-screen place-items-center"><p>Yükleniyor…</p></main>;
  if (!userEmail) return <LoginForm email={email} password={password} loading={loading} error={authError} setEmail={setEmail} setPassword={setPassword} submit={handleSignIn} />;

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 pb-28 sm:p-7">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-600">Sümer Kuyumculuk</p><h1 className="text-2xl font-bold">Kuyumcu Takip</h1></div>
        <div className="flex gap-2"><button className="btn-secondary" onClick={toggleTheme} aria-label="Tema">{dark ? "☀️" : "🌙"}</button><button className="btn-secondary" onClick={logout}>Çıkış</button></div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Bekleyen" value={waiting.length} /><Stat label="Bekleyen gram" value={number(waiting.reduce((sum, item) => sum + Number(item.gram), 0))} />
        <Stat label="Bekleyen tutar" value={money(waiting.reduce((sum, item) => sum + Number(item.total), 0))} /><Stat label="Toplam kayıt" value={items.length} />
      </section>

      {message && <p className="mb-5 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">{message}</p>}

      {tab === "yeni" ? (
        <form className="card p-5 sm:p-7" onSubmit={save}>
          <div className="mb-6"><h2 className="text-2xl font-bold">Yeni Fatura</h2><p className="text-sm opacity-60">Ürün: 24 Ayar · Son gram fiyatı yeni kayıtta korunur.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="TC Kimlik No (isteğe bağlı)"><input className="field" inputMode="numeric" maxLength={11} placeholder="11 rakam" value={form.tc} onChange={(e) => setForm({ ...form, tc: e.target.value.replace(/\D/g, "").slice(0, 11) })} /></Field>
            <Field label="Müşteri adı (isteğe bağlı)"><input className="field" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></Field>
            <Field label="Gram"><input className="field" inputMode="decimal" value={form.gram} onChange={(e) => setForm({ ...form, gram: e.target.value })} required /></Field>
            <Field label="Gram fiyatı"><input className="field" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></Field>
          </div>
          <div className="mt-5 rounded-2xl bg-amber-500/10 p-5"><p className="text-xs font-bold uppercase tracking-wider opacity-60">Toplam</p><p className="mt-1 text-3xl font-bold">{money(totalPreview)}</p></div>
          <button className="btn-primary mt-5 w-full" disabled={loading}>{loading ? "Kaydediliyor…" : "+ Kaydet"}</button>
        </form>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">{tab === "bekleyen" ? "Bekleyenler" : tab === "kesilen" ? "Kesilenler" : "Arama"}</h2><button className="btn-secondary" onClick={() => void refresh()}>{loading ? "Yükleniyor…" : "Yenile"}</button></div>
          {tab === "ara" && <input className="field mb-5" placeholder="Dosya no, TC veya müşteri ara" value={query} onChange={(e) => setQuery(e.target.value)} />}
          <div className="space-y-3">{visible.length === 0 ? <div className="card p-8 text-center text-sm opacity-60">Kayıt bulunamadı.</div> : visible.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} status={changeStatus} remove={remove} />)}</div>
        </section>
      )}

      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-24px)] max-w-xl -translate-x-1/2 justify-around rounded-[24px] border border-black/10 bg-white/90 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#161618]/90">
        {([['yeni','＋','Yeni'],['bekleyen','◷','Bekleyen'],['kesilen','✓','Kesilen'],['ara','⌕','Ara']] as const).map(([key, icon, label]) => <button key={key} onClick={() => setTab(key)} className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold ${tab === key ? "bg-black text-white dark:bg-white dark:text-black" : "opacity-55"}`}><span className="text-lg">{icon}</span>{label}</button>)}
      </nav>
    </main>
  );
}

function LoginForm({ email, password, loading, error, setEmail, setPassword, submit }: { email: string; password: string; loading: boolean; error: string; setEmail: (x: string) => void; setPassword: (x: string) => void; submit: (e: React.FormEvent) => void }) {
  return <main className="grid min-h-screen place-items-center p-5"><form onSubmit={submit} className="card w-full max-w-md p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-600">Sümer Kuyumculuk</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Kuyumcu Takip</h1><p className="mt-2 text-sm opacity-60">Fatura ön hazırlık ve durum takibi</p><div className="mt-7 space-y-4"><input className="field" type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required /><input className="field" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>{error && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}<button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</button></form></main>;
}
function InvoiceCard({ invoice, status, remove }: { invoice: Invoice; status: (id: string, status: InvoiceStatus) => Promise<void>; remove: (id: string) => Promise<void> }) {
  return <article className="card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-sm font-bold">#{invoice.invoice_number}</p><h3 className="mt-1 text-lg font-bold">{invoice.customer_name || "İsimsiz müşteri"}</h3><p className="mt-1 text-xs opacity-55">{dateTime(invoice.created_at)} · {invoice.tc || "TC yok"}</p></div><span className={`badge ${invoice.status === "Bekliyor" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}>{invoice.status}</span></div><div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-black/[.025] p-4 text-sm dark:bg-white/[.04]"><div><p className="text-xs opacity-50">Gram</p><b>{number(Number(invoice.gram))}</b></div><div><p className="text-xs opacity-50">Gram fiyatı</p><b>{money(Number(invoice.gram_price))}</b></div><div><p className="text-xs opacity-50">Toplam</p><b>{money(Number(invoice.total))}</b></div></div><div className="mt-4 flex gap-2"><button className="btn-secondary flex-1" onClick={() => void status(invoice.id, invoice.status === "Bekliyor" ? "Kesildi" : "Bekliyor")}>{invoice.status === "Bekliyor" ? "✓ Kesildi yap" : "◷ Bekliyor yap"}</button><button className="btn-secondary text-red-600" onClick={() => void remove(invoice.id)}>Sil</button></div></article>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="card p-4"><p className="text-xs opacity-55">{label}</p><p className="mt-1 truncate text-lg font-bold">{value}</p></div>; }
