import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";

export default async function FollowupsPage() {
  const supabase = createServerClient();
  const sessionResponse = await supabase.auth.getSession();
  const session = sessionResponse.data.session;

  if (!session) redirect("/login");

  const now = new Date().toISOString();
  const { data: followups } = await supabase
    .from("follow_ups")
    .select("id,note,due_at,completed,leads(name)")
    .eq("trainer_id", session.user.id)
    .order("due_at", { ascending: true });

  const overdue = (followups ?? []).filter((item: any) => item.due_at < now && !item.completed);
  const today = (followups ?? []).filter((item: any) => item.due_at >= now && !item.completed).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Lembretes</p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Lembretes e notas rápidas</h1>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Follow-ups atrasados</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Foque nos leads que precisam de atenção imediata.</p>
                </div>
                <Badge variant="warning">{overdue.length}</Badge>
              </div>
              <div className="mt-6 space-y-4">
                {overdue.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Nada atrasado. Sua cadência de follow-up está em dia.</p>
                ) : (
                  overdue.map((item: any) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.leads?.name || "Contato"}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.note}</p>
                        </div>
                        <Badge variant="warning">Vence {new Date(item.due_at).toLocaleDateString("pt-BR")}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Hoje</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lembretes agendados para hoje e os próximos dias.</p>
                </div>
                <Badge variant="accent">{today.length}</Badge>
              </div>
              <div className="mt-6 space-y-4">
                {today.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum follow-up agendado para hoje.</p>
                ) : (
                  today.map((item: any) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.leads?.name || "Contato"}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.note}</p>
                        </div>
                        <Badge variant="accent">Vence {new Date(item.due_at).toLocaleDateString("pt-BR")}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
