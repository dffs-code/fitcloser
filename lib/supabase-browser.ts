import { type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient as createAuthBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createBrowserClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    return null;
  }

  // Use auth-helpers to ensure the session is persisted in cookies
  // so server-side `createServerClient` can read it via `next/headers`.
  return createAuthBrowserClient(supabaseUrl, supabaseKey) as SupabaseClient;
};

export default createBrowserClient;
