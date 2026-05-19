import { supabaseAdmin } from "@/lib/supabase-admin";
import { PublicProposalPage } from "@/components/PublicProposalPage";

type Props = {
  params: {
    token: string;
  };
};

export default async function PublicProposalDetail({ params }: Props) {
  const { data: proposal } = await supabaseAdmin
    .from("proposals")
    .select("token,title,plan,frequency,duration_weeks,price,observations,payment_conditions,status,leads(name)")
    .eq("token", params.token)
    .single();

  return (
    <PublicProposalPage
      proposal={
        proposal
          ? {
              token: proposal.token,
              title: proposal.title,
              plan: proposal.plan,
              frequency: proposal.frequency,
              duration_weeks: proposal.duration_weeks,
              price: proposal.price,
              observations: proposal.observations,
              payment_conditions: proposal.payment_conditions,
              status: proposal.status,
              lead_name: proposal.leads?.name ?? "cliente"
            }
          : null
      }
    />
  );
}
