"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, CheckCircle2, LoaderCircle, ReceiptText, ShieldCheck } from "lucide-react";
import { createInvoiceAction } from "@/app/actions/invoice-actions";
import { formatCurrency, parseTurkishDecimal } from "@/lib/format";
import type { InvoiceFormState } from "@/types/invoice";

const initialInvoiceFormState: InvoiceFormState = {
  success: false,
  message: "",
};

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return <p id={id} className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{errors[0]}</p>;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="primary-button w-full sm:w-auto sm:min-w-44" disabled={pending}>
      {pending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <ReceiptText size={18} aria-hidden="true" />}
      {pending ? "Kaydediliyor…" : "Faturayı kaydet"}
    </button>
  );
}

export function NewInvoiceForm() {
  const [state, action] = useActionState(createInvoiceAction, initialInvoiceFormState);
  const [gram, setGram] = useState("");
  const [gramPrice, setGramPrice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const gramValue = parseTurkishDecimal(gram);
  const priceValue = parseTurkishDecimal(gramPrice);
  const total = Number.isFinite(gramValue) && Number.isFinite(priceValue) ? gramValue * priceValue : 0;

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setGram("");
      setGramPrice("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.success, state.invoice?.id]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form ref={formRef} action={action} className="card p-5 sm:p-7" noValidate>
        {state.success && state.invoice && (
          <div className="mb-7 rounded-3xl border border-emerald-500/20 bg-emerald-500/8 p-4" role="status">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={21} aria-hidden="true" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">Fatura kaydedildi</p>
                <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">No: {state.invoice.invoice_number}</p>
                <Link href={`/fatura/${state.invoice.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline underline-offset-4 dark:text-emerald-300">
                  Kaydı görüntüle <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {!state.success && state.message && (
          <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400" role="alert">{state.message}</p>
        )}

        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-500/10 text-gold-600"><ReceiptText size={21} aria-hidden="true" /></span>
          <div>
            <h2 className="font-bold tracking-tight">Fatura bilgileri</h2>
            <p className="text-xs text-muted">Fatura numarası kayıt sırasında otomatik atanır.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tc" className="field-label">TC Kimlik No</label>
            <input id="tc" name="tc" inputMode="numeric" autoComplete="off" maxLength={11} className="field-input font-mono tracking-[0.08em]" placeholder="11 haneli TC" aria-describedby="tc-error" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 11); }} required />
            <FieldError id="tc-error" errors={state.errors?.tc} />
          </div>

          <div>
            <label htmlFor="customerName" className="field-label">Müşteri Adı <span className="font-normal text-muted">(isteğe bağlı)</span></label>
            <input id="customerName" name="customerName" type="text" autoComplete="name" maxLength={120} className="field-input" placeholder="Ad Soyad" aria-describedby="customer-error" />
            <FieldError id="customer-error" errors={state.errors?.customerName} />
          </div>

          <div>
            <label htmlFor="product-display" className="field-label">Ürün</label>
            <input id="product-display" className="field-input" value="24 Ayar" readOnly aria-readonly="true" />
            <input type="hidden" name="product" value="24 Ayar" />
            <FieldError id="product-error" errors={state.errors?.product} />
          </div>

          <div>
            <label htmlFor="status" className="field-label">Durum</label>
            <select id="status" name="status" defaultValue="bekliyor" className="field-input appearance-none" aria-describedby="status-error">
              <option value="bekliyor">Bekliyor</option>
              <option value="kesildi">Kesildi</option>
            </select>
            <FieldError id="status-error" errors={state.errors?.status} />
          </div>

          <div>
            <label htmlFor="gram" className="field-label">Gram</label>
            <div className="relative">
              <input id="gram" name="gram" inputMode="decimal" value={gram} onChange={(event) => setGram(event.target.value.replace(/[^\d.,]/g, ""))} className="field-input pr-14" placeholder="0,000" aria-describedby="gram-error" required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">gram</span>
            </div>
            <FieldError id="gram-error" errors={state.errors?.gram} />
          </div>

          <div>
            <label htmlFor="gramPrice" className="field-label">Gram Fiyatı</label>
            <div className="relative">
              <input id="gramPrice" name="gramPrice" inputMode="decimal" value={gramPrice} onChange={(event) => setGramPrice(event.target.value.replace(/[^\d.,]/g, ""))} className="field-input pr-12" placeholder="0,00" aria-describedby="price-error" required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">₺</span>
            </div>
            <FieldError id="price-error" errors={state.errors?.gramPrice} />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Hesaplanan toplam</p>
            <output className="mt-0.5 block text-2xl font-bold tracking-[-0.04em]" aria-live="polite">{formatCurrency(total)}</output>
          </div>
          <SaveButton />
        </div>
      </form>

      <aside className="space-y-5">
        <div className="card overflow-hidden bg-gradient-to-br from-zinc-950 to-zinc-800 p-6 text-white dark:from-gold-300 dark:to-gold-600 dark:text-zinc-950">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300 dark:text-zinc-700">Otomatik hesap</p>
          <p className="mt-3 text-3xl font-bold tracking-[-0.04em]">{formatCurrency(total)}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400 dark:text-zinc-800">Gram × gram fiyatı. Nihai tutar veritabanında tekrar hesaplanır.</p>
        </div>
        <div className="card p-5">
          <div className="flex gap-3">
            <ShieldCheck className="shrink-0 text-gold-600" size={20} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">Çakışmasız numaralandırma</p>
              <p className="mt-1 text-xs leading-5 text-muted">Aynı anda birden fazla kayıt yapılsa bile her kayda tek ve sıralı bir numara verilir.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
