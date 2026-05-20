import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

const ADVANCEABLE_TO_PROPOSAL_SENT = ["New Lead", "Contacted", "Evaluation Scheduled"];

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, id, leadId, title, plan, frequency, duration_weeks, price, observations, payment_conditions } = body;

  if (action === "update" && id) {
    const { error } = await supabase
      .from("proposals")
      .update({ title, plan, frequency, duration_weeks: Number(duration_weeks), price: Number(price), observations, payment_conditions })
      .eq("id", id)
      .eq("trainer_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activities").insert([
      { trainer_id: user.id, lead_id: leadId ?? null, description: `Proposta atualizada: ${title}` }
    ]);

    return NextResponse.json({ success: true });
  }

  // create
  const token = crypto.randomUUID();

  const { error } = await supabase.from("proposals").insert([
    {
      trainer_id: user.id,
      lead_id: leadId,
      title,
      plan,
      frequency,
      duration_weeks: Number(duration_weeks),
      price: Number(price),
      observations,
      payment_conditions,
      status: "draft",
      token
    }
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activities").insert([
    { trainer_id: user.id, lead_id: leadId ?? null, description: `Proposta criada: ${title}` }
  ]);

  if (leadId) {
    const { data: lead } = await supabase.from("leads").select("status").eq("id", leadId).eq("trainer_id", user.id).single();
    if (lead && ADVANCEABLE_TO_PROPOSAL_SENT.includes(lead.status)) {
      await supabase.from("leads").update({ status: "Proposal Sent" }).eq("id", leadId).eq("trainer_id", user.id);
      await supabase.from("activities").insert([
        { trainer_id: user.id, lead_id: leadId, description: "Lead movido para: Proposta enviada" }
      ]);
    }
  }

  return NextResponse.json({ success: true });
}
