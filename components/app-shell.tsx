import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Brand } from "@/components/brand";
import { DesktopNavigation, MobileNavigation } from "@/components/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-line bg-surface/90 p-6 backdrop-blur-xl md:flex md:flex-col">
        <Brand />
        <DesktopNavigation />
        <div className="mt-auto rounded-3xl bg-canvas p-4">
          <p className="truncate text-xs font-medium text-muted" title={userEmail}>{userEmail}</p>
          <form action={logoutAction} className="mt-3">
            <button type="submit" className="flex items-center gap-2 text-xs font-semibold text-ink hover:text-gold-600">
              <LogOut size={15} aria-hidden="true" /> Güvenli çıkış
            </button>
          </form>
        </div>
      </aside>

      <div className="md:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line/70 bg-canvas/85 px-4 backdrop-blur-xl md:px-8">
          <div className="md:hidden"><Brand compact /></div>
          <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted md:block">Güvenli fatura yönetimi</p>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-7 sm:px-6 md:px-8 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
