"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseClient, useSessionContext } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Painel", href: "/dashboard" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Propostas", href: "/proposals" },
  { label: "Contratos", href: "/contracts" },
  { label: "Follow-ups", href: "/followups" },
  { label: "Modelos", href: "/templates" },
  { label: "Configurações", href: "/settings" }
] as const;

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "block rounded-3xl px-4 py-2 text-sm font-medium transition",
            pathname === item.href
              ? "bg-brand-500 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    router.push("/login");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md xl:hidden sm:px-10 dark:border-slate-700/80 dark:bg-slate-900/95">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          FitCloser
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50"
              >
                FitCloser
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">CRM para treinadores pessoais.</p>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-8">
              <Button
                variant="secondary"
                onClick={handleLogout}
                disabled={isLoading || isSigningOut}
                className="w-full"
              >
                Sair
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-72 shrink-0 flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm xl:flex dark:border-slate-700/60 dark:bg-slate-900/90">
        <div className="mb-5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard" className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              FitCloser
            </Link>
            <ThemeToggle />
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">CRM para treinadores pessoais.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </div>
        <div className="mt-4 shrink-0 border-t border-slate-200/80 pt-4 dark:border-slate-700/60">
          <Button variant="secondary" onClick={handleLogout} disabled={isLoading || isSigningOut} className="w-full">
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
