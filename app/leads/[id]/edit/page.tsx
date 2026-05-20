import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { EditLeadForm } from "@/components/leads/EditLeadForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditLeadPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id,name,email,phone,age,goal,source,status,tags,notes,estimated_value,next_follow_up")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !lead) redirect("/pipeline");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <EditLeadForm lead={lead as any} />
      </div>
    </AppShell>
  );
}
