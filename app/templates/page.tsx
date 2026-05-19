import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-client";
import { TemplateList } from "@/components/TemplateList";
import { Navigation } from "@/components/Navigation";

export default async function TemplatesPage() {
  const supabase = createServerClient();
  const sessionResponse = await supabase.auth.getSession();
  const session = sessionResponse.data.session;

  if (!session) redirect("/login");

  const { data: templates } = await supabase
    .from("message_templates")
    .select("id,category,title,body")
    .eq("trainer_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        <Navigation />
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Modelos de mensagem</p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Mensagens prontas para WhatsApp</h1>
          </div>
          <TemplateList templates={templates ?? []} />
        </div>
      </div>
    </div>
  );
}
