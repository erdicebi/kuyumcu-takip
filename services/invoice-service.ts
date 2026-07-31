import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardStats, Invoice, InvoiceStatus } from "@/types/invoice";

interface ListInvoicesOptions {
  query?: string;
  status?: InvoiceStatus;
  limit?: number;
}

function normalizeInvoice(row: Record<string, unknown>): Invoice {
  return {
    ...(row as unknown as Invoice),
    invoice_number: Number(row.invoice_number),
    gram: Number(row.gram),
    gram_price: Number(row.gram_price),
    total: Number(row.total),
  };
}

export async function listInvoices({
  query,
  status,
  limit = 50,
}: ListInvoicesOptions = {}): Promise<Invoice[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("search_invoices", {
    p_query: query?.trim() || null,
    p_status: status ?? null,
    p_limit: limit,
  });

  if (error) throw new Error(`Faturalar alınamadı: ${error.message}`);
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeInvoice);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Fatura alınamadı: ${error.message}`);
  return data ? normalizeInvoice(data as Record<string, unknown>) : null;
}

export async function createInvoice(input: {
  tc: string;
  customerName: string;
  product: "24 Ayar";
  gram: number;
  gramPrice: number;
  status: InvoiceStatus;
}): Promise<Invoice> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_invoice", {
    p_tc: input.tc,
    p_customer_name: input.customerName || null,
    p_product: input.product,
    p_gram: input.gram,
    p_gram_price: input.gramPrice,
    p_status: input.status,
  });

  if (error) throw new Error(`Fatura kaydedilemedi: ${error.message}`);
  return normalizeInvoice(data as Record<string, unknown>);
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("set_invoice_status", {
    p_invoice_id: id,
    p_status: status,
  });

  if (error) throw new Error(`Durum güncellenemedi: ${error.message}`);
  return normalizeInvoice(data as Record<string, unknown>);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) throw new Error(`Özet alınamadı: ${error.message}`);
  const stats = (data ?? {}) as Record<string, unknown>;
  return {
    waiting_count: Number(stats.waiting_count ?? 0),
    completed_count: Number(stats.completed_count ?? 0),
    total_count: Number(stats.total_count ?? 0),
    waiting_total: Number(stats.waiting_total ?? 0),
    completed_total: Number(stats.completed_total ?? 0),
    today_count: Number(stats.today_count ?? 0),
  };
}
