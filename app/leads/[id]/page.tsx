import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { createServerClient } from "@/lib/supabase-client";

const statusLabelMap: Record<string, string> = {
  "New Lead": "Novo lead",
  Contacted: "Contatado",
  "Evaluation Scheduled": "Avaliação agendada",
  "Proposal Sent": "Proposta enviada",
  Negotiation: "Negociação",
  "Closed Won": "Ganho",
  "Closed Lost": "Perdido"
};
  const leadResponse = await supabase
    .from("leads")
    .select(
      "*, proposals(id,title,status,price), contracts(id,title,status), follow_ups(id, note,due_at,completed), activities(id,description,created_at)"
    )
    .eq("trainer_id", session.user.id)
    .eq("id", params.id)
    .single();
export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const supabase = createServerClient();
  const sessionResponse = await supabase.auth.getSession();
  const session = sessionResponse.data.session;

  if (!session) redirect("/login");

  const leadResponse = await supabase
    .from("leads")
    .select("*, proposals(id,title,status,price), contracts(id,title,status), follow_ups(id, note,due_at,completed), activities(id,description,created_at)")
    .eq("trainer_id", session.user.id)
    .eq("id", params.id)
    .single();

  if (leadResponse.error || !leadResponse.data) {
    redirect("/pipeline");
  }

  const lead = leadResponse.data;
  const nextFollowUp = lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleDateString("pt-BR") : "Nenhum";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Detalhes do lead</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{lead.name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span>{lead.phone}</span>
              <span>{lead.email}</span>
              <span>{lead.goal}</span>
            </div>
          </div>
          <Link href="/pipeline" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">
            Voltar ao pipeline
          </Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.8fr_0.5fr]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Etapa atual</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{statusLabelMap[lead.status] ?? lead.status}</p>
                </div>
                <Badge variant={lead.status === "Closed Won" ? "success" : "warning"}>{statusLabelMap[lead.status] ?? lead.status}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/80">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Criado</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/80">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Próximo follow-up</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{nextFollowUp}</p>
                </div>
              </div>
            </Card>
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Linha do tempo</h2>
                <Badge variant="default">{lead.activities?.length ?? 0} eventos</Badge>
              </div>
              <div className="space-y-4">
                {(lead.activities ?? []).map((activity: any) => (
                  <div key={activity.id} className="rounded-3xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/90">
                    <p className="text-sm text-slate-800 dark:text-slate-100">{activity.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{new Date(activity.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Propostas</h2>
              <div className="space-y-3">
                {(lead.proposals ?? []).map((proposal: any) => (
                  <div key={proposal.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="font-semibold text-slate-900 dark:text-white">{proposal.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">R$ {proposal.price.toLocaleString("pt-BR")} • {proposal.status === "accepted" ? "Aceita" : proposal.status === "rejected" ? "Rejeitada" : "Pendente"}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Contratos</h2>
              <div className="space-y-3">
                {(lead.contracts ?? []).map((contract: any) => (
                  <div key={contract.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="font-semibold text-slate-900 dark:text-white">{contract.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{contract.status === "signed" ? "Assinado" : contract.status === "expired" ? "Expirado" : contract.status}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
