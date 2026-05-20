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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

const SOURCE_OPTIONS = [
  "Instagram", "WhatsApp", "Indicação", "Google", "Facebook",
  "TikTok", "YouTube", "Site", "Evento", "Outro",
];

const GOAL_SUGGESTIONS = [
  "Perda de peso", "Ganho de massa muscular", "Condicionamento físico",
  "Definição corporal", "Hipertrofia", "Reabilitação", "Melhora da saúde",
  "Resistência cardiovascular", "Flexibilidade", "Preparação esportiva",
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

const statusMap: {
  key: LeadStatus;
  label: string;
  color: "default" | "accent" | "success" | "warning";
  heatLabel: string;
}[] = [
  { key: "New Lead",             label: "Novo lead",          color: "accent",  heatLabel: "Novo"    },
  { key: "Contacted",            label: "Contatado",          color: "default", heatLabel: "Ativo"   },
  { key: "Evaluation Scheduled", label: "Avaliação ag.",      color: "warning", heatLabel: "Quente"  },
  { key: "Proposal Sent",        label: "Proposta env.",      color: "accent",  heatLabel: "Ativo"   },
  { key: "Negotiation",          label: "Negociação",         color: "warning", heatLabel: "Quente"  },
  { key: "Closed Won",           label: "Fechado ganho",      color: "success", heatLabel: "Ganho"   },
  { key: "Closed Lost",          label: "Perdido",            color: "default", heatLabel: "Perdido" },
];

const statusLabelMap: Record<string, string> = Object.fromEntries(
  statusMap.map((s) => [s.key, s.label])
);

type PipelineBoardProps = { initialLeads: Lead[] };

// ─── Card content (shared between draggable and overlay) ──────────────────────

function LeadCardContent({ lead }: { lead: Lead }) {
  const statusInfo = statusMap.find((s) => s.key === lead.status);
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2 min-w-0">{lead.name}</p>
        {statusInfo && (
          <Badge variant={statusInfo.color} className="mt-0.5 shrink-0">
            {statusInfo.heatLabel}
          </Badge>
        )}
      </div>
      {lead.goal ? (
        <p className="mt-1 truncate text-xs text-slate-500">{lead.goal}</p>
      ) : null}
      {lead.tags && lead.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {lead.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}
      {lead.estimated_value ? (
        <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          R$ {Number(lead.estimated_value).toLocaleString("pt-BR")}
        </p>
      ) : null}
    </>
  );
}

// ─── Draggable card ────────────────────────────────────────────────────────────

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  const statusInfo = statusMap.find((s) => s.key === lead.status);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-opacity active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="cursor-pointer text-sm font-semibold leading-snug text-slate-900 underline-offset-2 hover:text-brand-600 hover:underline line-clamp-2 min-w-0"
        >
          {lead.name}
        </p>
        {statusInfo && (
          <Badge variant={statusInfo.color} className="mt-0.5 shrink-0">
            {statusInfo.heatLabel}
          </Badge>
        )}
      </div>
      {lead.goal ? (
        <p className="mt-1 truncate text-xs text-slate-500">{lead.goal}</p>
      ) : null}
      {lead.tags && lead.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {lead.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}
      {lead.estimated_value ? (
        <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          R$ {Number(lead.estimated_value).toLocaleString("pt-BR")}
        </p>
      ) : null}
    </div>
  );
}

// ─── Overlay card ──────────────────────────────────────────────────────────────

function LeadCardOverlay({ lead }: { lead: Lead }) {
  return (
    <div className="w-[240px] cursor-grabbing rounded-xl border border-brand-300 bg-white p-3 shadow-2xl ring-2 ring-brand-400/60 dark:bg-slate-800">
      <LeadCardContent lead={lead} />
    </div>
  );
}

// ─── Droppable column ──────────────────────────────────────────────────────────

function Column({
  status, leads, isActiveOver, onLeadClick,
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
        "flex min-w-[240px] flex-1 flex-col rounded-2xl border p-3 transition-colors duration-150",
        isActiveOver
          ? "border-brand-400 bg-brand-50/50 dark:bg-brand-50/10"
          : "border-slate-200/80 bg-slate-50/70 dark:border-slate-700/60 dark:bg-slate-900/60"
      )}
    >
      <div className="mb-2.5 flex shrink-0 items-center justify-between gap-2 px-0.5">
        <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{status.label}</p>
        <span className="shrink-0 rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">{leads.length}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {leads.length === 0 ? (
          <div className={cn(
            "rounded-xl border border-dashed p-4 text-center text-xs transition-colors duration-150",
            isActiveOver ? "border-brand-400 text-brand-500" : "border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500"
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

// ─── Collision detection ───────────────────────────────────────────────────────

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

// ─── Add Lead Drawer ───────────────────────────────────────────────────────────

function AddLeadDrawer({
  open,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "",
    goal: "", source: "Instagram",
    estimated_value: "", next_follow_up: "", notes: ""
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.replace(/,/g, "").trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(e);
    // Form is reset by parent after successful save
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pipeline</p>
            <h2 className="text-lg font-semibold text-slate-950">Novo lead</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form id="add-lead-form" onSubmit={handleSubmit} className="flex-1 space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="d-name">Nome *</Label>
              <Input id="d-name" placeholder="João Silva" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="d-email">E-mail *</Label>
              <Input id="d-email" type="email" placeholder="joao@email.com" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="d-phone">Telefone *</Label>
              <Input id="d-phone" placeholder="(11) 99999-9999" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))} required />
            </div>
            <div>
              <Label htmlFor="d-age">Idade</Label>
              <Input id="d-age" type="number" placeholder="30" min={10} max={100} value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="d-goal">Objetivo *</Label>
              <Input id="d-goal" list="d-goal-suggestions" placeholder="Ex: Perda de peso" value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))} required />
              <datalist id="d-goal-suggestions">
                {GOAL_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
              </datalist>
            </div>
            <div>
              <Label htmlFor="d-source">Fonte</Label>
              <select id="d-source" value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="d-value">Valor estimado (R$)</Label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
                <Input id="d-value" type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.estimated_value}
                  onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))}
                  className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="d-followup">Próximo follow-up</Label>
              <Input id="d-followup" type="date" value={form.next_follow_up}
                onChange={(e) => setForm((f) => ({ ...f, next_follow_up: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label htmlFor="d-tag-input">Tags</Label>
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
            <Input id="d-tag-input" placeholder="Ex: musculação — Enter para adicionar"
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
            <Label htmlFor="d-notes">Notas</Label>
            <Textarea id="d-notes" rows={3} placeholder="Observações sobre o lead..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          {/* Hidden inputs to pass tags to parent */}
          <input type="hidden" name="_tags" value={JSON.stringify(tags)} />
          <input type="hidden" name="_form" value={JSON.stringify(form)} />
        </form>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" form="add-lead-form" disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Adicionar lead"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main board ────────────────────────────────────────────────────────────────

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId]
  );

  const filteredLeads = useMemo(
    () => leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (lead.goal ?? "").toLowerCase().includes(search.toLowerCase())
    ),
    [leads, search]
  );

  const grouped = useMemo(
    () => statusMap.reduce(
      (acc, s) => ({ ...acc, [s.key]: filteredLeads.filter((l) => l.status === s.key) }),
      {} as Record<LeadStatus, Lead[]>
    ),
    [filteredLeads]
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const tagsRaw = (formEl.querySelector('input[name="_tags"]') as HTMLInputElement)?.value ?? "[]";
    const formRaw = (formEl.querySelector('input[name="_form"]') as HTMLInputElement)?.value ?? "{}";
    const tags = JSON.parse(tagsRaw) as string[];
    const form = JSON.parse(formRaw) as Record<string, string>;

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
      error: (err: Error) => err.message
    });

    try {
      await promise;
      setDrawerOpen(false);
      router.refresh();
    } catch {
      // error shown by toast
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
      toast.success(`Movido para ${statusMap.find((s) => s.key === status)?.label ?? status}`, { duration: 2000 });
      router.refresh();
    } else {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: l.status } : l)));
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id.toString());
  const handleDragOver = ({ over }: { over: { id: string | number } | null }) =>
    setOverId(over ? over.id.toString() : null);
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    if (!over) return;
    const newStatus = over.id.toString() as LeadStatus;
    if (statusMap.some((s) => s.key === newStatus)) {
      const lead = leads.find((l) => l.id === active.id.toString());
      if (lead && lead.status !== newStatus) updateStatus(active.id.toString(), newStatus);
    }
  };
  const handleDragCancel = () => { setActiveId(null); setOverId(null); };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pipeline</p>
          <h1 className="text-2xl font-semibold text-slate-950">Quadro de vendas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-44 text-sm xl:w-56"
          />
          <Button onClick={() => setDrawerOpen(true)} className="h-9 px-4 text-sm">
            + Novo lead
          </Button>
        </div>
      </div>

      {/* ── Kanban board ────────────────────────────────────────────────────── */}
      <DndContext
        id="pipeline-dnd-board"
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver as any}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-1">
          <div className="flex h-full gap-2.5">
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
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* ── Add lead slide-over ──────────────────────────────────────────────── */}
      <AddLeadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />
    </div>
  );
}
