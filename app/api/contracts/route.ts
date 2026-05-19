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
  const { leadId, title, template, expires_at } = body;

  const { error } = await supabase.from("contracts").insert([
    {
      trainer_id: session.user.id,
      lead_id: leadId,
      title,
      template,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      status: "pending"
    }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
