import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("follow_ups")
    .select("id,note,due_at,completed,lead_id,leads(name)")
    .eq("trainer_id", user.id)
    .order("due_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

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
  const { action, id, leadId, note, due_at } = body;

  if (action === "create") {
    if (!note || !due_at) {
      return NextResponse.json({ error: "note and due_at are required." }, { status: 400 });
    }

    const { error } = await supabase.from("follow_ups").insert([
      {
        trainer_id: user.id,
        lead_id: leadId ?? null,
        note,
        due_at: new Date(due_at).toISOString(),
        completed: false
      }
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Build activity description with lead name if available
    let activityDescription = `Follow-up agendado: ${note}`;
    if (leadId) {
      const { data: lead } = await supabase
        .from("leads")
        .select("name")
        .eq("id", leadId)
        .single();
      if (lead?.name) {
        activityDescription = `Follow-up agendado para ${lead.name}: ${note}`;
      }
    }

    await supabase.from("activities").insert([
      {
        trainer_id: user.id,
        lead_id: leadId ?? null,
        description: activityDescription
      }
    ]);

    return NextResponse.json({ success: true });
  }

  if (action === "complete" && id) {
    // Fetch the follow-up first so we can log it
    const { data: followUp } = await supabase
      .from("follow_ups")
      .select("note,lead_id")
      .eq("id", id)
      .eq("trainer_id", user.id)
      .single();

    const { error } = await supabase
      .from("follow_ups")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("trainer_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (followUp) {
      let activityDescription = `Follow-up concluído: ${followUp.note}`;
      if (followUp.lead_id) {
        const { data: lead } = await supabase
          .from("leads")
          .select("name")
          .eq("id", followUp.lead_id)
          .single();
        if (lead?.name) {
          activityDescription = `Follow-up concluído para ${lead.name}: ${followUp.note}`;
        }
      }

      await supabase.from("activities").insert([
        {
          trainer_id: user.id,
          lead_id: followUp.lead_id ?? null,
          description: activityDescription
        }
      ]);
    }

    return NextResponse.json({ success: true });
  }

  if (action === "delete" && id) {
    const { error } = await supabase
      .from("follow_ups")
      .delete()
      .eq("id", id)
      .eq("trainer_id", user.id);

    return error
      ? NextResponse.json({ error: error.message }, { status: 400 })
      : NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
