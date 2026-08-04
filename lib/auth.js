// Capa de verificación de sesión para el panel /admin.
// Se usa en páginas y Server Actions para garantizar que solo un usuario
// logueado pueda ver o modificar datos. (Solo debe importarse desde servidor.)
import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabaseServer";
import { isAdminUser } from "./adminAccess";

// Devuelve el usuario logueado, o null si no hay sesión válida.
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Una cookie vencida o un refresh token inválido equivalen a no tener
    // sesión. Las páginas protegidas se encargan de redirigir al login.
    if (error) return null;

    return user ?? null;
  } catch {
    // También cubre fallos inesperados de red/Auth sin romper /admin.
    return null;
  }
}

// Exige sesión: si no hay, redirige al login. Devuelve el usuario.
export async function requireUser() {
  const user = await getSessionUser();
  if (!isAdminUser(user)) redirect("/admin/login");
  return user;
}

// Exige únicamente una identidad válida. Se usa en /cuenta, que delega el
// aislamiento de datos a RLS y nunca concede acceso administrativo.
export async function requireAuthenticatedUser() {
  const user = await getSessionUser();
  if (!user) redirect("/cuenta/login");
  return user;
}
