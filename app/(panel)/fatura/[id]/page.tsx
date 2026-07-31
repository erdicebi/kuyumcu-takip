import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Hash, IdCard, Package, Scale, UserRound } from "lucide-react";
import { updateStatusAction } from "@/app/actions/invoice-actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime, formatGram } from "@/lib/format";
import { getInvoice } from "@/services/invoice-service";

export const metadata: Metadata = { title: "Fatura Detayı" };

function DetailItem({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas/70 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted"><Icon size={15} aria-hidden="true" /> {label}</div>
      <p className="mt-2 break-words text-sm font-bold">{value}</p>
    </div>
  );
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();
  const { date, time } = formatDateTime(invoice.created_at);
  const nextStatus = invoice.status === "bekliyor" ? "kesildi" : "bekliyor";

  return (
    <>
      <PageHeader
        eyebrow="Fatura detayı"
        title={`#${invoice.invoice_number}`}
        description={`${date}, ${time}`}
        action={<Link href={invoice.status === "bekliyor" ? "/bekleyen" : "/kesilen"} className="secondary-button"><ArrowLeft size={17} aria-hidden="true" /> Listeye dön</Link>}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-5">
            <div><p className="text-xs font-semibold text-muted">Güncel durum</p><div className="mt-2"><StatusBadge status={invoice.status} /></div></div>
            <p className="text-right text-2xl font-bold tracking-[-0.04em]">{formatCurrency(invoice.total)}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailItem icon={Hash} label="Fatura numarası" value={String(invoice.invoice_number)} />
            <DetailItem icon={CalendarDays} label="Tarih ve saat" value={`${date}, ${time}`} />
            <DetailItem icon={IdCard} label="TC Kimlik No" value={invoice.tc} />
            <DetailItem icon={UserRound} label="Müşteri" value={invoice.customer_name || "Belirtilmedi"} />
            <DetailItem icon={Package} label="Ürün" value={invoice.product} />
            <DetailItem icon={Scale} label="Gram" value={formatGram(invoice.gram)} />
            <DetailItem icon={Scale} label="Gram fiyatı" value={formatCurrency(invoice.gram_price)} />
            <DetailItem icon={CheckCircle2} label="Toplam" value={formatCurrency(invoice.total)} />
          </div>
        </section>

        <aside className="card h-fit p-5">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl ${invoice.status === "bekliyor" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
            {invoice.status === "bekliyor" ? <CheckCircle2 size={21} aria-hidden="true" /> : <Clock3 size={21} aria-hidden="true" />}
          </span>
          <h2 className="mt-4 font-bold">Durumu güncelle</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Bu faturayı {nextStatus === "kesildi" ? "kesildi" : "bekliyor"} olarak işaretleyin.</p>
          <form action={updateStatusAction} className="mt-5">
            <input type="hidden" name="id" value={invoice.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button type="submit" className="primary-button w-full">{nextStatus === "kesildi" ? "Kesildi olarak işaretle" : "Bekliyor durumuna al"}</button>
          </form>
        </aside>
      </div>
    </>
  );
}
