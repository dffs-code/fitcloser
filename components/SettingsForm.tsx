"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const settingsSchema = z.object({
  business_name: z.string().min(2, { message: "Informe o nome do seu negócio." }),
  contact_email: z.string().email({ message: "Informe um e-mail válido." }),
  phone: z.string().min(7, { message: "Informe um telefone." }),
  brand_color: z.string().min(4, { message: "Escolha uma cor de marca." }),
  logo_url: z
    .string()
    .url({ message: "Informe uma URL de logo válida." })
    .optional()
    .or(z.literal(""))
});

type SettingsValues = z.infer<typeof settingsSchema>;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function SettingsForm({ data }: { data: Partial<SettingsValues> }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_name: data.business_name ?? "",
      contact_email: data.contact_email ?? "",
      phone: data.phone ?? "",
      brand_color: data.brand_color ?? "#3b82f6",
      logo_url: data.logo_url ?? ""
    }
  });

  const brandColor = watch("brand_color");
  const logoUrl = watch("logo_url");

  const onSubmit = async (values: SettingsValues) => {
    setLoading(true);

    const promise = fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    }).then(async (res) => {
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Não foi possível salvar as configurações.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Salvando configurações...",
      success: "Configurações salvas!",
      error: (err) => err.message
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Configurações</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Identidade e contato</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="business_name">Nome do negócio *</Label>
          <Input
            id="business_name"
            placeholder="Ex: João Silva Personal"
            {...register("business_name")}
          />
          {errors.business_name ? (
            <p className="mt-2 text-sm text-rose-600">{errors.business_name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="contact_email">E-mail de contato *</Label>
          <Input
            id="contact_email"
            type="email"
            placeholder="contato@seusite.com.br"
            {...register("contact_email")}
          />
          {errors.contact_email ? (
            <p className="mt-2 text-sm text-rose-600">{errors.contact_email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone comercial *</Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            {...register("phone", {
              onChange: (e) => {
                setValue("phone", formatPhone(e.target.value), { shouldValidate: true });
              }
            })}
          />
          {errors.phone ? (
            <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="brand_color">Cor da marca</Label>
          <div className="mt-1 flex items-center gap-3">
            <div
              className="h-10 w-10 flex-shrink-0 rounded-2xl border border-slate-200 shadow-sm"
              style={{ backgroundColor: brandColor }}
            />
            <Input
              id="brand_color"
              type="color"
              {...register("brand_color")}
              className="h-10 flex-1 rounded-2xl px-3 py-1"
            />
          </div>
          {errors.brand_color ? (
            <p className="mt-2 text-sm text-rose-600">{errors.brand_color.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          placeholder="https://seusite.com/logo.png"
          {...register("logo_url")}
        />
        {errors.logo_url ? (
          <p className="mt-2 text-sm text-rose-600">{errors.logo_url.message}</p>
        ) : null}
        {logoUrl && !errors.logo_url ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <img
              src={logoUrl}
              alt="Prévia do logo"
              className="h-10 max-w-[8rem] object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-xs text-slate-500">Prévia do logo</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Identidade usada em cabeçalhos de propostas e contratos.
        </p>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
