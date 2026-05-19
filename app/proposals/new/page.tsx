"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";

const proposalSchema = z.object({
  title: z.string().min(4, { message: "Informe um título para a proposta." }),
  leadId: z.string().min(1, { message: "Informe o ID de um lead existente." }),
  plan: z.string().min(3, { message: "Informe um nome de plano." }),
  frequency: z.string().min(3, { message: "Informe a frequência." }),
  duration_weeks: z.number().min(1, { message: "A duração deve ser de ao menos uma semana." }),
  price: z.number().min(1, { message: "O valor deve ser maior que zero." }),
  observations: z.string().optional(),
  payment_conditions: z.string().min(5, { message: "Adicione condições de pagamento." })
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function NewProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "Pacote premium de coaching",
      leadId: "00000000-0000-0000-0000-000000000000",
      plan: "Musculação magra",
      frequency: "3 sessões / semana",
      duration_weeks: 12,
      price: 349,
      observations: "Inclui suporte nutricional, atualizações de programa e check-ins semanais.",
      payment_conditions: "50% na assinatura, restante em até 7 dias após aceitação."
    }
  });

  const onSubmit = async (values: ProposalFormValues) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Não foi possível criar a proposta.");
      return;
    }

    setMessage("Proposta salva. Você pode enviar o link a partir da página de propostas.");
    router.push("/proposals");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto max-w-4xl">
          <Card className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Criador de proposta</p>
                <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Criar proposta profissional</h1>
              </div>
              <Link href="/proposals" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">
                Voltar para propostas
              </Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="leadId">ID do lead</Label>
                <Input id="leadId" {...register("leadId")} />
                {errors.leadId ? <p className="mt-2 text-sm text-rose-600">{errors.leadId.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="title">Título da proposta</Label>
                <Input id="title" {...register("title")} />
                {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="plan">Plano</Label>
                <Input id="plan" {...register("plan")} />
                {errors.plan ? <p className="mt-2 text-sm text-rose-600">{errors.plan.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Input id="frequency" {...register("frequency")} />
                {errors.frequency ? <p className="mt-2 text-sm text-rose-600">{errors.frequency.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="duration_weeks">Duração (semanas)</Label>
                <Input id="duration_weeks" type="number" {...register("duration_weeks", { valueAsNumber: true })} />
                {errors.duration_weeks ? <p className="mt-2 text-sm text-rose-600">{errors.duration_weeks.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Valor</Label>
                <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
                {errors.price ? <p className="mt-2 text-sm text-rose-600">{errors.price.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="payment_conditions">Condições de pagamento</Label>
                <Input id="payment_conditions" {...register("payment_conditions")} />
                {errors.payment_conditions ? <p className="mt-2 text-sm text-rose-600">{errors.payment_conditions.message}</p> : null}
              </div>
            </div>
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" rows={4} {...register("observations")} />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando proposta..." : "Salvar proposta"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
