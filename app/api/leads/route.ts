import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

const statusLabels: Record<string, string> = {
  "New Lead": "Novo lead",
  "Contacted": "Contatado",
  "Evaluation Scheduled": "Avaliação agendada",
  "Proposal Sent": "Proposta enviada",
  "Negotiation": "Negociação",
  "Closed Won": "Fechado ganho",
  "Closed Lost": "Perdido"
};

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, leadId, status, name, email, phone, age, goal, source, tags, notes, estimated_value, next_follow_up } = body;

  if (action === "create") {
    const { data: lead, error } = await supabase
      .from("leads")
      .insert([
        {
          trainer_id: user.id,
          name,
          email,
          phone,
          age: age ? Number(age) : null,
          goal,
          source,
          status: "New Lead",
          tags: Array.isArray(tags) ? tags : [],
          notes: notes ?? "",
          estimated_value: estimated_value ? Number(estimated_value) : null,
          next_follow_up: next_follow_up || null
        }
      ])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("activities").insert([
      {
        trainer_id: user.id,
        lead_id: lead.id,
        description: `Novo lead adicionado: ${name}`
      }
    ]);

    return NextResponse.json({ success: true, id: lead.id });
  }

  if (action === "update" && leadId) {
    const { error } = await supabase
      .from("leads")
      .update({
        name,
        email,
        phone,
        age: age ? Number(age) : null,
        goal,
        source,
        status,
        tags: Array.isArray(tags) ? tags : [],
        notes: notes ?? "",
        estimated_value: estimated_value ? Number(estimated_value) : null,
        next_follow_up: next_follow_up || null
      })
      .eq("id", leadId)
      .eq("trainer_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("activities").insert([
      { trainer_id: user.id, lead_id: leadId, description: `Lead atualizado: ${name}` }
    ]);

    return NextResponse.json({ success: true });
  }

  if (action === "update-status" && leadId && status) {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", leadId)
      .eq("trainer_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("activities").insert([
      {
        trainer_id: user.id,
        lead_id: leadId,
        description: `Lead movido para: ${statusLabels[status] ?? status}`
      }
    ]);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
