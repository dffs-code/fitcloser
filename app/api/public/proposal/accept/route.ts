import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token } = body;

  const { error } = await supabaseAdmin
    .from("proposals")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
