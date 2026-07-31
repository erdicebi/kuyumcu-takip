import type { Metadata } from "next";
import { InvoiceList } from "@/components/invoice-list";
import { PageHeader } from "@/components/page-header";
import { listInvoices } from "@/services/invoice-service";

export const metadata: Metadata = { title: "Kesilen Faturalar" };

export default async function CompletedInvoicesPage() {
  const invoices = await listInvoices({ status: "kesildi", limit: 100 });
  return (
    <>
      <PageHeader eyebrow="Tamamlanan işlemler" title="Kesilen Faturalar" description={`${invoices.length} tamamlanmış fatura görüntüleniyor.`} />
      <InvoiceList invoices={invoices} emptyTitle="Kesilen fatura yok" emptyDescription="Kesildi olarak işaretlediğiniz faturalar burada saklanacak." />
    </>
  );
}
