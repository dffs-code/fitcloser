"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
  rectIntersection,
  type CollisionDetection
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

const SOURCE_OPTIONS = [
  "Instagram",
  "WhatsApp",
  "Indicação",
  "Google",
  "Facebook",
  "TikTok",
  "YouTube",
  "Site",
  "Evento",
  "Outro",
];

const GOAL_SUGGESTIONS = [
  "Perda de peso",
  "Ganho de massa muscular",
  "Condicionamento físico",
  "Definição corporal",
  "Hipertrofia",
  "Reabilitação",
  "Melhora da saúde",
  "Resistência cardiovascular",
  "Flexibilidade",
  "Preparação esportiva",
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Pipeline stages with their display labels and visual heat indicator.
// "warning" = high-intent stages where speed matters (amber).
// "success" = closed-won (green).
// "accent" = active/progressing (blue).
const statusMap: {
  key: LeadStatus;
  label: string;
  color: "default" | "accent" | "success" | "warning";
  heatLabel: string;
}[] = [
  { key: "New Lead",              label: "Novo lead",         color: "accent",  heatLabel: "Novo"   },
  { key: "Contacted",             label: "Contatado",         color: "default", heatLabel: "Ativo"  },
  { key: "Evaluation Scheduled",  label: "Avaliação agendada",color: "warning", heatLabel: "Quente" },
  { key: "Proposal Sent",         label: "Proposta enviada",  color: "accent",  heatLabel: "Ativo"  },
  { key: "Negotiation",           label: "Negociação",        color: "warning", heatLabel: "Quente" },
  { key: "Closed Won",            label: "Fechado ganho",     color: "success", heatLabel: "Ganho"  },
  { key: "Closed Lost",           label: "Fechado perdido",   color: "default", heatLabel: "Perdido"},
];

const statusLabelMap: Record<string, string> = Object.fromEntries(
  statusMap.map((s) => [s.key, s.label])
);

type PipelineBoardProps = { initialLeads: Lead[] };

// ─── Shared card content ─────────────────────────────────────────────────────
// Extracted so it can be reused by both the draggable card and the overlay.

function LeadCardContent({ lead }: { lead: Lead }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{lead.goal}</p>
        </div>
        <Badge variant={lead.status === "Closed Won" ? "success" : "default"}>
          {statusLabelMap[lead.status] ?? lead.status}
        </Badge>
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-600">
        {lead.phone ? <p>{lead.phone}</p> : null}
        {lead.email ? <p className="truncate">{lead.email}</p> : null}
        {lead.estimated_value ? (
          <p className="font-medium text-emerald-700">
            R$ {Number(lead.estimated_value).toLocaleString("pt-BR")}
          </p>
        ) : null}
      </div>
    </>
  );
}

// ─── Draggable card (stays in column, becomes ghost while dragging) ───────────

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity active:cursor-grabbing",
        // Ghosted while dragging — the DragOverlay is the visual card
        isDragging && "opacity-40"
      )}
    >
      {/* Name is clickable for navigation; rest of card is drag handle */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="cursor-pointer text-sm font-semibold text-slate-900 underline-offset-2 hover:text-brand-600 hover:underline"
          >
            {lead.name}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{lead.goal}</p>
        </div>
        <Badge variant={lead.status === "Closed Won" ? "success" : "default"}>
          {statusLabelMap[lead.status] ?? lead.status}
        </Badge>
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-600">
        {lead.phone ? <p>{lead.phone}</p> : null}
        {lead.email ? <p className="truncate">{lead.email}</p> : null}
        {lead.estimated_value ? (
          <p className="font-medium text-emerald-700">
            R$ {Number(lead.estimated_value).toLocaleString("pt-BR")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─── Overlay card (floats above everything while dragging) ────────────────────
// Rendered by DragOverlay — no ref/listeners needed, just the visual shell.

function LeadCardOverlay({ lead }: { lead: Lead }) {
  return (
    <div className="cursor-grabbing rounded-3xl border border-brand-300 bg-white p-4 shadow-2xl ring-2 ring-brand-400/60">
      <LeadCardContent lead={lead} />
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function Column({
  status,
  leads,
  isActiveOver,
  onLeadClick,
}: {
  status: (typeof statusMap)[number];
  leads: Lead[];
  isActiveOver: boolean;
  onLeadClick: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status.key });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[2rem] border p-4 transition-colors duration-150",
        isActiveOver
          ? "border-brand-400 bg-brand-50/50"
          : "border-slate-200/80 bg-slate-50/70"
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{status.label}</p>
          <p className="text-xs text-slate-500">{leads.length} contatos</p>
        </div>
        {/* Heat label: visual indicator of urgency for this stage */}
        <Badge variant={status.color}>{status.heatLabel}</Badge>
      </div>
      <div className="space-y-3 min-h-[4rem]">
        {leads.length === 0 ? (
          <div className={cn(
            "rounded-3xl border border-dashed p-4 text-center text-xs transition-colors duration-150",
            isActiveOver
              ? "border-brand-400 text-brand-500"
              : "border-slate-300 text-slate-400"
          )}>
            Solte aqui
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead.id)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Custom collision detection ───────────────────────────────────────────────
// Prefer pointer-inside-droppable; fall back to rect intersection.
// This makes it much easier to drop into a column vs accidentally
// triggering an adjacent column when the pointer is at the edge.

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

// ─── Main board ───────────────────────────────────────────────────────────────

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "",
    goal: "", source: "Instagram",
    estimated_value: "", next_follow_up: "", notes: ""
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addTag = (value: string) => {
    const trimmed = value.replace(/,/g, "").trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 6px movement before drag starts — prevents accidental drags on click
      activationConstraint: { distance: 6 }
    })
  );

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId]
  );

  const filteredLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          (lead.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (lead.goal ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [leads, search]
  );

  const grouped = useMemo(
    () =>
      statusMap.reduce(
        (acc, s) => ({ ...acc, [s.key]: filteredLeads.filter((l) => l.status === s.key) }),
        {} as Record<LeadStatus, Lead[]>
      ),
    [filteredLeads]
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const promise = fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, tags })
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar lead.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Adicionando lead...",
      success: `${form.name} adicionado ao pipeline!`,
      error: (err) => err.message
    });

    try {
      await promise;
      setForm({ name: "", email: "", phone: "", age: "", goal: "", source: "Instagram", estimated_value: "", next_follow_up: "", notes: "" });
      setTags([]);
      setTagInput("");
      router.refresh();
    } catch {
      // error already shown by toast
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", leadId, status })
    });
    if (res.ok) {
      const label = statusMap.find((s) => s.key === status)?.label ?? status;
      toast.success(`Movido para ${label}`, { duration: 2000 });
      router.refresh();
    } else {
      // Roll back optimistic update
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: l.status } : l)));
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id.toString());
  };

  const handleDragOver = ({ over }: { over: { id: string | number } | null }) => {
    setOverId(over ? over.id.toString() : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    if (!over) return;
    const newStatus = over.id.toString() as LeadStatus;
    if (statusMap.some((s) => s.key === newStatus)) {
      const lead = leads.find((l) => l.id === active.id.toString());
      if (lead && lead.status !== newStatus) {
        updateStatus(active.id.toString(), newStatus);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <div className="space-y-8">
      {/* Add lead + pipeline health */}
      <div className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <Card className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pipeline</p>
              <h1 className="text-3xl font-semibold text-slate-950">Quadro de vendas</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">
              Arraste leads entre etapas ou clique no nome para abrir.
            </div>
          </div>
          <Input
            placeholder="Buscar por nome, e-mail ou objetivo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  min={10}
                  max={100}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal">Objetivo *</Label>
                <Input
                  id="goal"
                  list="goal-suggestions"
                  placeholder="Ex: Perda de peso"
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                  required
                />
                <datalist id="goal-suggestions">
                  {GOAL_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>
              <div>
                <Label htmlFor="source">Fonte</Label>
                <select
                  id="source"
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="estimated_value">Valor estimado (R$)</Label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
                  <Input
                    id="estimated_value"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0,00"
                    value={form.estimated_value}
                    onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="next_follow_up">Próximo follow-up</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  value={form.next_follow_up}
                  onChange={(e) => setForm((f) => ({ ...f, next_follow_up: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tag-input">Tags</Label>
              {tags.length > 0 && (
                <div className="mb-2 mt-1 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="leading-none text-brand-400 hover:text-brand-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                id="tag-input"
                placeholder="Ex: musculação, emagrecimento — Enter para adicionar"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                  if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Observações sobre o lead..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">Adicione um novo lead na etapa inicial.</p>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar lead"}</Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Saúde do pipeline</h2>
            <p className="mt-2 text-sm text-slate-500">Monitorar etapas que precisam de atenção.</p>
          </div>
          <div className="grid gap-3">
            {statusMap.map((s) => (
              <div key={s.key} className="rounded-3xl border border-slate-200/80 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{s.label}</p>
                  <Badge variant={s.color}>{grouped[s.key]?.length ?? 0}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {grouped[s.key]?.length ?? 0} lead(s) &middot; {s.heatLabel}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Kanban board — explicit id prevents the aria-describedby SSR/client mismatch */}
      <DndContext
        id="pipeline-dnd-board"
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver as any}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {statusMap.map((s) => (
            <Column
              key={s.key}
              status={s}
              leads={grouped[s.key] ?? []}
              isActiveOver={overId === s.key}
              onLeadClick={(id) => router.push(`/leads/${id}`)}
            />
          ))}
        </div>

        {/* DragOverlay renders a floating clone that follows the cursor.
            It lives outside the scroll container so it is never clipped. */}
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
