"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateInquiry, deleteInquiry } from "@/lib/crm";

const ESTADOS = new Set(["nuevo", "contactado", "en_proceso", "cerrado", "descartado"]);

export async function setEstado(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado") || "");
  if (!id || !ESTADOS.has(estado)) return;
  await updateInquiry(id, { estado });
  revalidatePath("/admin/consultas");
}

export async function saveNotas(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  const notas = String(formData.get("notas") || "").trim() || null;
  await updateInquiry(id, { notas });
  revalidatePath("/admin/consultas");
}

export async function removeInquiry(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteInquiry(id);
  revalidatePath("/admin/consultas");
}
