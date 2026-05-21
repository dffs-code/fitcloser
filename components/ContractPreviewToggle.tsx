"use client";

import { useState, Fragment } from "react";

type Props = {
  template: string;
  vars: Record<string, string>;
};

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

export function ContractPreviewToggle({ template, vars }: Props) {
  const [filled, setFilled] = useState(false);

  const hasAnyVar = /\{\{\w+\}\}/.test(template);
  const resolved = substituteVars(template, vars);
  const remaining = (resolved.match(/\{\{\w+\}\}/g) ?? []).length;
  const total = (template.match(/\{\{\w+\}\}/g) ?? []).length;
  const filled_count = total - remaining;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        {hasAnyVar && (
          <button
            onClick={() => setFilled((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              filled
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {filled ? (
                <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>
              ) : (
                <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></>
              )}
            </svg>
            {filled ? "Ver original" : "Preencher variáveis"}
          </button>
        )}

        {/* Variable status pills */}
        {filled && hasAnyVar && (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            remaining === 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {remaining === 0
              ? `✓ Todas as ${total} variáveis preenchidas`
              : `${filled_count} de ${total} variáveis preenchidas · ${remaining} pendente${remaining > 1 ? "s" : ""}`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-5">
        {filled ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
            {renderFilled(template, vars)}
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
            {template}
          </pre>
        )}
      </div>

      {/* Hint for pending vars */}
      {filled && remaining > 0 && (
        <p className="text-xs text-amber-600">
          Variáveis em destaque precisam ser preenchidas manualmente no texto do contrato.
        </p>
      )}
    </div>
  );
}
