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

const TITLE_SUGGESTIONS = [
  "Contrato de Personal Training — 12 semanas",
  "Contrato de Personal Training — 24 semanas",
  "Contrato de Assessoria Online — 3 meses",
  "Contrato de Assessoria Online — 6 meses",
  "Contrato de Consultoria Nutricional",
  "Contrato de Treinamento Funcional",
];

const VARIABLES = [
  { token: "{{nome}}", label: "Nome do cliente" },
  { token: "{{treinador}}", label: "Treinador" },
  { token: "{{data}}", label: "Data" },
  { token: "{{valor}}", label: "Valor" },
  { token: "{{duracao}}", label: "Duração" },
  { token: "{{frequencia}}", label: "Frequência" },
];

const contractSchema = z.object({
  leadId: z.string().min(1, { message: "Selecione um lead." }),
  title: z.string().min(4, { message: "Informe um título para o contrato." }),
  template: z.string().min(10, { message: "Descreva o escopo e os termos do contrato." }),
  expires_at: z.string().optional()
});

type ContractFormValues = z.infer<typeof contractSchema>;

type Lead = { id: string; name: string; email: string };

const DEFAULT_TEMPLATE = `ACORDO DE SERVIÇO DE PERSONAL TRAINING

Este contrato formaliza a prestação de serviços de personal training entre o Treinador e o Cliente.

PARTES:
Treinador: {{treinador}}
Cliente: {{nome}}
Data de início: {{data}}

ESCOPO DOS SERVIÇOS:
- Planejamento e execução de sessões de treino personalizadas
- Frequência: {{frequencia}}
- Duração total: {{duracao}}
- Acompanhamento de progresso e ajustes de programa
- Suporte via mensagens durante a semana

INVESTIMENTO:
Valor total: {{valor}}
Condições: conforme acordado na proposta aceita.

RESPONSABILIDADES DO CLIENTE:
- Comparecer pontualmente às sessões agendadas
- Informar ao treinador sobre quaisquer limitações ou problemas de saúde
- Seguir as orientações fornecidas

CANCELAMENTO:
Sessões canceladas com menos de 24h de antecedência serão cobradas integralmente.

_______________________________
Assinatura do Treinador

_______________________________
Assinatura do Cliente`;

export function NewContractForm({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      leadId: leads[0]?.id ?? "",
      title: "Contrato de Personal Training — 12 semanas",
      template: DEFAULT_TEMPLATE,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
    }
  });

  const templateValue = watch("template");

  const insertVariable = (token: string) => {
    const textarea = document.getElementById("template") as HTMLTextAreaElement | null;
    if (!textarea) {
      setValue("template", templateValue + token, { shouldValidate: true });
      return;
    }
    const start = textarea.selectionStart ?? templateValue.length;
    const end = textarea.selectionEnd ?? templateValue.length;
    const next = templateValue.slice(0, start) + token + templateValue.slice(end);
    setValue("template", next, { shouldValidate: true });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const onSubmit = async (values: ContractFormValues) => {
    setLoading(true);
    setError(null);

    const promise = fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Não foi possível criar o contrato.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Criando contrato...",
      success: "Contrato criado com sucesso!",
      error: (err) => err.message
    });

    try {
      await promise;
      router.push("/contracts");
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
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Rascunho de contrato</p>
          <h1 className="text-3xl font-semibold text-slate-950">Criar acordo de serviço</h1>
        </div>
        <Link href="/contracts" className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar para contratos
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
            <Label htmlFor="title">Título do contrato *</Label>
            <Input
              id="title"
              list="title-suggestions"
              placeholder="Ex: Contrato de Personal Training — 12 semanas"
              {...register("title")}
            />
            <datalist id="title-suggestions">
              {TITLE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
            {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p> : null}
          </div>
        </div>

        <div>
          <Label htmlFor="expires_at">Data de expiração</Label>
          <Input id="expires_at" type="date" {...register("expires_at")} />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Label htmlFor="template" className="mr-auto">
              Texto do contrato *
            </Label>
            {VARIABLES.map(({ token, label }) => (
              <button
                key={token}
                type="button"
                title={label}
                onClick={() => insertVariable(token)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
              >
                {label}
              </button>
            ))}
          </div>
          <Textarea
            id="template"
            rows={18}
            {...register("template")}
            className="font-mono text-xs leading-6"
          />
          {errors.template ? <p className="mt-2 text-sm text-rose-600">{errors.template.message}</p> : null}
          <p className="mt-2 text-xs text-slate-400">
            Clique nas variáveis acima para inseri-las na posição do cursor.
          </p>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button type="submit" disabled={loading || leads.length === 0} className="w-full">
          {loading ? "Criando contrato..." : "Criar contrato"}
        </Button>
      </form>
    </Card>
  );
}
