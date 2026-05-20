import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  const { data: proposal, error: fetchError } = await supabaseAdmin
    .from("proposals")
    .select("id, lead_id")
    .eq("token", token)
    .single();

  if (fetchError || !proposal) {
    return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  }

  const { error: acceptError } = await supabaseAdmin
    .from("proposals")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("token", token);

  if (acceptError) {
    return NextResponse.json({ error: acceptError.message }, { status: 400 });
  }

  if (proposal.lead_id) {
    await supabaseAdmin
      .from("leads")
      .update({ status: "Closed Won" })
      .eq("id", proposal.lead_id);
  }

  return NextResponse.json({ success: true });
}
