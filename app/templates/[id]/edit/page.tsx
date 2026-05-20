import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { EditTemplateForm } from "@/components/templates/EditTemplateForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: template, error } = await supabase
    .from("message_templates")
    .select("id,category,title,body")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (error || !template) redirect("/templates");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <EditTemplateForm template={template} />
      </div>
    </AppShell>
  );
}
