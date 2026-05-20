"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseClient, useSessionContext } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Painel", href: "/dashboard" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Propostas", href: "/proposals" },
  { label: "Contratos", href: "/contracts" },
  { label: "Follow-ups", href: "/followups" },
  { label: "Modelos", href: "/templates" },
  { label: "Configurações", href: "/settings" }
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "block rounded-3xl px-4 py-3 text-sm font-medium transition",
            pathname === item.href
              ? "bg-brand-500 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
      {/* Mobile top bar — full-bleed sticky header */}
      <div className="sticky top-0 z-40 -mx-6 -mt-8 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md xl:hidden sm:-mx-10 sm:px-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-950">
          <img src="/fitcloser.svg" alt="" className="h-7 w-7 rounded-lg" aria-hidden="true" />
          FitCloser
        </Link>
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
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

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-6 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950"
              >
                <img src="/fitcloser.svg" alt="" className="h-8 w-8 rounded-xl" aria-hidden="true" />
                FitCloser
              </Link>
              <p className="text-sm text-slate-500">CRM para treinadores pessoais.</p>
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
      <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm xl:flex" style={{ height: "fit-content", position: "sticky", top: "2rem" }}>
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950">
            <img src="/fitcloser.svg" alt="" className="h-8 w-8 rounded-xl" aria-hidden="true" />
            FitCloser
          </Link>
          <p className="text-sm text-slate-500">CRM para treinadores pessoais.</p>
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-auto pt-4">
          <Button variant="secondary" onClick={handleLogout} disabled={isLoading || isSigningOut} className="w-full">
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
