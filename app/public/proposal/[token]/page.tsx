import { supabaseAdmin } from "@/lib/supabase-admin";
import { PublicProposalPage } from "@/components/PublicProposalPage";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PublicProposalDetail({ params }: Props) {
  const { token } = await params;

  const { data: proposal, error } = await supabaseAdmin
    .from("proposals")
    .select("id,token,title,plan,frequency,duration_weeks,price,observations,payment_conditions,status,viewed_at,lead_id")
    .eq("token", token)
    .single();

  if (error || !proposal) {
    return <PublicProposalPage proposal={null} />;
  }

  // Fetch lead name separately to avoid FK join ambiguity that can break the whole query
  let leadName = "cliente";
  if (proposal.lead_id) {
    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("name")
      .eq("id", proposal.lead_id)
      .single();
    if (lead?.name) leadName = lead.name;
  }

  if (!proposal.viewed_at) {
    const statusUpdate =
      proposal.status === "sent" || proposal.status === "draft"
        ? { viewed_at: new Date().toISOString(), status: "viewed" }
        : { viewed_at: new Date().toISOString() };

    await supabaseAdmin.from("proposals").update(statusUpdate).eq("token", token);
  }

  return (
    <PublicProposalPage
      proposal={{
        token: proposal.token,
        title: proposal.title,
        plan: proposal.plan,
        frequency: proposal.frequency,
        duration_weeks: proposal.duration_weeks,
        price: proposal.price,
        observations: proposal.observations ?? "",
        payment_conditions: proposal.payment_conditions,
        status: !proposal.viewed_at
          ? proposal.status === "sent" || proposal.status === "draft"
            ? "viewed"
            : proposal.status
          : proposal.status,
        lead_name: leadName,
      }}
    />
  );
}
