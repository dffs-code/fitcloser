import { supabaseAdmin } from "@/lib/supabase-admin";
import { PublicContractPage } from "@/components/PublicContractPage";

type Props = { params: Promise<{ id: string }> };

function substituteVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export default async function PublicContractDetail({ params }: Props) {
  const { id } = await params;

  const { data: contract, error } = await supabaseAdmin
    .from("contracts")
    .select("id,title,template,status,expires_at,created_at,lead_id,trainer_id")
    .eq("id", id)
    .single();

  if (error || !contract) {
    return <PublicContractPage contract={null} />;
  }

  // Fetch lead name for variable substitution
  let leadName = "cliente";
  if (contract.lead_id) {
    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("name")
      .eq("id", contract.lead_id)
      .single();
    if (lead?.name) leadName = lead.name;
  }

  // Fetch trainer business name
  let trainerName = "seu treinador";
  const { data: settings } = await supabaseAdmin
    .from("business_settings")
    .select("business_name")
    .eq("trainer_id", contract.trainer_id)
    .single();
  if (settings?.business_name) trainerName = settings.business_name;

  const body = substituteVars(contract.template ?? "", {
    nome: leadName,
    treinador: trainerName,
    data: new Date(contract.created_at).toLocaleDateString("pt-BR"),
  });

  return (
    <PublicContractPage
      contract={{
        id: contract.id,
        title: contract.title,
        body,
        status: contract.status,
        lead_name: leadName,
        expires_at: contract.expires_at,
        created_at: contract.created_at,
      }}
    />
  );
}
