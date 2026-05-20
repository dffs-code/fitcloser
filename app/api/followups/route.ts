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

    return error
      ? NextResponse.json({ error: error.message }, { status: 400 })
      : NextResponse.json({ success: true });
  }

  if (action === "complete" && id) {
    const { error } = await supabase
      .from("follow_ups")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("trainer_id", user.id);

    return error
      ? NextResponse.json({ error: error.message }, { status: 400 })
      : NextResponse.json({ success: true });
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
