import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export function EmptyState({ title, description, showAction = true }: { title: string; description: string; showAction?: boolean }) {
  return (
    <div className="card px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold-500/10 text-gold-600">
        <FileText aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {showAction && (
        <Link href="/fatura-yeni" className="secondary-button mt-6">
          <Plus size={17} aria-hidden="true" /> Yeni fatura
        </Link>
      )}
    </div>
  );
}
