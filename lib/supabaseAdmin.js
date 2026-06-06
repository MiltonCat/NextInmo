// Cliente de Supabase con clave SECRETA (service role): omite RLS y puede
// escribir/borrar. SOLO debe usarse en el servidor (Server Actions), y siempre
// detrás de una verificación de sesión. Nunca importar desde código de cliente.
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  }
  return createClient(url, secret, { auth: { persistSession: false } });
}
