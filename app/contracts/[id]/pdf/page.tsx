import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ContractPrintButton } from "@/components/ContractPrintButton";

type Props = { params: Promise<{ id: string }> };

function substituteVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export default async function ContractPdfPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id,title,template,status,expires_at,created_at,lead_id,trainer_id")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !contract) redirect("/contracts");

  // Fetch lead data
  let leadName = "";
  let leadEmail = "";
  if (contract.lead_id) {
    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("name,email")
      .eq("id", contract.lead_id)
      .single();
    leadName = lead?.name ?? "";
    leadEmail = lead?.email ?? "";
  }

  // Fetch trainer business settings
  const { data: settings } = await supabaseAdmin
    .from("business_settings")
    .select("business_name,contact_email,phone,logo_url")
    .eq("trainer_id", contract.trainer_id)
    .single();

  const businessName = settings?.business_name ?? "Personal Trainer";
  const businessEmail = settings?.contact_email ?? user.email ?? "";
  const logoUrl = settings?.logo_url ?? "/fitcloser.svg";

  const body = substituteVars(contract.template ?? "", {
    nome: leadName,
    treinador: businessName,
    data: new Date(contract.created_at).toLocaleDateString("pt-BR"),
  });

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const isSigned = contract.status === "signed";

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 18mm 20mm; size: A4; }
          body { background: white !important; background-image: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body { background: #f1f5f9; }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/fitcloser.svg" alt="FitCloser" className="h-6 w-6" />
          <span className="text-sm font-semibold text-slate-800">FitCloser</span>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500">{contract.title}</span>
        </div>
        <ContractPrintButton />
      </div>

      {/* Page wrapper */}
      <div className="min-h-screen px-4 py-8 print:p-0 print:m-0">
        {/* A4 document */}
        <div
          className="mx-auto w-full max-w-[794px] bg-white shadow-2xl print:shadow-none print:max-w-none"
          style={{ minHeight: "1123px" }}
        >
          <div className="flex flex-col" style={{ minHeight: "1123px", padding: "48px 56px" }}>

            {/* ── HEADER ── */}
            <div className="flex items-start justify-between gap-8 pb-6" style={{ borderBottom: "2px solid #e2e8f0" }}>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="h-12 w-12 rounded-xl object-contain"
                />
                <div>
                  <p className="text-lg font-bold text-slate-900">{businessName}</p>
                  <p className="text-xs text-slate-400">Personal Training</p>
                </div>
              </div>
              <div className="text-right">
                {businessEmail && <p className="text-xs text-slate-500">{businessEmail}</p>}
                {settings?.phone && <p className="text-xs text-slate-500">{settings.phone}</p>}
                <p className="mt-1 text-xs text-slate-400">Emitido em {today}</p>
              </div>
            </div>

            {/* ── TITLE SECTION ── */}
            <div className="py-8 text-center">
              <p
                className="text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: "#6366f1" }}
              >
                Contrato de Serviço
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">{contract.title}</h1>

              <div className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-x-8 gap-y-1 text-sm text-slate-500">
                {leadName && (
                  <span>Cliente: <strong className="text-slate-700">{leadName}</strong></span>
                )}
                <span>Data: <strong className="text-slate-700">{new Date(contract.created_at).toLocaleDateString("pt-BR")}</strong></span>
                {contract.expires_at && (
                  <span>Vence: <strong className="text-slate-700">{new Date(contract.expires_at).toLocaleDateString("pt-BR")}</strong></span>
                )}
              </div>

              {isSigned && (
                <div
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                  style={{ background: "#d1fae5", color: "#065f46" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Assinado digitalmente pelo cliente
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(to right, #e2e8f0, #c7d2fe, #e2e8f0)" }} />

            {/* ── CONTRACT BODY ── */}
            <div className="flex-1 py-8">
              <pre
                className="whitespace-pre-wrap font-sans text-sm text-slate-700"
                style={{ lineHeight: "1.8", textAlign: "justify" }}
              >
                {body}
              </pre>
            </div>

            {/* ── SIGNATURE SECTION ── */}
            <div className="mt-auto pt-10" style={{ borderTop: "1px solid #e2e8f0" }}>
              <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Assinaturas
              </p>
              <div className="grid grid-cols-2 gap-12">
                {/* Trainer */}
                <div>
                  <div style={{ height: "1px", background: "#94a3b8" }} />
                  <p className="mt-2 text-sm font-semibold text-slate-800">{businessName}</p>
                  <p className="text-xs text-slate-500">Treinador</p>
                  <p className="mt-3 text-xs text-slate-400">Data: ____/____/________</p>
                </div>
                {/* Client */}
                <div>
                  <div style={{ height: "1px", background: isSigned ? "#10b981" : "#94a3b8" }} />
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {leadName || "Cliente"}
                    {isSigned && (
                      <span
                        className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#d1fae5", color: "#065f46" }}
                      >
                        ✓ Assinado
                      </span>
                    )}
                  </p>
                  {leadEmail && <p className="text-xs text-slate-500">{leadEmail}</p>}
                  <p className="mt-3 text-xs text-slate-400">
                    {isSigned ? "Assinatura digital registrada" : "Data: ____/____/________"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-[10px] text-slate-300">
                Documento gerado via FitCloser · fitcloser.app
              </p>
              <p className="text-[10px] text-slate-300">
                ID: {contract.id}
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
