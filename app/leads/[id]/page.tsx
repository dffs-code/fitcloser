import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";
import { createServerClient } from "@/lib/supabase-client";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabelMap: Record<string, string> = {
  "New Lead": "Novo lead",
  Contacted: "Contatado",
  "Evaluation Scheduled": "Avaliação agendada",
  "Proposal Sent": "Proposta enviada",
  Negotiation: "Negociação",
  "Closed Won": "Ganho",
  "Closed Lost": "Perdido"
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const leadResponse = await supabase
    .from("leads")
    .select(
      "*, proposals(id,title,status,price), contracts(id,title,status), follow_ups(id,note,due_at,completed), activities(id,description,created_at)"
    )
    .eq("trainer_id", user.id)
    .eq("id", id)
    .single();

  if (leadResponse.error || !leadResponse.data) {
    redirect("/pipeline");
  }

  const lead = leadResponse.data;
  const nextFollowUp = lead.next_follow_up
    ? new Date(lead.next_follow_up).toLocaleDateString("pt-BR")
    : "Nenhum";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Detalhes do lead</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{lead.name}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <span>{lead.phone}</span>
                <span>{lead.email}</span>
                <span>{lead.goal}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/leads/${id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Editar lead
              </Link>
              <Link
                href="/pipeline"
                className="text-sm font-medium text-brand-600 hover:text-brand-500"
              >
                Voltar ao pipeline
              </Link>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_0.5fr]">
            <div className="space-y-6">
              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Etapa atual</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {statusLabelMap[lead.status] ?? lead.status}
                    </p>
                  </div>
                  <Badge variant={lead.status === "Closed Won" ? "success" : "warning"}>
                    {statusLabelMap[lead.status] ?? lead.status}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Criado</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Próximo follow-up</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{nextFollowUp}</p>
                  </div>
                </div>
                {lead.notes ? (
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Notas</p>
                    <p className="mt-2 text-sm text-slate-700">{lead.notes}</p>
                  </div>
                ) : null}
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-950">Linha do tempo</h2>
                  <Badge variant="default">{lead.activities?.length ?? 0} eventos</Badge>
                </div>
                {(lead.activities ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Sem atividades registradas ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {(lead.activities ?? []).map((activity: any) => (
                      <div
                        key={activity.id}
                        className="rounded-3xl border border-slate-200/80 bg-white p-4"
                      >
                        <p className="text-sm text-slate-800">{activity.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                          {new Date(activity.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-950">Propostas</h2>
                  <Link href={`/proposals/new`} className="text-xs font-medium text-brand-600 hover:text-brand-500">
                    + Nova
                  </Link>
                </div>
                {(lead.proposals ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma proposta enviada ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {(lead.proposals ?? []).map((proposal: any) => (
                      <Link
                        key={proposal.id}
                        href={`/proposals/${proposal.id}`}
                        className="block rounded-3xl border border-slate-200/80 bg-slate-50 p-4 transition hover:border-brand-300"
                      >
                        <p className="font-semibold text-slate-900">{proposal.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          R$ {Number(proposal.price).toLocaleString("pt-BR")} &middot;{" "}
                          {proposal.status === "accepted"
                            ? "Aceita"
                            : proposal.status === "rejected"
                            ? "Rejeitada"
                            : "Pendente"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-950">Contratos</h2>
                  <Link href={`/contracts/new`} className="text-xs font-medium text-brand-600 hover:text-brand-500">
                    + Novo
                  </Link>
                </div>
                {(lead.contracts ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum contrato criado ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {(lead.contracts ?? []).map((contract: any) => (
                      <div
                        key={contract.id}
                        className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4"
                      >
                        <p className="font-semibold text-slate-900">{contract.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {contract.status === "signed"
                            ? "Assinado"
                            : contract.status === "expired"
                            ? "Expirado"
                            : "Pendente"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-950">Follow-ups</h2>
                {(lead.follow_ups ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum follow-up agendado.</p>
                ) : (
                  <div className="space-y-3">
                    {(lead.follow_ups ?? []).map((fu: any) => (
                      <div
                        key={fu.id}
                        className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4"
                      >
                        <p className={`text-sm ${fu.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          {fu.note}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(fu.due_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
    </AppShell>
  );
}
