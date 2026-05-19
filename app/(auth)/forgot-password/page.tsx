"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useSupabaseClient } from "@/components/SupabaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { z } from "zod";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setErrorMessage(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Verifique sua caixa de entrada para instruções de recuperação de senha.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="accent">Redefinir senha</Badge>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Esqueceu sua senha?</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Digite seu e-mail e enviaremos um link para redefini-la.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>
          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
          {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar e-mail de recuperação"}
          </Button>
        </form>
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Lembrou? <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300">Entrar</Link>
        </div>
      </Card>
    </main>
  );
}
