import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { SettingsForm } from "@/components/SettingsForm";
import { Navigation } from "@/components/Navigation";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase.from("business_settings").select("business_name,contact_email,phone,brand_color,logo_url").eq("trainer_id", user.id).single();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Configurações</p>
            <h1 className="text-3xl font-semibold text-slate-950">Negócio e identidade</h1>
          </div>
          <SettingsForm data={data ?? {}} />
        </div>
      </div>
    </div>
  );
}
