import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  "CRM de pipeline moderno",
  "Propostas com links compartilháveis",
  "Acompanhamento de contratos e aceitação digital",
  "Lembretes automáticos de follow-up",
  "Modelos prontos para WhatsApp"
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-10 sm:px-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
              Feito para treinadores que querem vendas mais organizadas.
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                Pare de perder clientes no caos do WhatsApp.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                O FitCloser ajuda treinadores a converter mais alunos com pipeline, propostas, contratos e follow-ups organizados.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button>Comece grátis</Button>
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                Veja o painel →
              </Link>
            </div>
          </div>
          <Card className="border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/95">
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white shadow-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-white/90">Pipeline ao vivo</p>
                <h2 className="mt-3 text-3xl font-semibold">120 oportunidades, 18% de conversão</h2>
                <p className="mt-2 text-sm text-white/90">Mantenha todo prospect em um só lugar e não perca janelas de follow-up.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
