import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { createServerClient } from "@/lib/supabase-client";

type ProposalPageProps = {
  params: { id: string };
};

export default async function ProposalDetailPage({ params }: ProposalPageProps) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("id,title,token,plan,frequency,duration_weeks,price,observations,payment_conditions,status,created_at,leads(name,email)")
    .eq("trainer_id", user.id)
    .eq("id", params.id)
    .single();

  if (error || !proposal) {
    redirect("/proposals");
  }

  const statusLabel =
    proposal.status === "accepted"
      ? "Aceita"
      : proposal.status === "rejected"
      ? "Rejeitada"
      : proposal.status === "sent"
      ? "Enviada"
      : proposal.status === "viewed"
      ? "Vista"
      : "Rascunho";

  const statusVariant =
    proposal.status === "accepted"
      ? "success"
      : proposal.status === "rejected"
      ? "warning"
      : "accent";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Pré-visualização da proposta
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">{proposal.title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {(proposal.leads as any)?.name ?? "Lead desconhecido"}
              </p>
            </div>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>

          <Card className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Valor</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  R$ {Number(proposal.price).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pacote</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{proposal.plan}</p>
                <p className="text-sm text-slate-500">
                  {proposal.frequency}, {proposal.duration_weeks} semanas
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Condições de pagamento
              </h2>
              <p className="text-sm text-slate-700">{proposal.payment_conditions}</p>
            </div>

            {proposal.observations ? (
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Observações
                </h2>
                <p className="mt-3 text-sm text-slate-700">{proposal.observations}</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
                <p className="text-sm text-slate-500">Criado</p>
                <p className="mt-2 text-sm text-slate-900">
                  {new Date(proposal.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
                <p className="text-sm text-slate-500">Link compartilhável</p>
                <Link
                  href={`/public/proposal/${proposal.token}`}
                  className="mt-2 block break-all text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  /public/proposal/{proposal.token}
                </Link>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Link href="/proposals" className="text-sm font-medium text-brand-600 hover:text-brand-500">
              ← Voltar para propostas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
