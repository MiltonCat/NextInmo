"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isAdminUser } from "@/lib/adminAccess";

// Inicia sesión con email y contraseña. Devuelve { error } si falla;
// si tiene éxito, redirige al panel.
export async function signIn(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !isAdminUser(data?.user)) {
    if (data?.user) await supabase.auth.signOut();
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/admin");
}

// Cierra la sesión y vuelve al login.
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
