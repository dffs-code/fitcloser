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
import toast from "react-hot-toast";
import type { z } from "zod";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`
    });

    setLoading(false);

    if (error) {
      toast.error("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
        <Card className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3c5dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">E-mail enviado!</h1>
            <p className="text-sm text-slate-600">
              Enviamos um link de recuperação para{" "}
              <span className="font-medium text-slate-800">{getValues("email")}</span>.
              Verifique sua caixa de entrada (e o spam).
            </p>
          </div>
          <Link href="/login">
            <Button variant="secondary" className="w-full">Voltar ao login</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),#f8fbff] px-6 py-10">
      <Card className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Badge variant="accent">Redefinir senha</Badge>
          <h1 className="text-3xl font-semibold text-slate-900">Esqueceu sua senha?</h1>
          <p className="text-sm text-slate-600">
            Digite seu e-mail e enviaremos um link para redefini-la.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar e-mail de recuperação"}
          </Button>
        </form>
        <div className="text-center text-sm text-slate-600">
          Lembrou?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Entrar
          </Link>
        </div>
      </Card>
    </main>
  );
}
