import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { NewContractForm } from "@/components/contracts/NewContractForm";

export default async function NewContractPage() {
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
          <NewContractForm leads={leads ?? []} />
        </div>
    </AppShell>
  );
}
