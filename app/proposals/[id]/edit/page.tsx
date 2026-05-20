import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { EditProposalForm } from "@/components/proposals/EditProposalForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProposalPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("id,lead_id,title,plan,frequency,duration_weeks,price,observations,payment_conditions,leads(name)")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !proposal) redirect("/proposals");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <EditProposalForm
          proposal={{
            id: proposal.id,
            lead_id: proposal.lead_id,
            lead_name: (proposal.leads as any)?.name ?? "Lead desconhecido",
            title: proposal.title,
            plan: proposal.plan,
            frequency: proposal.frequency,
            duration_weeks: proposal.duration_weeks,
            price: proposal.price,
            observations: proposal.observations,
            payment_conditions: proposal.payment_conditions,
          }}
        />
      </div>
    </AppShell>
  );
}
