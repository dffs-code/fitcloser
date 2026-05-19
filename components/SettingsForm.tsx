"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const settingsSchema = z.object({
  business_name: z.string().min(2, { message: "Informe o nome do seu negócio." }),
  contact_email: z.string().email({ message: "Informe um e-mail válido." }),
  phone: z.string().min(7, { message: "Informe um telefone." }),
  brand_color: z.string().min(4, { message: "Escolha uma cor de marca." }),
  logo_url: z.string().url({ message: "Informe uma URL de logo válida." }).optional()
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function SettingsForm({ data }: { data: Partial<SettingsValues> }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_name: data.business_name ?? "FitCloser Studio",
      contact_email: data.contact_email ?? "hello@fitcloser.com",
      phone: data.phone ?? "",
      brand_color: data.brand_color ?? "#3b82f6",
      logo_url: data.logo_url ?? ""
    }
  });

  const onSubmit = async (values: SettingsValues) => {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    setLoading(false);

    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error || "Não foi possível salvar as configurações.");
      return;
    }

    setMessage("Configurações salvas.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow dark:border-slate-800 dark:bg-slate-950/90">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Configurações</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Identidade e contato</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="business_name">Nome do negócio</Label>
          <Input id="business_name" {...register("business_name")} />
          {errors.business_name ? <p className="mt-2 text-sm text-rose-600">{errors.business_name.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="contact_email">E-mail de contato</Label>
          <Input id="contact_email" type="email" {...register("contact_email")} />
          {errors.contact_email ? <p className="mt-2 text-sm text-rose-600">{errors.contact_email.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone comercial</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone ? <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="brand_color">Cor da marca</Label>
          <Input id="brand_color" type="color" {...register("brand_color")} className="h-12 rounded-2xl px-3 py-2" />
          {errors.brand_color ? <p className="mt-2 text-sm text-rose-600">{errors.brand_color.message}</p> : null}
        </div>
      </div>
      <div>
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input id="logo_url" {...register("logo_url")} />
        {errors.logo_url ? <p className="mt-2 text-sm text-rose-600">{errors.logo_url.message}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">Salve sua identidade empresarial para cabeçalhos de propostas e contratos.</div>
        <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar configurações"}</Button>
      </div>
      {message ? <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p> : null}
    </form>
  );
}
