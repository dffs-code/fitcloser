import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerClient } from "@/lib/supabase-client";
import { ContractSharePanel } from "@/components/ContractSharePanel";
import { asRoute } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const statusLabel: Record<string, string> = { pending: "Pendente", signed: "Assinado", expired: "Expirado" };
const statusVariant: Record<string, "default" | "success" | "warning"> = { pending: "default", signed: "success", expired: "warning" };

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id,title,template,status,expires_at,created_at,lead_id,leads(name)")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !contract) redirect("/contracts");

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const publicUrl = `${protocol}://${host}/public/contract/${id}`;

  const lead = contract.leads as any;
  const leadName = lead?.name ?? "—";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Contrato</p>
            <h1 className="text-3xl font-semibold text-slate-950">{contract.title}</h1>
            {leadName !== "—" && <p className="mt-1 text-sm text-slate-500">Cliente: {leadName}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[contract.status] ?? "default"}>
              {statusLabel[contract.status] ?? contract.status}
            </Badge>
            <Link href={asRoute(`/contracts/${id}/edit`)} className="text-sm font-medium text-brand-600 hover:text-brand-500">
              Editar
            </Link>
            <Link href="/contracts" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              ← Voltar
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">Conteúdo do contrato</h2>
              <Link
                href={asRoute(`/contracts/${id}/pdf`)}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Exportar PDF
              </Link>
            </div>
            <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {contract.template}
              </pre>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Link para o cliente</h2>
              <ContractSharePanel publicUrl={publicUrl} leadName={leadName} />
            </Card>

            <Card className="space-y-3 p-5">
              <h2 className="text-sm font-semibold text-slate-900">Detalhes</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Criado</span>
                  <span className="font-medium text-slate-800">{new Date(contract.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vencimento</span>
                  <span className="font-medium text-slate-800">
                    {contract.expires_at ? new Date(contract.expires_at).toLocaleDateString("pt-BR") : "Sem prazo"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Situação</span>
                  <Badge variant={statusVariant[contract.status] ?? "default"}>
                    {statusLabel[contract.status] ?? contract.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
