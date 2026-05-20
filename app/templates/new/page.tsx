import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { Navigation } from "@/components/Navigation";
import { NewTemplateForm } from "@/components/templates/NewTemplateForm";

export default async function NewTemplatePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="mx-auto w-full max-w-3xl">
          <NewTemplateForm />
        </div>
      </div>
    </main>
  );
}
