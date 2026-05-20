"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase-browser";

type SupabaseSessionContextValue = {
  session: Session | null;
  isLoading: boolean;
};

const SupabaseClientContext = createContext<SupabaseClient | null>(null);
const SupabaseSessionContext = createContext<SupabaseSessionContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState<SupabaseClient | null>(() => createBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabaseClient) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <SupabaseClientContext.Provider value={supabaseClient}>
      <SupabaseSessionContext.Provider value={{ session, isLoading }}>
        {children}
      </SupabaseSessionContext.Provider>
    </SupabaseClientContext.Provider>
  );
}

export function useSupabaseClient() {
  const client = useContext(SupabaseClientContext);

  if (!client) {
    throw new Error("useSupabaseClient must be used within SupabaseProvider.");
  }

  return client;
}

export function useSessionContext() {
  const context = useContext(SupabaseSessionContext);

  if (!context) {
    throw new Error("useSessionContext must be used within SupabaseProvider.");
  }

  return context;
}
