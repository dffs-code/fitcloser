import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, leadId, status, name, email, phone, age, goal, source, estimated_value, next_follow_up } = body;

  if (action === "create") {
    const { error } = await supabase.from("leads").insert([
      {
        trainer_id: session.user.id,
        name,
        email,
        phone,
        age: age ? Number(age) : null,
        goal,
        source,
        status: "New Lead",
        tags: [],
        notes: "",
        estimated_value: estimated_value ? Number(estimated_value) : null,
        next_follow_up: next_follow_up || null
      }
    ]);

    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
  }

  if (action === "update-status" && leadId && status) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", leadId).eq("trainer_id", session.user.id);

    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
