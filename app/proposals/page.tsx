import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";

export default async function ProposalsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id,title,status,price,lead_id,created_at")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Propostas</p>
              <h1 className="text-3xl font-semibold text-slate-950">Propostas profissionais</h1>
            </div>
            <Link href="/proposals/new">
              <Button>Nova proposta</Button>
            </Link>
          </div>
          <div className="grid gap-4">
          {(proposals ?? []).map((proposal: any) => (
            <Card key={proposal.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Proposta</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">{proposal.title}</h2>
                <p className="mt-2 text-sm text-slate-600">ID do lead: {proposal.lead_id}</p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <Badge variant={proposal.status === "accepted" ? "success" : proposal.status === "rejected" ? "warning" : "accent"}>{proposal.status === "accepted" ? "Aceita" : proposal.status === "rejected" ? "Rejeitada" : "Pendente"}</Badge>
                <p className="text-xl font-semibold text-slate-950">R$ {proposal.price.toLocaleString("pt-BR")}</p>
                <Link href={`/proposals/${proposal.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-500">
                  Ver proposta
                </Link>
              </div>
            </Card>
          ))}
          {(proposals ?? []).length === 0 ? (
            <Card className="p-8 text-center text-slate-600">
              Ainda não há propostas. Crie uma nova proposta para enviar uma oferta profissional ao seu lead.
            </Card>
          ) : null}
      </div>
      </div>
    </AppShell>
  );
}
