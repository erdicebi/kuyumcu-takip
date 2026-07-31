import type { Metadata } from "next";
import { NewInvoiceForm } from "@/components/new-invoice-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Yeni Fatura" };

export default function NewInvoicePage() {
  return (
    <>
      <PageHeader eyebrow="Hızlı kayıt" title="Yeni Fatura" description="24 ayar altın işlemini kaydedin. Toplam tutar otomatik hesaplanır." />
      <NewInvoiceForm />
    </>
  );
}
