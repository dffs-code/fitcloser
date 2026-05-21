import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { NewContractForm } from "@/components/contracts/NewContractForm";

export default async function NewContractPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: leads }, { data: settings }] = await Promise.all([
    supabase
      .from("leads")
      .select("id,name,email,phone,goal")
      .eq("trainer_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("business_settings")
      .select("business_name")
      .eq("trainer_id", user.id)
      .single(),
  ]);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <NewContractForm
          leads={leads ?? []}
          businessName={settings?.business_name ?? ""}
        />
      </div>
    </AppShell>
  );
}
