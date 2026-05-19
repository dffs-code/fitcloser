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
  const { leadId, title, plan, frequency, duration_weeks, price, observations, payment_conditions } = body;

  const token = crypto.randomUUID();

  const { error } = await supabase.from("proposals").insert([
    {
      trainer_id: session.user.id,
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
