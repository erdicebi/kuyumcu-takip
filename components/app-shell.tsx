"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FilePlus2,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

const emptyForm = { tc: "", customer_name: "", gram: "", gram_price: "" };

type Tab = "yeni" | "bekleyen" | "kesilen" | "tum";

export function AppShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>("yeni");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void loadInvoices();
    else setInvoices([]);
  }, [session]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    try {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await getSupabaseClient().auth.signOut();
  }

  async function loadInvoices() {
    setLoading(true);
    setError("");
    try {
      const { data, error: listError } = await getSupabaseClient()
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (listError) throw listError;
      setInvoices((data ?? []) as Invoice[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıtlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  const total = useMemo(() => {
    const gram = Number(form.gram.replace(",", ".")) || 0;
    const price = Number(form.gram_price.replace(",", ".")) || 0;
    return gram * price;
  }, [form.gram, form.gram_price]);

  async function createInvoice(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    setError("");

    const tc = form.tc.trim();
    if (tc && !/^\d{11}$/.test(tc)) {
      setError("TC Kimlik No boş bırakılmalı veya yalnızca 11 rakam olmalıdır.");
      return;
    }

    const gram = Number(form.gram.replace(",", "."));
    const gramPrice = Number(form.gram_price.replace(",", "."));
    if (!Number.isFinite(gram) || gram <= 0 || !Number.isFinite(gramPrice) || gramPrice <= 0) {
      setError("Gram ve gram fiyatı sıfırdan büyük olmalıdır.");
      return;
    }

    setBusy(true);
    try {
      const { error: createError } = await getSupabaseClient().rpc("create_invoice", {
        p_tc: tc || null,
        p_customer_name: form.customer_name.trim() || null,
        p_gram: gram,
        p_gram_price: gramPrice,
      });
      if (createError) throw createError;
      setForm(emptyForm);
      setNotice("Kayıt bekleyen faturalar listesine eklendi.");
      await loadInvoices();
      setTab("bekleyen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: InvoiceStatus) {
    setError("");
    const { error: updateError } = await getSupabaseClient().from("invoices").update({ status }).eq("id", id);
    if (updateError) setError(updateError.message);
    else await loadInvoices();
  }

  async function removeInvoice(id: string) {
    if (!window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    const { error: deleteError } = await getSupabaseClient().from("invoices").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else await loadInvoices();
  }

  const filtered = useMemo(() => {
    const status = tab === "bekleyen" ? "Bekliyor" : tab === "kesilen" ? "Kesildi" : null;
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return invoices.filter((item) => {
      if (status && item.status !== status) return false;
      if (!normalized) return true;
      return [String(item.invoice_number), item.tc ?? "", item.customer_name ?? ""]
        .some((value) => value.toLocaleLowerCase("tr-TR").includes(normalized));
    });
  }, [invoices, query, tab]);

  const waiting = invoices.filter((item) => item.status === "Bekliyor");
  const completed = invoices.filter((item) => item.status === "Kesildi");

  if (!authReady) {
    return <main className="grid min-h-screen place-items-center p-6"><RefreshCw className="animate-spin" /></main>;
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <section className="card w-full max-w-md p-7 sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[var(--gold)]">Sümer Kuyumculuk</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Kuyumcu Takip</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Fatura ön hazırlık ve bekleyen kayıt takibi</p>
          </div>
          <form onSubmit={signIn} className="space-y-4">
            <div><label className="mb-2 block text-sm font-bold">E-posta</label><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><label className="mb-2 block text-sm font-bold">Şifre</label><input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {authError && <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-[var(--danger)]">{authError}</p>}
            <button className="primary w-full" disabled={busy}><LogIn size={18} /> {busy ? "Giriş yapılıyor..." : "Giriş yap"}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[var(--gold)]">Sümer Kuyumculuk</p><h1 className="text-2xl font-black tracking-[-.04em]">Kuyumcu Takip</h1></div>
        <button className="secondary" onClick={signOut}><LogOut size={17} /> Çıkış</button>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Bekleyen" value={waiting.length} detail={formatMoney(waiting.reduce((sum, item) => sum + Number(item.total), 0))} />
        <Metric label="Kesilen" value={completed.length} detail={formatMoney(completed.reduce((sum, item) => sum + Number(item.total), 0))} />
        <Metric label="Toplam kayıt" value={invoices.length} detail={`${formatNumber(invoices.reduce((sum, item) => sum + Number(item.gram), 0))} gr`} />
      </section>

      <nav className="card mb-6 grid grid-cols-4 gap-2 p-2">
        <TabButton active={tab === "yeni"} onClick={() => setTab("yeni")} label="Yeni" />
        <TabButton active={tab === "bekleyen"} onClick={() => setTab("bekleyen")} label="Bekleyen" />
        <TabButton active={tab === "kesilen"} onClick={() => setTab("kesilen")} label="Kesilen" />
        <TabButton active={tab === "tum"} onClick={() => setTab("tum")} label="Tümü" />
      </nav>

      {error && <div className="mb-5 rounded-2xl bg-red-500/10 p-4 text-sm font-semibold text-[var(--danger)]">{error}</div>}
      {notice && <div className="mb-5 rounded-2xl bg-green-500/10 p-4 text-sm font-semibold text-[var(--success)]">{notice}</div>}

      {tab === "yeni" ? (
        <section className="card mx-auto max-w-2xl p-5 sm:p-7">
          <div className="mb-6"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--gold)]">24 Ayar</p><h2 className="mt-1 text-2xl font-black">Yeni kayıt</h2><p className="mt-2 text-sm text-[var(--muted)]">TC ve müşteri adı isteğe bağlıdır. TC girilirse 11 rakam olmalıdır.</p></div>
          <form onSubmit={createInvoice} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="mb-2 block text-sm font-bold">TC Kimlik No <span className="font-normal text-[var(--muted)]">(isteğe bağlı)</span></label><input className="field font-mono" inputMode="numeric" maxLength={11} placeholder="11 rakam" value={form.tc} onChange={(e) => setForm({ ...form, tc: e.target.value.replace(/\D/g, "").slice(0, 11) })} /></div>
            <div className="sm:col-span-2"><label className="mb-2 block text-sm font-bold">Müşteri adı <span className="font-normal text-[var(--muted)]">(isteğe bağlı)</span></label><input className="field" maxLength={120} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
            <div><label className="mb-2 block text-sm font-bold">Gram</label><input className="field" inputMode="decimal" placeholder="0,000" value={form.gram} onChange={(e) => setForm({ ...form, gram: e.target.value })} required /></div>
            <div><label className="mb-2 block text-sm font-bold">Gram fiyatı</label><input className="field" inputMode="decimal" placeholder="0,00" value={form.gram_price} onChange={(e) => setForm({ ...form, gram_price: e.target.value })} required /></div>
            <div className="sm:col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">Toplam tutar</p><p className="mt-2 text-3xl font-black tracking-[-.04em]">{formatMoney(total)}</p></div>
            <button className="primary sm:col-span-2" disabled={busy}><FilePlus2 size={18} /> {busy ? "Kaydediliyor..." : "Kaydet"}</button>
          </form>
        </section>
      ) : (
        <section className="card p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-black">{tab === "bekleyen" ? "Bekleyen faturalar" : tab === "kesilen" ? "Kesilen faturalar" : "Tüm faturalar"}</h2><p className="mt-1 text-sm text-[var(--muted)]">Dosya no, TC veya müşteri adına göre arayın.</p></div>
            <div className="relative sm:w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={17} /><input className="field pl-11" placeholder="Ara..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          </div>
          <InvoiceTable invoices={filtered} loading={loading} onStatus={setStatus} onDelete={removeInvoice} />
        </section>
      )}
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <article className="card p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-[var(--gold)]">{detail}</p></article>;
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button onClick={onClick} className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${active ? "bg-[var(--panel-strong)] shadow-sm text-[var(--gold)]" : "text-[var(--muted)]"}`}>{label}</button>;
}

function InvoiceTable({ invoices, loading, onStatus, onDelete }: { invoices: Invoice[]; loading: boolean; onStatus: (id: string, status: InvoiceStatus) => void; onDelete: (id: string) => void }) {
  if (loading) return <div className="grid place-items-center py-16"><RefreshCw className="animate-spin" /></div>;
  if (!invoices.length) return <div className="py-16 text-center text-sm text-[var(--muted)]">Kayıt bulunamadı.</div>;
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Dosya no</th><th>Tarih</th><th>TC / Müşteri</th><th>Gram</th><th>Gram fiyatı</th><th>Toplam</th><th>Durum</th><th>İşlem</th></tr></thead>
        <tbody>{invoices.map((item) => <tr key={item.id}>
          <td className="font-mono font-bold">{item.invoice_number}</td>
          <td>{formatDateTime(item.created_at)}</td>
          <td><div className="font-semibold">{item.customer_name || "—"}</div><div className="mt-1 font-mono text-xs text-[var(--muted)]">{item.tc || "TC yok"}</div></td>
          <td>{formatNumber(Number(item.gram))} gr</td>
          <td>{formatMoney(Number(item.gram_price))}</td>
          <td className="font-bold">{formatMoney(Number(item.total))}</td>
          <td><span className={`badge ${item.status === "Bekliyor" ? "badge-wait" : "badge-done"}`}>{item.status === "Bekliyor" ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}{item.status}</span></td>
          <td><div className="flex gap-2"><button className="secondary" onClick={() => onStatus(item.id, item.status === "Bekliyor" ? "Kesildi" : "Bekliyor")}>{item.status === "Bekliyor" ? "Kesildi yap" : "Bekliyor yap"}</button><button className="secondary text-[var(--danger)]" aria-label="Sil" onClick={() => onDelete(item.id)}><Trash2 size={16} /></button></div></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
