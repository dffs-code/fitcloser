import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { Navigation } from "@/components/Navigation";
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div>
          <PipelineBoard initialLeads={(leads ?? []) as Lead[]} />
        </div>
      </div>
    </div>
  );
}
