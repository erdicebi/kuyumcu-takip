import type { InvoiceStatus } from "@/types/invoice";

export const APP_NAME = "Kuyumcu Takip";
export const PRODUCT = "24 Ayar" as const;
export const FIRST_INVOICE_NUMBER = 2026000000082;

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  bekliyor: "Bekliyor",
  kesildi: "Kesildi",
};
