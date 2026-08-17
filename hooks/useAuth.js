"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabaseBrowser();
    if (!client) {
      setLoading(false);
      return;
    }

    // Obtener sesión actual
    client.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data } = client.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => data?.subscription?.unsubscribe?.();
  }, []);

  return { user, loading };
}
