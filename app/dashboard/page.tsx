import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Navigation } from "@/components/Navigation";
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
    supabase
      .from("proposals")
      .select("price,created_at")
      .eq("trainer_id", userId)
      .eq("status", "accepted")
      .gte("created_at", sixMonthsAgo.toISOString()),
    supabase.from("leads").select("created_at,status, name").eq("trainer_id", userId).gte("created_at", sixMonthsAgo.toISOString()),
    supabase
      .from("activities")
      .select("id,description,created_at")
      .eq("trainer_id", userId)
      .order("created_at", { ascending: false })
      .limit(6)
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-glow">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Seu painel</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Pontuação rápida do pipeline</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Visão geral de clientes ativos, receita e follow-ups no seu processo de vendas.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <p className="text-sm text-slate-500">Leads totais</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{totalLeads}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Clientes ativos</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{activeClients}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Follow-ups pendentes</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{pendingFollowUps}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Receita últimos 6 meses</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">R$ {monthlyRevenue.toLocaleString("pt-BR")}</p>
              </Card>
            </div>
          </div>
          <DashboardCharts trend={trend} funnel={funnelValues} />
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Atividade recente</h2>
                <p className="text-sm text-slate-500">Últimas atualizações de leads e propostas.</p>
              </div>
              <Badge variant="accent">Feed ao vivo</Badge>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-600">Ainda sem atividade. Adicione leads para ativar seu pipeline.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">{item.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{new Date(item.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
