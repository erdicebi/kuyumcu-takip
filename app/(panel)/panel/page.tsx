import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CheckCircle2, Clock3, FileText, Plus, Sparkles } from "lucide-react";
import { InvoiceList } from "@/components/invoice-list";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import { getDashboardStats, listInvoices } from "@/services/invoice-service";

export const metadata: Metadata = { title: "Genel Bakış" };

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: typeof FileText; tone: "gold" | "amber" | "green" | "blue" }) {
  const tones = {
    gold: "bg-gold-500/10 text-gold-700 dark:text-gold-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">{value}</p>
          <p className="mt-1 text-xs text-muted">{detail}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={19} aria-hidden="true" /></span>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  let stats;
  let recent;

  try {
    stats = await getDashboardStats();
  } catch (error) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold">İstatistik hatası</h1>
        <p className="mt-3 break-words text-sm text-red-600">
          {error instanceof Error ? error.message : "Bilinmeyen hata"}
        </p>
      </div>
    );
  }

  try {
    recent = await listInvoices({ limit: 5 });
  } catch (error) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold">Fatura listesi hatası</h1>
        <p className="mt-3 break-words text-sm text-red-600">
          {error instanceof Error ? error.message : "Bilinmeyen hata"}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Bugünün özeti"
        title="Genel Bakış"
        description="Fatura durumlarınız ve güncel işlem toplamlarınız."
        action={<Link href="/fatura-yeni" className="primary-button"><Plus size={18} aria-hidden="true" /> Yeni fatura</Link>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Fatura özeti">
        <MetricCard label="Bugünkü kayıt" value={stats.today_count} detail="Bugün oluşturuldu" icon={Sparkles} tone="gold" />
        <MetricCard label="Bekleyen" value={stats.waiting_count} detail={formatCurrency(stats.waiting_total)} icon={Clock3} tone="amber" />
        <MetricCard label="Kesilen" value={stats.completed_count} detail={formatCurrency(stats.completed_total)} icon={CheckCircle2} tone="green" />
        <MetricCard label="Toplam fatura" value={stats.total_count} detail="Tüm zamanlar" icon={Banknote} tone="blue" />
      </section>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-xl font-bold tracking-[-0.03em]">Son faturalar</h2><p className="mt-1 text-xs text-muted">En son kaydedilen 5 işlem</p></div>
          <Link href="/ara" className="text-xs font-bold text-gold-700 hover:underline dark:text-gold-300">Tümünü gör</Link>
        </div>
        <InvoiceList invoices={recent} />
      </section>
    </>
  );
}
