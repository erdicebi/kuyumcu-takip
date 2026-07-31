"use server";

import { revalidatePath } from "next/cache";
import { createInvoice, setInvoiceStatus } from "@/services/invoice-service";
import type { InvoiceFormState, InvoiceStatus } from "@/types/invoice";
import { invoiceFormSchema, issuesToFieldErrors } from "@/lib/validation";

export async function createInvoiceAction(
  _previousState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const result = invoiceFormSchema.safeParse({
    tc: formData.get("tc"),
    customerName: formData.get("customerName"),
    product: formData.get("product"),
    gram: formData.get("gram"),
    gramPrice: formData.get("gramPrice"),
    status: formData.get("status"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Eksik veya hatalı alanları düzeltin.",
      errors: issuesToFieldErrors(result.error.issues),
    };
  }

  try {
    const invoice = await createInvoice(result.data);
    revalidatePath("/panel");
    revalidatePath("/bekleyen");
    revalidatePath("/kesilen");
    revalidatePath("/ara");
    return {
      success: true,
      message: "Fatura başarıyla kaydedildi.",
      invoice,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Fatura kaydedilemedi.",
    };
  }
}

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as InvoiceStatus;

  if (!id || !["bekliyor", "kesildi"].includes(status)) return;
  await setInvoiceStatus(id, status);
  revalidatePath("/panel");
  revalidatePath("/bekleyen");
  revalidatePath("/kesilen");
  revalidatePath(`/fatura/${id}`);
}
