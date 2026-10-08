"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { deleteCierre, filaDesdeFormulario, insertCierre } from "@/lib/cierres";

export async function crearCierre(formData) {
  await requireUser();
  const { fila, error } = filaDesdeFormulario(formData);
  if (error) redirect(`/admin/cierres/?error=${encodeURIComponent(error)}`);
  try {
    await insertCierre(fila);
  } catch (e) {
    redirect(`/admin/cierres/?error=${encodeURIComponent(`No se pudo guardar: ${e.message}`)}`);
  }
  revalidatePath("/admin/cierres");
  redirect("/admin/cierres/?ok=1");
}

export async function borrarCierre(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteCierre(id);
  revalidatePath("/admin/cierres");
}
