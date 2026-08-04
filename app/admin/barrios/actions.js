"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  setEstadoOpinion,
  setCitaPublicable,
  deleteOpinion,
} from "@/lib/barrioOpiniones";

// Aprobar una opinión la hace computar en los promedios de la ficha del barrio.
// Rechazarla la deja guardada pero fuera de todo cálculo (no la borra: sirve
// para auditar y para detectar patrones de spam).
export async function moderarOpinion(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado") || "");
  if (!id || !estado) return;
  await setEstadoOpinion(id, estado);
  revalidatePath("/admin/barrios");
}

// Publicar la frase es una decisión separada de aprobar la respuesta: una
// opinión puede sumar a los promedios sin que su cita se muestre.
export async function alternarCita(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const publicable = formData.get("publicable") === "true";
  if (!id) return;
  await setCitaPublicable(id, publicable);
  revalidatePath("/admin/barrios");
}

export async function eliminarOpinion(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteOpinion(id);
  revalidatePath("/admin/barrios");
}
