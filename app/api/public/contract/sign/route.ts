import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  if (!id) return NextResponse.json({ error: "ID do contrato ausente." }, { status: 400 });

  const { data: contract, error: fetchError } = await supabaseAdmin
    .from("contracts")
    .select("id, status, trainer_id, lead_id")
    .eq("id", id)
    .single();

  if (fetchError || !contract) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  if (contract.status === "signed") {
    return NextResponse.json({ error: "Contrato já assinado." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contracts")
    .update({ status: "signed" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (contract.lead_id) {
    await Promise.all([
      supabaseAdmin
        .from("leads")
        .update({ status: "Closed Won" })
        .eq("id", contract.lead_id),
      supabaseAdmin.from("activities").insert([{
        trainer_id: contract.trainer_id,
        lead_id: contract.lead_id,
        description: "Contrato assinado — lead movido para Fechado ganho",
      }]),
    ]);
  } else {
    await supabaseAdmin.from("activities").insert([{
      trainer_id: contract.trainer_id,
      lead_id: null,
      description: "Contrato assinado pelo cliente",
    }]);
  }

  return NextResponse.json({ success: true });
}
