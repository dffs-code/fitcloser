import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AppShell } from "@/components/AppShell";
import { createServerClient } from "@/lib/supabase-client";

const statusLabels = [
  { label: "Novo lead", key: "New Lead" },
  { label: "Contatado", key: "Contacted" },
  { label: "Avaliação agendada", key: "Evaluation Scheduled" },
  { label: "Proposta enviada", key: "Proposal Sent" },
  { label: "Negociação", key: "Negotiation" },
  { label: "Fechado ganho", key: "Closed Won" },
  { label: "Fechado perdido", key: "Closed Lost" }
];

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [leadCount, activeClientsCount, followUpsCount, proposals, leads, activities] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("trainer_id", userId),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("trainer_id", userId).eq("status", "Closed Won"),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }).eq("trainer_id", userId).eq("completed", false).lte("due_at", now.toISOString()),
    supabase.from("proposals").select("price,created_at").eq("trainer_id", userId).eq("status", "accepted").gte("created_at", sixMonthsAgo.toISOString()),
    supabase.from("leads").select("created_at,status,name").eq("trainer_id", userId).gte("created_at", sixMonthsAgo.toISOString()),
    supabase.from("activities").select("id,description,created_at").eq("trainer_id", userId).order("created_at", { ascending: false }).limit(10)
  ]);

  const totalLeads = leadCount.count ?? 0;
  const activeClients = activeClientsCount.count ?? 0;
  const pendingFollowUps = followUpsCount.count ?? 0;
  const monthlyRevenue = proposals.data?.reduce((sum, item) => sum + Number(item.price ?? 0), 0) ?? 0;

  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const month = date.toLocaleString("pt-BR", { month: "short" });
    const value = proposals.data?.reduce((sum, item) => {
      const createdAt = new Date(item.created_at);
      return createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear()
        ? sum + Number(item.price ?? 0)
        : sum;
    }, 0) ?? 0;
    return { month, revenue: value, leads: 0 };
  });

  const funnelValues = statusLabels.map((status) => {
    const count = leads.data?.filter((lead) => lead.status === status.key).length ?? 0;
    return { stage: status.label, value: count };
  });

  const recentActivity = activities.data ?? [];

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        {/* Compact header + stats row */}
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Seu painel</p>
            <h1 className="text-2xl font-semibold text-slate-950">Pontuação rápida</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Leads totais</p>
              <p className="text-xl font-semibold text-slate-950">{totalLeads}</p>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Clientes ativos</p>
              <p className="text-xl font-semibold text-slate-950">{activeClients}</p>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Follow-ups</p>
              <p className="text-xl font-semibold text-slate-950">{pendingFollowUps}</p>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Receita 6m</p>
              <p className="text-xl font-semibold text-slate-950">R$ {monthlyRevenue.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </div>

        {/* Main area: charts + activity feed */}
        <div className="min-h-0 flex-1 grid gap-3 xl:grid-cols-[1fr_260px]">
          <DashboardCharts trend={trend} funnel={funnelValues} />
          <Card className="flex h-full flex-col overflow-hidden p-5">
            <div className="mb-3 shrink-0 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Atividade recente</h2>
                <p className="text-xs text-slate-500">Últimas atualizações.</p>
              </div>
              <Badge variant="accent">Feed</Badge>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">Sem atividade ainda. Adicione leads para ativar o pipeline.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{item.description}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.20em] text-slate-400">{new Date(item.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
