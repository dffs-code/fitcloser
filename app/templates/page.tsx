import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { TemplateList } from "@/components/TemplateList";
import { AppShell } from "@/components/AppShell";

export default async function TemplatesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [templatesResult, leadsResult, settingsResult] = await Promise.all([
    supabase
      .from("message_templates")
      .select("id,category,title,body")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id,name,email,phone,age,goal,source")
      .eq("trainer_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("business_settings")
      .select("business_name")
      .eq("trainer_id", user.id)
      .single()
  ]);

  return (
    <AppShell>
      <TemplateList
          templates={templatesResult.data ?? []}
          leads={leadsResult.data ?? []}
          trainerName={settingsResult.data?.business_name ?? ""}
        />
    </AppShell>
  );
}
