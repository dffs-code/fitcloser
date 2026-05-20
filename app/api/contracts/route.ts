import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, id, leadId, title, template, expires_at } = body;

  if (action === "update" && id) {
    const { error } = await supabase
      .from("contracts")
      .update({ title, template, expires_at: expires_at ? new Date(expires_at).toISOString() : null })
      .eq("id", id)
      .eq("trainer_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activities").insert([
      { trainer_id: user.id, lead_id: leadId ?? null, description: `Contrato atualizado: ${title}` }
    ]);

    return NextResponse.json({ success: true });
  }

  // create
  const { error } = await supabase.from("contracts").insert([
    {
      trainer_id: user.id,
      lead_id: leadId,
      title,
      template,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      status: "pending"
    }
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activities").insert([
    { trainer_id: user.id, lead_id: leadId ?? null, description: `Contrato criado: ${title}` }
  ]);

  return NextResponse.json({ success: true });
}
