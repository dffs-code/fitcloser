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
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName }
      }
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Verifique seu e-mail para o link de confirmação e volte para o login.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="accent">Venda de forma mais inteligente</Badge>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Crie sua conta no FitCloser</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Configure seu CRM e área de propostas em minutos.</p>
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
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p> : null}
          </div>
          {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Já tem conta? <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">Entrar</Link>
        </div>
      </Card>
    </main>
  );
}
