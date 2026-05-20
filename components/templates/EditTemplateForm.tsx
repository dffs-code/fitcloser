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

const CATEGORIES = [
  "Primeiro contato", "Follow-up", "Proposta",
  "Boas-vindas", "Reengajamento", "Encerramento", "Outro",
];

const VARIABLES = [
  { token: "{{name}}", label: "Nome" },
  { token: "{{trainer}}", label: "Treinador" },
  { token: "{{phone}}", label: "Telefone" },
  { token: "{{email}}", label: "E-mail" },
  { token: "{{age}}", label: "Idade" },
  { token: "{{goal}}", label: "Objetivo" },
];

const schema = z.object({
  category: z.string().min(2, { message: "Informe uma categoria." }),
  title: z.string().min(3, { message: "Informe um título." }),
  template_body: z.string().min(10, { message: "O texto deve ter ao menos 10 caracteres." }),
});

type FormValues = z.infer<typeof schema>;

type InitialTemplate = {
  id: string;
  category: string;
  title: string;
  body: string;
};

export function EditTemplateForm({ template }: { template: InitialTemplate }) {
  const router = useRouter();
  const [customCategory, setCustomCategory] = useState(
    !CATEGORIES.includes(template.category)
  );

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: template.category,
      title: template.title,
      template_body: template.body,
    },
  });

  const bodyValue = watch("template_body");

  const insertVariable = (token: string) => {
    const textarea = document.getElementById("template_body") as HTMLTextAreaElement | null;
    if (!textarea) { setValue("template_body", bodyValue + token); return; }
    const start = textarea.selectionStart ?? bodyValue.length;
    const end = textarea.selectionEnd ?? bodyValue.length;
    const next = bodyValue.slice(0, start) + token + bodyValue.slice(end);
    setValue("template_body", next, { shouldValidate: true });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const onSubmit = async (values: FormValues) => {
    const promise = fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: template.id, ...values }),
    }).then(async (res) => {
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar modelo."); }
      return res.json();
    });

    toast.promise(promise, { loading: "Salvando...", success: "Modelo atualizado!", error: (e) => e.message });

    try {
      await promise;
      router.push("/templates");
      router.refresh();
    } catch {
      // error shown by toast
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Editar modelo</p>
          <h1 className="text-3xl font-semibold text-slate-950">{template.title}</h1>
        </div>
        <Link href="/templates" className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar para modelos
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Categoria *</Label>
            {customCategory ? (
              <div className="mt-1 flex gap-2">
                <Input id="category" placeholder="Nome da categoria" {...register("category")} autoFocus />
                <button type="button"
                  onClick={() => { setCustomCategory(false); setValue("category", ""); }}
                  className="shrink-0 text-xs text-slate-400 hover:text-slate-700">
                  Cancelar
                </button>
              </div>
            ) : (
              <select id="category"
                {...register("category", {
                  onChange: (e) => {
                    if (e.target.value === "Outro") { setCustomCategory(true); setValue("category", ""); }
                  }
                })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {errors.category && <p className="mt-2 text-sm text-rose-600">{errors.category.message}</p>}
          </div>
          <div>
            <Label htmlFor="title">Título do modelo *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="mt-2 text-sm text-rose-600">{errors.title.message}</p>}
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Label htmlFor="template_body" className="mr-auto">Texto da mensagem *</Label>
            {VARIABLES.map(({ token, label }) => (
              <button key={token} type="button" title={`Inserir ${token}`} onClick={() => insertVariable(token)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
                {label}
              </button>
            ))}
          </div>
          <Textarea id="template_body" rows={8} {...register("template_body")} className="font-mono text-sm leading-7" />
          {errors.template_body && <p className="mt-2 text-sm text-rose-600">{errors.template_body.message}</p>}
          <p className="mt-2 text-xs text-slate-400">Clique nas variáveis acima para inseri-las na posição do cursor.</p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
