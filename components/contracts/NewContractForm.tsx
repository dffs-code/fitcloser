"use client";

import { Fragment, useState } from "react";
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

const VAR_RE = /(\{\{\w+\}\})/g;

function substituteVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function renderFilled(text: string, vars: Record<string, string>) {
  const resolved = substituteVars(text, vars);
  const parts = resolved.split(VAR_RE);
  return parts.map((part, i) =>
    VAR_RE.test(part) ? (
      <mark key={i} className="rounded bg-amber-100 px-1 font-medium not-italic text-amber-700">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

const contractSchema = z.object({
  leadId: z.string().min(1, { message: "Selecione um lead." }),
  title: z.string().min(4, { message: "Informe um título para o contrato." }),
  template: z.string().min(10, { message: "Descreva o escopo e os termos do contrato." }),
  expires_at: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  goal?: string | null;
};

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
Sessões canceladas com menos de 24h de antecedência serão cobradas integralmente.`;

export function NewContractForm({
  leads,
  businessName = "",
}: {
  leads: Lead[];
  businessName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<ContractFormValues>({
      resolver: zodResolver(contractSchema),
      defaultValues: {
        leadId: leads[0]?.id ?? "",
        title: "Contrato de Personal Training — 12 semanas",
        template: DEFAULT_TEMPLATE,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      },
    });

  const templateValue = watch("template");
  const leadId = watch("leadId");
  const selectedLead = leads.find((l) => l.id === leadId) ?? null;

  const previewVars: Record<string, string> = {
    nome: selectedLead?.name ?? "",
    treinador: businessName,
    data: new Date().toLocaleDateString("pt-BR"),
    email: selectedLead?.email ?? "",
    telefone: selectedLead?.phone ?? "",
    objetivo: selectedLead?.goal ?? "",
  };

  const resolvedPreview = substituteVars(templateValue, previewVars);
  const remainingCount = (resolvedPreview.match(/\{\{\w+\}\}/g) ?? []).length;
  const totalVars = (templateValue.match(/\{\{\w+\}\}/g) ?? []).length;

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
      body: JSON.stringify(values),
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
      error: (err) => err.message,
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
            {errors.leadId && <p className="mt-2 text-sm text-rose-600">{errors.leadId.message}</p>}
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
            {errors.title && <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="expires_at">Data de expiração</Label>
          <Input id="expires_at" type="date" {...register("expires_at")} />
        </div>

        <div>
          {/* Toolbar: label + variable pills + preview toggle */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Label htmlFor="template" className="mr-auto">Texto do contrato *</Label>
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
            {totalVars > 0 && (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                  showPreview
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                </svg>
                {showPreview ? "Fechar prévia" : "Preencher variáveis"}
              </button>
            )}
          </div>

          <Textarea
            id="template"
            rows={18}
            {...register("template")}
            className="font-mono text-xs leading-6"
          />
          {errors.template && <p className="mt-2 text-sm text-rose-600">{errors.template.message}</p>}
          <p className="mt-2 text-xs text-slate-400">
            Clique nas variáveis acima para inseri-las na posição do cursor.
          </p>

          {/* Preview panel */}
          {showPreview && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white">
              <div className="flex items-center justify-between border-b border-indigo-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Prévia — como o cliente verá
                  </span>
                  {selectedLead && (
                    <span className="text-xs text-indigo-400">({selectedLead.name})</span>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  remainingCount === 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {remainingCount === 0
                    ? `✓ Todas as ${totalVars} variáveis preenchidas`
                    : `${totalVars - remainingCount} de ${totalVars} preenchidas · ${remainingCount} pendente${remainingCount > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto p-5">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                  {renderFilled(templateValue, previewVars)}
                </pre>
              </div>
              {remainingCount > 0 && (
                <p className="border-t border-amber-100 bg-amber-50/60 px-5 py-2 text-xs text-amber-600">
                  Variáveis em destaque precisam ser preenchidas manualmente no texto acima.
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button type="submit" disabled={loading || leads.length === 0} className="w-full">
          {loading ? "Criando contrato..." : "Criar contrato"}
        </Button>
      </form>
    </Card>
  );
}
