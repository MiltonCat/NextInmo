"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteSubscriber } from "@/lib/suscriptores";

export async function removeSubscriber(formData) {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteSubscriber(id);
  revalidatePath("/admin/suscriptores");
}
