import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AppShell } from "@/components/AppShell";
import type { Lead } from "@/types";

export default async function PipelinePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id,name,email,phone,age,goal,source,status,tags,notes,next_follow_up,estimated_value,created_at")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <AppShell>
      <PipelineBoard initialLeads={(leads ?? []) as Lead[]} />
    </AppShell>
  );
}
