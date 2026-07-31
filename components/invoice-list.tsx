import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency, formatDateTime, formatGram, maskTc } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import type { Invoice } from "@/types/invoice";

export function InvoiceList({
  invoices,
  emptyTitle = "Henüz fatura yok",
  emptyDescription = "İlk faturanızı kaydettiğinizde burada görünecek.",
  showEmptyAction = true,
}: {
  invoices: Invoice[];
  emptyTitle?: string;
  emptyDescription?: string;
  showEmptyAction?: boolean;
}) {
  if (invoices.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} showAction={showEmptyAction} />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {invoices.map((invoice) => {
          const { date, time } = formatDateTime(invoice.created_at);
          return (
            <Link key={invoice.id} href={`/fatura/${invoice.id}`} className="card block p-4 transition active:scale-[.99]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted">Fatura No</p>
                  <p className="mt-0.5 font-mono text-sm font-bold tracking-tight">{invoice.invoice_number}</p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="my-4 h-px bg-line" />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-semibold">{invoice.customer_name || "İsimsiz müşteri"}</p>
                  <p className="mt-1 text-xs text-muted">{maskTc(invoice.tc)} · {formatGram(invoice.gram)}</p>
                  <p className="mt-1 text-xs text-muted">{date}, {time}</p>
                </div>
                <p className="text-right text-lg font-bold tracking-tight">{formatCurrency(invoice.total)}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-line bg-canvas/60 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-4">Fatura No</th>
                <th className="px-5 py-4">Müşteri</th>
                <th className="px-5 py-4">Tarih</th>
                <th className="px-5 py-4">Gram</th>
                <th className="px-5 py-4">Tutar</th>
                <th className="px-5 py-4">Durum</th>
                <th className="w-10 px-5 py-4"><span className="sr-only">Detay</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((invoice) => {
                const { date, time } = formatDateTime(invoice.created_at);
                return (
                  <tr key={invoice.id} className="group transition hover:bg-canvas/55">
                    <td className="px-5 py-4 font-mono text-sm font-bold">{invoice.invoice_number}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">{invoice.customer_name || "İsimsiz müşteri"}</p>
                      <p className="mt-0.5 text-xs text-muted">{maskTc(invoice.tc)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <p>{date}</p><p className="mt-0.5 text-xs text-muted">{time}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">{formatGram(invoice.gram)}</td>
                    <td className="px-5 py-4 text-sm font-bold">{formatCurrency(invoice.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
                    <td className="px-5 py-4">
                      <Link href={`/fatura/${invoice.id}`} className="grid h-9 w-9 place-items-center rounded-xl text-muted transition group-hover:bg-surface group-hover:text-ink" aria-label={`${invoice.invoice_number} numaralı faturayı aç`}>
                        <ChevronRight size={18} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
