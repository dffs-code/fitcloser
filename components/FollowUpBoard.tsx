"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-8">
      {/* Create form */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Novo follow-up</h2>
          <p className="mt-1 text-sm text-slate-500">Agende um lembrete para um lead.</p>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="note">Nota / ação</Label>
              <Textarea
                id="note"
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                required
                placeholder="Ex: Enviar proposta revisada"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="due_at">Data de vencimento</Label>
                <Input
                  id="due_at"
                  type="datetime-local"
                  value={form.due_at}
                  onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="leadId">Lead (opcional)</Label>
                <select
                  id="leadId"
                  value={form.leadId}
                  onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Sem lead específico</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>{lead.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Criar follow-up"}
          </Button>
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Overdue */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Atrasados</h2>
              <p className="mt-1 text-sm text-slate-500">
                Leads que precisam de atenção imediata.
              </p>
            </div>
            <Badge variant="warning">{overdue.length}</Badge>
          </div>
          {overdue.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nada atrasado. Cadência de follow-up em dia.
            </p>
          ) : (
            <div className="space-y-3">
              {overdue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-amber-200 bg-amber-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.leads?.name ?? "Contato geral"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                      <p className="mt-1 text-xs text-amber-600">
                        Venceu {new Date(item.due_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleComplete(item.id)}
                      disabled={completing === item.id}
                      className="shrink-0 text-xs"
                    >
                      {completing === item.id ? "..." : "Concluir"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Próximos</h2>
              <p className="mt-1 text-sm text-slate-500">Agendados para os próximos dias.</p>
            </div>
            <Badge variant="accent">{upcoming.length}</Badge>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum follow-up agendado.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {item.leads?.name ?? "Contato geral"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Vence {new Date(item.due_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleComplete(item.id)}
                      disabled={completing === item.id}
                      className="shrink-0 text-xs"
                    >
                      {completing === item.id ? "..." : "Concluir"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Completed */}
      {done.length > 0 ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-950">Concluídos</h2>
            <Badge variant="success">{done.length}</Badge>
          </div>
          <div className="space-y-3">
            {done.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-4"
              >
                <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm text-slate-500 line-through">{item.note}</p>
                  <p className="text-xs text-slate-400">
                    {item.leads?.name ?? "Geral"} &middot;{" "}
                    {new Date(item.due_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
