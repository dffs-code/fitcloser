"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const SOURCE_OPTIONS = [
  "Instagram", "WhatsApp", "Indicação", "Google", "Facebook",
  "TikTok", "YouTube", "Site", "Evento", "Outro",
];

const GOAL_SUGGESTIONS = [
  "Perda de peso", "Ganho de massa muscular", "Condicionamento físico",
  "Definição corporal", "Hipertrofia", "Reabilitação", "Melhora da saúde",
  "Resistência cardiovascular", "Flexibilidade", "Preparação esportiva",
];

const STATUS_OPTIONS = [
  { value: "New Lead",             label: "Novo lead" },
  { value: "Contacted",            label: "Contatado" },
  { value: "Evaluation Scheduled", label: "Avaliação agendada" },
  { value: "Proposal Sent",        label: "Proposta enviada" },
  { value: "Negotiation",          label: "Negociação" },
  { value: "Closed Won",           label: "Fechado ganho" },
  { value: "Closed Lost",          label: "Perdido" },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type InitialLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  goal: string;
  source: string;
  status: string;
  tags: string[];
  notes: string;
  estimated_value: number | null;
  next_follow_up: string | null;
};

export function EditLeadForm({ lead }: { lead: InitialLead }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    age: lead.age != null ? String(lead.age) : "",
    goal: lead.goal,
    source: lead.source,
    status: lead.status,
    notes: lead.notes ?? "",
    estimated_value: lead.estimated_value != null ? String(lead.estimated_value) : "",
    next_follow_up: lead.next_follow_up ? lead.next_follow_up.slice(0, 10) : "",
  });
  const [tags, setTags] = useState<string[]>(lead.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.replace(/,/g, "").trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const promise = fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        leadId: lead.id,
        ...form,
        tags,
        age: form.age || undefined,
        estimated_value: form.estimated_value || undefined,
        next_follow_up: form.next_follow_up || undefined,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar lead.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Salvando...",
      success: "Lead atualizado!",
      error: (err) => err.message,
    });

    try {
      await promise;
      router.push(`/leads/${lead.id}`);
      router.refresh();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Editar lead</p>
          <h1 className="text-3xl font-semibold text-slate-950">{lead.name}</h1>
        </div>
        <Link href={`/leads/${lead.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-500">
          Voltar ao lead
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input id="phone" required value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))} />
          </div>
          <div>
            <Label htmlFor="age">Idade</Label>
            <Input id="age" type="number" min={10} max={100} placeholder="30" value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="goal">Objetivo *</Label>
            <Input id="goal" list="goal-suggestions" required value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))} />
            <datalist id="goal-suggestions">
              {GOAL_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <Label htmlFor="source">Fonte</Label>
            <select id="source" value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="status">Etapa no pipeline</Label>
            <select id="status" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="estimated_value">Valor estimado (R$)</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
              <Input id="estimated_value" type="number" min={0} step={0.01} placeholder="0,00"
                value={form.estimated_value} className="pl-10"
                onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="next_follow_up">Próximo follow-up</Label>
            <Input id="next_follow_up" type="date" value={form.next_follow_up}
              onChange={(e) => setForm((f) => ({ ...f, next_follow_up: e.target.value }))} />
          </div>
        </div>

        <div>
          <Label htmlFor="tag-input">Tags</Label>
          {tags.length > 0 && (
            <div className="mb-2 mt-1 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="leading-none text-brand-400 hover:text-brand-700">×</button>
                </span>
              ))}
            </div>
          )}
          <Input id="tag-input" placeholder="Ex: musculação — Enter para adicionar"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
              if (e.key === "Backspace" && !tagInput && tags.length > 0) setTags((p) => p.slice(0, -1));
            }}
            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" rows={4} placeholder="Observações sobre o lead..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
