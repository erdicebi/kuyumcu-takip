export type InvoiceStatus = "bekliyor" | "kesildi";

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: number;
  tc: string;
  customer_name: string | null;
  product: "24 Ayar";
  gram: number;
  gram_price: number;
  total: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  waiting_count: number;
  completed_count: number;
  total_count: number;
  waiting_total: number;
  completed_total: number;
  today_count: number;
}

export interface InvoiceFormState {
  success: boolean;
  message: string;
  invoice?: Invoice;
  errors?: Record<string, string[]>;
}
