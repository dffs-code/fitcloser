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

const TITLE_SUGGESTIONS = [
  "Contrato de Personal Training — 12 semanas",
  "Contrato de Personal Training — 24 semanas",
  "Contrato de Assessoria Online — 3 meses",
  "Contrato de Assessoria Online — 6 meses",
];

const VARIABLES = [
  { token: "{{nome}}", label: "Nome do cliente" },
  { token: "{{treinador}}", label: "Treinador" },
  { token: "{{data}}", label: "Data" },
  { token: "{{valor}}", label: "Valor" },
  { token: "{{duracao}}", label: "Duração" },
  { token: "{{frequencia}}", label: "Frequência" },
];

const schema = z.object({
  title: z.string().min(4, { message: "Informe um título." }),
  template: z.string().min(10, { message: "Descreva o escopo e os termos do contrato." }),
  expires_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type InitialContract = {
  id: string;
  lead_id: string | null;
  lead_name: string;
  title: string;
  template: string;
  expires_at: string | null;
};

export function EditContractForm({ contract }: { contract: InitialContract }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: contract.title,
      template: contract.template,
      expires_at: contract.expires_at ? contract.expires_at.slice(0, 10) : "",
    },
  });

  const templateValue = watch("template");

  const insertVariable = (token: string) => {
    const textarea = document.getElementById("template") as HTMLTextAreaElement | null;
    if (!textarea) { setValue("template", templateValue + token, { shouldValidate: true }); return; }
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

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    const promise = fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: contract.id, leadId: contract.lead_id, ...values }),
    }).then(async (res) => {
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar contrato."); }
      return res.json();
    });

    toast.promise(promise, { loading: "Salvando...", success: "Contrato atualizado!", error: (e) => e.message });

    try {
      await promise;
      router.push("/contracts");
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Editar contrato</p>
          <h1 className="text-3xl font-semibold text-slate-950">{contract.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Lead: {contract.lead_name}</p>
        </div>
        <Link href="/contracts" className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar para contratos
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Título do contrato *</Label>
            <Input id="title" list="title-suggestions" {...register("title")} />
            <datalist id="title-suggestions">
              {TITLE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
            {errors.title && <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="expires_at">Data de expiração</Label>
            <Input id="expires_at" type="date" {...register("expires_at")} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Label htmlFor="template" className="mr-auto">Texto do contrato *</Label>
            {VARIABLES.map(({ token, label }) => (
              <button key={token} type="button" title={label} onClick={() => insertVariable(token)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
                {label}
              </button>
            ))}
          </div>
          <Textarea id="template" rows={18} {...register("template")} className="font-mono text-xs leading-6" />
          {errors.template && <p className="mt-2 text-sm text-rose-600">{errors.template.message}</p>}
          <p className="mt-2 text-xs text-slate-400">Clique nas variáveis acima para inseri-las na posição do cursor.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
