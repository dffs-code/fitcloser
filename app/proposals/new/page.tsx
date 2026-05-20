import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Navigation } from "@/components/Navigation";
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto w-full max-w-4xl">
          <NewProposalForm leads={leads ?? []} />
        </div>
      </div>
    </main>
  );
}
