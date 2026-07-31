import type { Metadata } from "next";
import { InvoiceList } from "@/components/invoice-list";
import { PageHeader } from "@/components/page-header";
import { listInvoices } from "@/services/invoice-service";

export const metadata: Metadata = { title: "Bekleyen Faturalar" };

export default async function WaitingInvoicesPage() {
  const invoices = await listInvoices({ status: "bekliyor", limit: 100 });
  return (
    <>
      <PageHeader eyebrow="Takip listesi" title="Bekleyen Faturalar" description={`${invoices.length} fatura kesilmeyi bekliyor.`} />
      <InvoiceList invoices={invoices} emptyTitle="Bekleyen fatura yok" emptyDescription="Tüm faturalarınız kesilmiş durumda. Yeni kayıtlar burada görünecek." />
    </>
  );
}
