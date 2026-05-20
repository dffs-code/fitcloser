"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartSeries = {
  month: string;
  leads: number;
  revenue: number;
};

type FunnelPoint = {
  stage: string;
  value: number;
};

export function DashboardCharts({ trend, funnel }: { trend: ChartSeries[]; funnel: FunnelPoint[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <Card className="min-h-[340px] p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Tendência de receita</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Crescimento em 6 meses</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Ao vivo</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="revenue" stroke="#4338ca" fill="url(#revenueGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="min-h-[340px] p-6">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Funil de conversão</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Velocidade do pipeline</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" fill="#2563eb" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
