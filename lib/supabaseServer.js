// Cliente de Supabase para el SERVIDOR, ligado a las cookies de la petición.
// Mantiene la sesión del usuario logueado (login/logout) usando @supabase/ssr.
// Usa la clave publicable; el acceso queda limitado por RLS y por la sesión.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Al llamarse desde un Server Component (no Server Action / Route
          // Handler) las cookies son de solo lectura; se ignora sin romper.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* no-op: refresco de sesión manejado por el proxy/acciones */
          }
        },
      },
    }
  );
}
