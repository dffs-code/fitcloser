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
    .select("token,title,plan,frequency,duration_weeks,price,observations,payment_conditions,status,viewed_at,leads(name)")
    .eq("token", params.token)
    .single();

  if (proposal && !proposal.viewed_at) {
    const statusUpdate =
      proposal.status === "sent" || proposal.status === "draft"
        ? { viewed_at: new Date().toISOString(), status: "viewed" }
        : { viewed_at: new Date().toISOString() };

    await supabaseAdmin
      .from("proposals")
      .update(statusUpdate)
      .eq("token", params.token);
  }

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
              status: proposal.viewed_at ? proposal.status : proposal.status === "sent" || proposal.status === "draft" ? "viewed" : proposal.status,
              lead_name: proposal.leads?.name ?? "cliente"
            }
          : null
      }
    />
  );
}
