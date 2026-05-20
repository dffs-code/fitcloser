import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { EditContractForm } from "@/components/contracts/EditContractForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditContractPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id,lead_id,title,template,expires_at,leads(name)")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !contract) redirect("/contracts");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <EditContractForm
          contract={{
            id: contract.id,
            lead_id: contract.lead_id,
            lead_name: (contract.leads as any)?.name ?? "Lead desconhecido",
            title: contract.title,
            template: contract.template,
            expires_at: contract.expires_at,
          }}
        />
      </div>
    </AppShell>
  );
}
