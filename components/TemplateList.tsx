"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Template = {
  id: string;
  category: string;
  title: string;
  body: string;
};

export function TemplateList({ templates }: { templates: Template[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (template: Template) => {
    await navigator.clipboard.writeText(template.body);
    setCopied(template.id);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((template) => (
        <Card key={template.id} className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{template.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{template.title}</h3>
            </div>
            <Badge variant="accent">Modelo</Badge>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-line">{template.body}</p>
          <Button type="button" onClick={() => handleCopy(template)}>{copied === template.id ? "Copiado" : "Copiar mensagem"}</Button>
        </Card>
      ))}
    </div>
  );
}
