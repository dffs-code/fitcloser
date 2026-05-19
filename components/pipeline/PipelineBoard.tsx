"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

const statusMap: { key: LeadStatus; label: string; color: "default" | "accent" | "success" | "warning" }[] = [
  { key: "New Lead", label: "Novo lead", color: "accent" },
  { key: "Contacted", label: "Contatado", color: "default" },
  { key: "Evaluation Scheduled", label: "Avaliação agendada", color: "warning" },
  { key: "Proposal Sent", label: "Proposta enviada", color: "accent" },
  { key: "Negotiation", label: "Negociação", color: "warning" },
  { key: "Closed Won", label: "Fechado ganho", color: "success" },
  { key: "Closed Lost", label: "Fechado perdido", color: "default" }
];

const statusLabelMap: Record<string, string> = {
  "New Lead": "Novo lead",
  Contacted: "Contatado",
  "Evaluation Scheduled": "Avaliação agendada",
  "Proposal Sent": "Proposta enviada",
  Negotiation: "Negociação",
  "Closed Won": "Ganho",
  "Closed Lost": "Perdido"
};

type PipelineBoardProps = {
  initialLeads: Lead[];
};

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-950/90",
        isDragging && "ring-2 ring-brand-500"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lead.name}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{lead.goal}</p>
        </div>
        <Badge variant={lead.status === "Closed Won" ? "success" : "default"}>{statusLabelMap[lead.status] ?? lead.status}</Badge>
      </div>
      <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <p>{lead.phone}</p>
        <p>{lead.email}</p>
        {lead.estimated_value ? <p>Estimado R$ {lead.estimated_value.toLocaleString("pt-BR")}</p> : null}
      </div>
    </div>
  );
}

function Column({ status, leads, active }: { status: typeof statusMap[number]; leads: Lead[]; active: boolean }) {
  const { setNodeRef } = useDroppable({ id: status.key });

  return (
    <div ref={setNodeRef} className="group rounded-[2rem] border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{status.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{leads.length} contatos</p>
        </div>
        <Badge variant={status.color}>{status.color === "success" ? "Ganho" : status.color === "warning" ? "Quente" : "Ativo"}</Badge>
      </div>
      <div className={cn("space-y-3", active && "ring-2 ring-brand-300/60")}>{leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}</div>
    </div>
  );
}

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", goal: "", source: "Instagram", estimated_value: "", next_follow_up: "" });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredLeads = useMemo(
    () => leads.filter((lead) => lead.name.toLowerCase().includes(search.toLowerCase()) || lead.email.toLowerCase().includes(search.toLowerCase()) || lead.goal.toLowerCase().includes(search.toLowerCase())),
    [leads, search]
  );

  const grouped = useMemo(
    () => statusMap.reduce((acc, status) => ({ ...acc, [status.key]: filteredLeads.filter((lead) => lead.status === status.key) }), {} as Record<LeadStatus, Lead[]>),
    [filteredLeads]
  );

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        ...form
      })
    });
    setSaving(false);
    if (response.ok) {
      setForm({ name: "", email: "", phone: "", goal: "", source: "Instagram", estimated_value: "", next_follow_up: "" });
      router.refresh();
    }
  };

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", leadId, status })
    });

    if (!response.ok) return;
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id.toString();
    if (statusMap.some((status) => status.key === overId)) {
      updateStatus(active.id.toString(), overId as LeadStatus);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <Card className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pipeline</p>
              <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Quadro de vendas</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Arraste leads entre etapas para manter o fluxo alinhado.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Buscar por nome, e-mail ou objetivo" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <form onSubmit={handleCreate} className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Input id="goal" value={form.goal} onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="source">Fonte</Label>
                <Input id="source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
              </div>
              <div>
                <Label htmlFor="estimated_value">Valor estimado</Label>
                <Input id="estimated_value" type="number" value={form.estimated_value} onChange={(event) => setForm((current) => ({ ...current, estimated_value: event.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="next_follow_up">Próximo follow-up</Label>
              <Input id="next_follow_up" type="date" value={form.next_follow_up} onChange={(event) => setForm((current) => ({ ...current, next_follow_up: event.target.value }))} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Adicione um novo lead e mantenha o ritmo na etapa inicial.</p>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar lead"}</Button>
            </div>
          </form>
        </Card>
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Saúde do pipeline</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Monitore as etapas que precisam de mais atenção.</p>
          </div>
          <div className="grid gap-3">
            {statusMap.map((status) => (
              <div key={status.key} className="rounded-3xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{status.label}</p>
                  <Badge variant={status.color}>{grouped[status.key].length}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{grouped[status.key].length} leads nesta etapa</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-3">
          {statusMap.map((status) => (
            <Column key={status.key} status={status} leads={grouped[status.key]} active={false} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
