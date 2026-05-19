"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Proposal = {
  token: string;
  title: string;
  plan: string;
  frequency: string;
  duration_weeks: number;
  price: number;
  observations: string;
  payment_conditions: string;
  status: string;
  lead_name: string;
};

export function PublicProposalPage({ proposal }: { proposal: Proposal | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!proposal) return;
    setLoading(true);
    const response = await fetch("/api/public/proposal/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: proposal.token })
    });
    setLoading(false);

    if (response.ok) {
      setMessage("Proposta aceita. Seu treinador receberá a atualização.");
      router.refresh();
      return;
    }

    setMessage("Não foi possível aceitar a proposta. Tente novamente.");
  };

  if (!proposal) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 dark:bg-slate-950 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl dark:border-slate-800 dark:bg-slate-950/90">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Proposta não encontrada</h1>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">O link pode ser inválido ou expirado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 dark:bg-slate-950 sm:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <Card className="space-y-5 p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Proposta para {proposal.lead_name}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{proposal.title}</h1>
            </div>
            <Badge variant={proposal.status === "accepted" ? "success" : proposal.status === "rejected" ? "warning" : "accent"}>{proposal.status === "accepted" ? "Aceita" : proposal.status === "rejected" ? "Rejeitada" : "Pendente"}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-slate-50 p-5 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Plano</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{proposal.plan}</p>
            </Card>
            <Card className="bg-slate-50 p-5 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Investimento</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">R$ {proposal.price.toLocaleString("pt-BR")}</p>
            </Card>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">O que está incluso</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{proposal.observations}</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Condições de pagamento</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{proposal.payment_conditions}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" onClick={handleAccept} disabled={loading || proposal.status === "accepted"}>
              {loading ? "Aceitando..." : proposal.status === "accepted" ? "Já aceita" : "Aceitar proposta"}
            </Button>
            {message ? <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p> : null}
          </div>
        </Card>
      </div>
    </main>
  );
}
