import { cookies } from "next/headers";
import { createServerClient as createServerClientFromAuthHelpers } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createServerClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables for server-side client.");
  }

  const cookieStore = cookies();

  return createServerClientFromAuthHelpers(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => {
        const cookie = cookieStore.get(name);
        return cookie?.value ?? null;
      }
    }
  });
};