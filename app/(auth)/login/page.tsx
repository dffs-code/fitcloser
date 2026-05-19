"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSupabaseClient } from "@/components/SupabaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({password: values.password, email: values.email });
    if (!error) {
      // aguarda a sessão ser estabelecida no cliente (e no cookie)
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      router.push("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="accent">Bem-vindo de volta</Badge>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Entrar no FitCloser</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Acesso seguro aos seus leads, propostas, contratos e follow-ups.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p> : null}
          </div>
          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <Link href="/forgot-password" className="transition hover:text-slate-900 dark:hover:text-white">
            Esqueceu a senha?
          </Link>
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">
            Criar conta
          </Link>
        </div>
      </Card>
    </main>
  );
}
