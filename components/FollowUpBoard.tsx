"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FollowUp = {
  id: string;
  note: string;
  due_at: string;
  completed: boolean;
  lead_id: string | null;
  leads?: { name: string } | null;
};

type Lead = {
  id: string;
  name: string;
};

type Props = {
  initialFollowups: FollowUp[];
  leads: Lead[];
};

export function FollowUpBoard({ initialFollowups, leads }: Props) {
  const router = useRouter();
  const [followups, setFollowups] = useState<FollowUp[]>(initialFollowups);
  const [form, setForm] = useState({ note: "", due_at: "", leadId: "" });
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    setFollowups(initialFollowups);
  }, [initialFollowups]);

  const now = new Date().toISOString();
  const overdue = followups.filter((f) => f.due_at < now && !f.completed);
  const upcoming = followups.filter((f) => f.due_at >= now && !f.completed);
  const done = followups.filter((f) => f.completed);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const promise = fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", note: form.note, due_at: form.due_at, leadId: form.leadId || undefined })
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar follow-up.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Criando follow-up...",
      success: "Follow-up agendado!",
      error: (err) => err.message
    });

    try {
      await promise;
      setForm({ note: "", due_at: "", leadId: "" });
      router.refresh();
    } catch {
      // error shown by toast
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    setCompleting(id);
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", id })
    });
    setCompleting(null);
    if (res.ok) {
      setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, completed: true } : f)));
      toast.success("Follow-up concluído!");
      router.refresh();
    } else {
      toast.error("Erro ao concluir follow-up.");
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Compact inline form */}
      <form onSubmit={handleCreate} className="shrink-0">
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="note" className="text-xs">Nota / ação</Label>
            <Input
              id="note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              required
              placeholder="Ex: Enviar proposta revisada"
            />
          </div>
          <div className="min-w-[180px]">
            <Label htmlFor="due_at" className="text-xs">Vencimento</Label>
            <Input
              id="due_at"
              type="datetime-local"
              value={form.due_at}
              onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
              required
            />
          </div>
          <div className="min-w-[160px]">
            <Label htmlFor="leadId" className="text-xs">Lead (opcional)</Label>
            <select
              id="leadId"
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Sem lead específico</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving} className="shrink-0">
            {saving ? "Salvando..." : "Criar"}
          </Button>
        </div>
      </form>

      {/* 3 columns: Overdue | Upcoming | Done */}
      <div className="min-h-0 flex-1 grid gap-3 xl:grid-cols-3">
        {/* Overdue */}
        <div className="flex flex-col rounded-2xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="shrink-0 flex items-center justify-between gap-2 border-b border-amber-200/80 px-4 py-3 dark:border-amber-900/40">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">Atrasados</p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">Atenção imediata</p>
            </div>
            <Badge variant="warning">{overdue.length}</Badge>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
            {overdue.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">Nada atrasado. Cadência em dia.</p>
            ) : (
              overdue.map((item) => (
                <div key={item.id} className="rounded-xl border border-amber-200 bg-white/80 p-3 dark:border-amber-800/40 dark:bg-amber-950/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.leads?.name ?? "Contato geral"}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{item.note}</p>
                      <p className="mt-1 text-[10px] text-amber-600">Venceu {new Date(item.due_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleComplete(item.id)}
                      disabled={completing === item.id}
                      className="shrink-0 text-xs px-2 py-1 h-auto"
                    >
                      {completing === item.id ? "..." : "Concluir"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="shrink-0 flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/60">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">Próximos</p>
              <p className="text-[10px] text-slate-500">Agendados</p>
            </div>
            <Badge variant="accent">{upcoming.length}</Badge>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
            {upcoming.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">Nenhum follow-up agendado.</p>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.leads?.name ?? "Contato geral"}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{item.note}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Vence {new Date(item.due_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleComplete(item.id)}
                      disabled={completing === item.id}
                      className="shrink-0 text-xs px-2 py-1 h-auto"
                    >
                      {completing === item.id ? "..." : "Concluir"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Done */}
        <div className="flex flex-col rounded-2xl border border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10">
          <div className="shrink-0 flex items-center justify-between gap-2 border-b border-emerald-200/80 px-4 py-3 dark:border-emerald-900/40">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Concluídos</p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">Feitos</p>
            </div>
            <Badge variant="success">{done.length}</Badge>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
            {done.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">Nenhum concluído ainda.</p>
            ) : (
              done.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-white/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 line-through">{item.note}</p>
                    <p className="text-[10px] text-slate-400">{item.leads?.name ?? "Geral"} &middot; {new Date(item.due_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
