import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { TemplateList } from "@/components/TemplateList";
import { Navigation } from "@/components/Navigation";

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <TemplateList
          templates={templatesResult.data ?? []}
          leads={leadsResult.data ?? []}
          trainerName={settingsResult.data?.business_name ?? ""}
        />
      </div>
    </div>
  );
}
