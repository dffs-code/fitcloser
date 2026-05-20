import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { AppShell } from "@/components/AppShell";
import { NewTemplateForm } from "@/components/templates/NewTemplateForm";

export default async function NewTemplatePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl">
          <NewTemplateForm />
        </div>
    </AppShell>
  );
}
