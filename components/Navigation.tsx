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

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    router.push("/login");
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 border-r border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90 xl:flex">
      <div className="space-y-2">
        <Link href="/dashboard" className="block text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          FitCloser
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400">CRM para treinadores pessoais.</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-3xl px-4 py-3 text-sm font-medium transition",
              pathname === item.href
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <Button variant="secondary" onClick={handleLogout} disabled={isLoading || isSigningOut} className="w-full">
          Sair
        </Button>
      </div>
    </aside>
  );
}
