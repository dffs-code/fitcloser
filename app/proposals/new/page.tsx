import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { NewProposalForm } from "@/components/proposals/NewProposalForm";

export default async function NewProposalPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("id,name,email")
    .eq("trainer_id", user.id)
    .order("name", { ascending: true });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
          <NewProposalForm leads={leads ?? []} />
        </div>
    </AppShell>
  );
}
