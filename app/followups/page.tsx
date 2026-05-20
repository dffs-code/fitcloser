import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
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
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <div className="shrink-0">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Lembretes</p>
          <h1 className="text-2xl font-semibold text-slate-950">Follow-ups</h1>
        </div>
        <div className="min-h-0 flex-1">
          <FollowUpBoard
            initialFollowups={(followupsResult.data ?? []) as any}
            leads={leadsResult.data ?? []}
          />
        </div>
      </div>
    </AppShell>
  );
}
