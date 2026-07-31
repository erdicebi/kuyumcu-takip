import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/panel" className="inline-flex items-center gap-3" aria-label="Kuyumcu Takip ana sayfa">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 font-serif text-lg font-black text-white shadow-md shadow-gold-700/20">
        K
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-[-0.02em] text-ink">Kuyumcu</span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">Takip</span>
        </span>
      )}
    </Link>
  );
}
