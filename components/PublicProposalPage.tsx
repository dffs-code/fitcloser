"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

    const promise = fetch("/api/public/proposal/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: proposal.token })
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Não foi possível aceitar a proposta.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Confirmando aceitação...",
      success: "Proposta aceita! Seu treinador foi notificado.",
      error: (err) => err.message
    });

    try {
      await promise;
      router.refresh();
    } catch {
      // error shown by toast
    } finally {
      setLoading(false);
    }
  };

  if (!proposal) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-950">Proposta não encontrada</h1>
          <p className="mt-4 text-sm text-slate-600">O link pode ser inválido ou expirado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <Card className="space-y-5 p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Proposta para {proposal.lead_name}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{proposal.title}</h1>
            </div>
            <Badge variant={proposal.status === "accepted" ? "success" : proposal.status === "rejected" ? "warning" : "accent"}>{proposal.status === "accepted" ? "Aceita" : proposal.status === "rejected" ? "Rejeitada" : "Pendente"}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Plano</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{proposal.plan}</p>
            </Card>
            <Card className="bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Investimento</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">R$ {proposal.price.toLocaleString("pt-BR")}</p>
            </Card>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
            <h2 className="text-sm uppercase tracking-[0.22em] text-slate-500">O que está incluso</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{proposal.observations}</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
            <h2 className="text-sm uppercase tracking-[0.22em] text-slate-500">Condições de pagamento</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{proposal.payment_conditions}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button type="button" onClick={handleAccept} disabled={loading || proposal.status === "accepted"}>
              {loading ? "Confirmando..." : proposal.status === "accepted" ? "Já aceita" : "Aceitar proposta"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
