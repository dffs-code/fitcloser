"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSupabaseClient } from "@/components/SupabaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

const criteria = [
  { label: "Mínimo de 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Letra minúscula (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Número (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "Caractere especial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) }
];

export default function RegisterPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password", "");

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
        <Card className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Conta criada!</h1>
            <p className="text-sm text-slate-600">
              Verifique seu e-mail para confirmar o cadastro e depois faça login.
            </p>
          </div>
          <Link href="/login">
            <Button className="w-full">Ir para o login</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="accent">Venda de forma mais inteligente</Badge>
          <h1 className="text-3xl font-semibold text-slate-900">Crie sua conta no FitCloser</h1>
          <p className="text-sm text-slate-600">Configure seu CRM e área de propostas em minutos.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName ? <p className="mt-2 text-sm text-rose-600">{errors.fullName.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p> : null}
            {/* Password criteria */}
            <ul className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              {criteria.map((c) => {
                const met = c.test(passwordValue);
                return (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    <span className={met ? "text-emerald-500" : "text-slate-400"}>
                      {met ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </span>
                    <span className={met ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword ? <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword.message}</p> : null}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <div className="text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Entrar
          </Link>
        </div>
      </Card>
    </main>
  );
}
