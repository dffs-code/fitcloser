import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

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
  const { category, title, template_body } = body;

  if (!category || !title || !template_body) {
    return NextResponse.json({ error: "category, title e body são obrigatórios." }, { status: 400 });
  }

  const { error } = await supabase.from("message_templates").insert([
    {
      trainer_id: user.id,
      category,
      title,
      body: template_body
    }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
