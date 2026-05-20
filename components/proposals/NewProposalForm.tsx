"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { z } from "zod";

const FREQUENCY_OPTIONS = [
  "1x / semana",
  "2x / semana",
  "3x / semana",
  "4x / semana",
  "5x / semana",
  "Diário",
  "Online (assíncrono)",
];

const PLAN_SUGGESTIONS = [
  "Musculação e condicionamento",
  "Emagrecimento funcional",
  "Hipertrofia avançada",
  "Reabilitação e mobilidade",
  "Treinamento esportivo",
  "Online personalizado",
  "Presencial + Online",
];

const PAYMENT_SUGGESTIONS = [
  "À vista",
  "50% na assinatura, 50% em 30 dias",
  "50% na assinatura, restante em até 7 dias após aceitação",
  "3x sem juros no cartão",
  "Mensal recorrente",
  "Quinzenal",
];

const proposalSchema = z.object({
  leadId: z.string().min(1, { message: "Selecione um lead." }),
  title: z.string().min(4, { message: "Informe um título para a proposta." }),
  plan: z.string().min(3, { message: "Informe um nome de plano." }),
  frequency: z.string().min(1, { message: "Informe a frequência." }),
  duration_weeks: z.number().min(1, { message: "A duração deve ser de ao menos uma semana." }),
  price: z.number().min(1, { message: "O valor deve ser maior que zero." }),
  observations: z.string().optional(),
  payment_conditions: z.string().min(3, { message: "Adicione condições de pagamento." })
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

type Lead = { id: string; name: string; email: string };

export function NewProposalForm({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      leadId: leads[0]?.id ?? "",
      title: "Pacote premium de coaching",
      plan: "Musculação e condicionamento",
      frequency: "3x / semana",
      duration_weeks: 12,
      price: 349,
      observations: "Inclui suporte nutricional, atualizações de programa e check-ins semanais.",
      payment_conditions: "50% na assinatura, restante em até 7 dias após aceitação."
    }
  });

  const onSubmit = async (values: ProposalFormValues) => {
    setLoading(true);
    setError(null);

    const promise = fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Não foi possível criar a proposta.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Criando proposta...",
      success: "Proposta criada com sucesso!",
      error: (err) => err.message
    });

    try {
      await promise;
      router.push("/proposals");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Criador de proposta</p>
          <h1 className="text-3xl font-semibold text-slate-950">Criar proposta profissional</h1>
        </div>
        <Link href="/proposals" className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar para propostas
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="leadId">Lead *</Label>
            {leads.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Nenhum lead cadastrado.{" "}
                <Link href="/pipeline" className="text-brand-600 underline">
                  Adicione um lead primeiro.
                </Link>
              </p>
            ) : (
              <select
                id="leadId"
                {...register("leadId")}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} — {lead.email}
                  </option>
                ))}
              </select>
            )}
            {errors.leadId ? <p className="mt-2 text-sm text-rose-600">{errors.leadId.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="title">Título da proposta *</Label>
            <Input id="title" placeholder="Ex: Pacote premium 12 semanas" {...register("title")} />
            {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="plan">Plano *</Label>
            <Input
              id="plan"
              list="plan-suggestions"
              placeholder="Ex: Musculação e condicionamento"
              {...register("plan")}
            />
            <datalist id="plan-suggestions">
              {PLAN_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
            </datalist>
            {errors.plan ? <p className="mt-2 text-sm text-rose-600">{errors.plan.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="frequency">Frequência *</Label>
            <select
              id="frequency"
              {...register("frequency")}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {errors.frequency ? <p className="mt-2 text-sm text-rose-600">{errors.frequency.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="duration_weeks">Duração (semanas) *</Label>
            <Input
              id="duration_weeks"
              type="number"
              min={1}
              max={104}
              placeholder="12"
              {...register("duration_weeks", { valueAsNumber: true })}
            />
            {errors.duration_weeks ? (
              <p className="mt-2 text-sm text-rose-600">{errors.duration_weeks.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Valor *</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
              <Input
                id="price"
                type="number"
                min={1}
                step={0.01}
                placeholder="349,00"
                {...register("price", { valueAsNumber: true })}
                className="pl-10"
              />
            </div>
            {errors.price ? <p className="mt-2 text-sm text-rose-600">{errors.price.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="payment_conditions">Condições de pagamento *</Label>
            <Input
              id="payment_conditions"
              list="payment-suggestions"
              placeholder="Ex: 50% na assinatura..."
              {...register("payment_conditions")}
            />
            <datalist id="payment-suggestions">
              {PAYMENT_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
            </datalist>
            {errors.payment_conditions ? (
              <p className="mt-2 text-sm text-rose-600">{errors.payment_conditions.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="observations">Observações</Label>
          <Textarea
            id="observations"
            rows={4}
            placeholder="Inclui suporte nutricional, check-ins semanais..."
            {...register("observations")}
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button type="submit" disabled={loading || leads.length === 0} className="w-full">
          {loading ? "Criando proposta..." : "Salvar proposta"}
        </Button>
      </form>
    </Card>
  );
}
