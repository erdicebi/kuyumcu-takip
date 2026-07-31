import type { Metadata } from "next";
import { Search } from "lucide-react";
import { InvoiceList } from "@/components/invoice-list";
import { PageHeader } from "@/components/page-header";
import { listInvoices } from "@/services/invoice-service";

export const metadata: Metadata = { title: "Fatura Ara" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const invoices = await listInvoices({ query: query || undefined, limit: query ? 100 : 20 });

  return (
    <>
      <PageHeader eyebrow="Hızlı erişim" title="Fatura Ara" description="Fatura numarası, TC Kimlik No veya müşteri adıyla arayın." />
      <form action="/ara" method="get" className="card mb-6 flex gap-2 p-2" role="search">
        <label htmlFor="invoice-search" className="sr-only">Fatura ara</label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input id="invoice-search" name="q" defaultValue={query} className="h-12 w-full rounded-2xl bg-transparent pl-11 pr-3 text-[15px] outline-none placeholder:text-muted/60" placeholder="Fatura no, TC veya müşteri…" autoFocus />
        </div>
        <button type="submit" className="primary-button px-5">Ara</button>
      </form>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">{query ? `“${query}” sonuçları` : "Son 20 fatura"}</h2>
        <span className="text-xs font-semibold text-muted">{invoices.length} kayıt</span>
      </div>
      <InvoiceList invoices={invoices} emptyTitle="Sonuç bulunamadı" emptyDescription="Arama ifadenizi kontrol edip tekrar deneyin." showEmptyAction={!query} />
    </>
  );
}
