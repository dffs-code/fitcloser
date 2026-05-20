"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const FREQUENCY_OPTIONS = [
  "1x / semana", "2x / semana", "3x / semana", "4x / semana",
  "5x / semana", "Diário", "Online (assíncrono)",
];

const PLAN_SUGGESTIONS = [
  "Musculação e condicionamento", "Emagrecimento funcional",
  "Hipertrofia avançada", "Reabilitação e mobilidade",
  "Treinamento esportivo", "Online personalizado", "Presencial + Online",
];

const PAYMENT_SUGGESTIONS = [
  "À vista", "50% na assinatura, 50% em 30 dias",
  "50% na assinatura, restante em até 7 dias após aceitação",
  "3x sem juros no cartão", "Mensal recorrente", "Quinzenal",
];

const schema = z.object({
  title: z.string().min(4, { message: "Informe um título." }),
  plan: z.string().min(3, { message: "Informe um nome de plano." }),
  frequency: z.string().min(1, { message: "Informe a frequência." }),
  duration_weeks: z.number().min(1, { message: "Duração mínima de 1 semana." }),
  price: z.number().min(1, { message: "Valor deve ser maior que zero." }),
  observations: z.string().optional(),
  payment_conditions: z.string().min(3, { message: "Informe condições de pagamento." }),
});

type FormValues = z.infer<typeof schema>;

type InitialProposal = {
  id: string;
  lead_id: string | null;
  lead_name: string;
  title: string;
  plan: string;
  frequency: string;
  duration_weeks: number;
  price: number;
  observations: string | null;
  payment_conditions: string;
};

export function EditProposalForm({ proposal }: { proposal: InitialProposal }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: proposal.title,
      plan: proposal.plan,
      frequency: proposal.frequency,
      duration_weeks: proposal.duration_weeks,
      price: proposal.price,
      observations: proposal.observations ?? "",
      payment_conditions: proposal.payment_conditions,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    const promise = fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: proposal.id, leadId: proposal.lead_id, ...values }),
    }).then(async (res) => {
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar proposta."); }
      return res.json();
    });

    toast.promise(promise, { loading: "Salvando...", success: "Proposta atualizada!", error: (e) => e.message });

    try {
      await promise;
      router.push(`/proposals/${proposal.id}`);
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Editar proposta</p>
          <h1 className="text-3xl font-semibold text-slate-950">{proposal.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Lead: {proposal.lead_name}</p>
        </div>
        <Link href={`/proposals/${proposal.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar à proposta
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="title">Título da proposta *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="plan">Plano *</Label>
            <Input id="plan" list="plan-suggestions" {...register("plan")} />
            <datalist id="plan-suggestions">
              {PLAN_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
            </datalist>
            {errors.plan && <p className="mt-2 text-sm text-rose-600">{errors.plan.message}</p>}
          </div>
          <div>
            <Label htmlFor="frequency">Frequência *</Label>
            <select id="frequency" {...register("frequency")}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {errors.frequency && <p className="mt-2 text-sm text-rose-600">{errors.frequency.message}</p>}
          </div>
          <div>
            <Label htmlFor="duration_weeks">Duração (semanas) *</Label>
            <Input id="duration_weeks" type="number" min={1} max={104}
              {...register("duration_weeks", { valueAsNumber: true })} />
            {errors.duration_weeks && <p className="mt-2 text-sm text-rose-600">{errors.duration_weeks.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Valor *</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
              <Input id="price" type="number" min={1} step={0.01}
                {...register("price", { valueAsNumber: true })} className="pl-10" />
            </div>
            {errors.price && <p className="mt-2 text-sm text-rose-600">{errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="payment_conditions">Condições de pagamento *</Label>
            <Input id="payment_conditions" list="payment-suggestions" {...register("payment_conditions")} />
            <datalist id="payment-suggestions">
              {PAYMENT_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
            </datalist>
            {errors.payment_conditions && <p className="mt-2 text-sm text-rose-600">{errors.payment_conditions.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="observations">Observações</Label>
          <Textarea id="observations" rows={4} {...register("observations")} />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
