"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleCheckBig, Clock3, LayoutDashboard, Plus, Search } from "lucide-react";

const items = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/fatura-yeni", label: "Yeni", icon: Plus },
  { href: "/bekleyen", label: "Bekleyen", icon: Clock3 },
  { href: "/kesilen", label: "Kesilen", icon: CircleCheckBig },
  { href: "/ara", label: "Ara", icon: Search },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/panel") return pathname === href;
  return pathname.startsWith(href);
}

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-10 space-y-1.5" aria-label="Ana menü">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isCurrent(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
              active
                ? "bg-ink text-canvas shadow-sm dark:bg-gold-400 dark:text-zinc-950"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
            {label === "Yeni" ? "Yeni Fatura" : label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[1.6rem] border border-white/20 bg-zinc-950/90 p-1.5 shadow-float backdrop-blur-xl md:hidden dark:bg-zinc-100/90"
      aria-label="Mobil menü"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isCurrent(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-[10px] font-semibold transition ${
              active ? "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
