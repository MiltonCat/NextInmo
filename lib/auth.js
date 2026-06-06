// Capa de verificación de sesión para el panel /admin.
// Se usa en páginas y Server Actions para garantizar que solo un usuario
// logueado pueda ver o modificar datos. (Solo debe importarse desde servidor.)
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabaseServer";

// Devuelve el usuario logueado, o null si no hay sesión válida.
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

// Exige sesión: si no hay, redirige al login. Devuelve el usuario.
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
