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
import { z } from "zod";
import { Navigation } from "@/components/Navigation";

const contractSchema = z.object({
  leadId: z.string().min(1, { message: "Informe o ID do lead." }),
  title: z.string().min(4, { message: "Informe um título para o contrato." }),
  template: z.string().min(10, { message: "Descreva o escopo e os termos do contrato." }),
  expires_at: z.string().optional()
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function NewContractPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      leadId: "",
      title: "Contrato de 12 semanas",
      template: "Acordo de serviço inclui coaching, responsabilidade e revisão semanal de progresso.",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
    }
  });

  const onSubmit = async (values: ContractFormValues) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Não foi possível criar o contrato.");
      return;
    }

    setMessage("Rascunho de contrato criado.");
    router.push("/contracts");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto max-w-4xl">
          <Card className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Rascunho de contrato</p>
                <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Criar acordo de serviço</h1>
              </div>
              <Link href="/contracts" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">
                Voltar para contratos
              </Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="leadId">ID do lead</Label>
                <Input id="leadId" {...register("leadId")} />
                {errors.leadId ? <p className="mt-2 text-sm text-rose-600">{errors.leadId.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="title">Título do contrato</Label>
                <Input id="title" {...register("title")} />
                {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="template">Texto do contrato</Label>
                <Textarea id="template" rows={6} {...register("template")} />
                {errors.template ? <p className="mt-2 text-sm text-rose-600">{errors.template.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="expires_at">Data de expiração</Label>
                <Input id="expires_at" type="date" {...register("expires_at")} />
              </div>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Criando contrato..." : "Criar contrato"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
