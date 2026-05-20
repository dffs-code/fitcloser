import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Navigation } from "@/components/Navigation";
import { FollowUpBoard } from "@/components/FollowUpBoard";

export default async function FollowupsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [followupsResult, leadsResult] = await Promise.all([
    supabase
      .from("follow_ups")
      .select("id,note,due_at,completed,lead_id,leads(name)")
      .eq("trainer_id", user.id)
      .order("due_at", { ascending: true }),
    supabase
      .from("leads")
      .select("id,name")
      .eq("trainer_id", user.id)
      .order("name", { ascending: true })
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Lembretes</p>
            <h1 className="text-3xl font-semibold text-slate-950">Follow-ups</h1>
          </div>
          <FollowUpBoard
            initialFollowups={(followupsResult.data ?? []) as any}
            leads={leadsResult.data ?? []}
          />
        </div>
      </div>
    </div>
  );
}
