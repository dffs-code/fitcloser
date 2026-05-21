"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type ContractData = {
  id: string;
  title: string;
  body: string;
  status: string;
  lead_name: string;
  expires_at: string | null;
  created_at: string;
};

export function PublicContractPage({ contract }: { contract: ContractData | null }) {
  const [status, setStatus] = useState(contract?.status ?? "");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!contract) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Contrato não encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">O link pode ser inválido ou o contrato foi removido.</p>
        </div>
      </main>
    );
  }

  const handleSign = async () => {
    setLoading(true);
    const promise = fetch("/api/public/contract/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contract.id }),
    }).then(async (res) => {
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao assinar."); }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Registrando assinatura...",
      success: "Contrato assinado com sucesso!",
      error: (e) => e.message,
    });

    try {
      await promise;
      setStatus("signed");
      setConfirming(false);
    } catch {
      // shown by toast
    } finally {
      setLoading(false);
    }
  };

  const isSigned = status === "signed";

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-100 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/fitcloser.svg" alt="FitCloser" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-indigo-700">FitCloser</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSigned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {isSigned ? "✓ Assinado" : "Aguardando assinatura"}
          </span>
        </div>

        {/* Document card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Doc header */}
          <div className="border-b border-slate-100 bg-slate-50 px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">Contrato de serviço</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{contract.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>Cliente: <span className="font-medium text-slate-700">{contract.lead_name}</span></span>
              <span>Emitido em: <span className="font-medium text-slate-700">{new Date(contract.created_at).toLocaleDateString("pt-BR")}</span></span>
              {contract.expires_at && (
                <span>Vence em: <span className="font-medium text-slate-700">{new Date(contract.expires_at).toLocaleDateString("pt-BR")}</span></span>
              )}
            </div>
          </div>

          {/* Contract body */}
          <div className="px-8 py-8">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{contract.body}</pre>
          </div>

          {/* Signature area */}
          {isSigned && (
            <div className="mx-8 mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Contrato assinado digitalmente</p>
                  <p className="text-xs text-emerald-600">Assinatura registrada por {contract.lead_name}. Guarde este link para seus registros.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign flow */}
        {!isSigned && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {!confirming ? (
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Pronto para assinar?</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ao assinar, você confirma que leu e concorda com todos os termos acima.
                  </p>
                </div>
                <button
                  onClick={() => setConfirming(true)}
                  className="shrink-0 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Assinar contrato
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="font-medium text-slate-900">Confirmar assinatura digital</p>
                <p className="max-w-sm text-sm text-slate-500">
                  Ao confirmar, você registra sua concordância com os termos do contrato acima como <strong>{contract.lead_name}</strong>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={loading}
                    className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {loading ? "Registrando..." : "Confirmar assinatura"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Documento gerado via FitCloser · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
