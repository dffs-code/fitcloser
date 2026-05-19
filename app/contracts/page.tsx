import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

export default async function ContractsPage() {
  const supabase = createServerClient();
  const sessionResponse = await supabase.auth.getSession();
  const session = sessionResponse.data.session;

  if (!session) redirect("/login");

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id,title,status,expires_at,created_at")
    .eq("trainer_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Contratos</p>
              <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Acordos de serviço</h1>
            </div>
            <Link href="/contracts/new" className="inline-block">
              <Button>Novo contrato</Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {(contracts ?? []).length === 0 ? (
              <Card className="p-8 text-center text-slate-600 dark:text-slate-300">
                Ainda não há contratos. Contratos ajudam a fechar clientes profissionalmente e manter proteção.
              </Card>
            ) : (
              (contracts ?? []).map((contract: any) => (
                <Card key={contract.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{contract.title}</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{contract.title}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Vence {contract.expires_at ? new Date(contract.expires_at).toLocaleDateString("pt-BR") : "Nunca"}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <Badge variant={contract.status === "signed" ? "success" : contract.status === "expired" ? "warning" : "default"}>{contract.status === "signed" ? "Assinado" : contract.status === "expired" ? "Expirado" : contract.status}</Badge>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Criado {new Date(contract.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
