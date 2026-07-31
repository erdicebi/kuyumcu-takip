import { Check, Clock3 } from "lucide-react";
import type { InvoiceStatus } from "@/types/invoice";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const completed = status === "kesildi";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      completed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    }`}>
      {completed ? <Check size={12} aria-hidden="true" /> : <Clock3 size={12} aria-hidden="true" />}
      {completed ? "Kesildi" : "Bekliyor"}
    </span>
  );
}
