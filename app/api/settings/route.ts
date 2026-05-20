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
  const { business_name, contact_email, phone, brand_color, logo_url } = body;

  const { error } = await supabase
    .from("business_settings")
    .upsert(
      [
        {
          trainer_id: user.id,
          business_name,
          contact_email,
          phone,
          brand_color,
          logo_url
        }
      ],
      { onConflict: "trainer_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
