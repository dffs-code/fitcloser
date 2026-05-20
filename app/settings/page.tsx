import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { SettingsForm } from "@/components/SettingsForm";
import { AppShell } from "@/components/AppShell";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase.from("business_settings").select("business_name,contact_email,phone,brand_color,logo_url").eq("trainer_id", user.id).single();

  return (
    <AppShell>
      <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Configurações</p>
            <h1 className="text-3xl font-semibold text-slate-950">Negócio e identidade</h1>
          </div>
          <SettingsForm data={data ?? {}} />
        </div>
    </AppShell>
  );
}
