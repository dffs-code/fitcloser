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
  const { business_name, contact_email, phone, brand_color, logo_url } = body;
  const trainerId = session.user.id;

  const { error } = await supabase
    .from("business_settings")
    .upsert([
      {
        trainer_id: trainerId,
        business_name,
        contact_email,
        phone,
        brand_color,
        logo_url
      }
    ], { onConflict: ["trainer_id"] });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
