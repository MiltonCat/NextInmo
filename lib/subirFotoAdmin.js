"use client";
// Sube una foto del panel /admin directo al Storage de Supabase y devuelve su
// URL pública.
//
// Antes las fotos viajaban dentro de la Server Action. Vercel rechaza con 413
// cualquier request de más de 4,5 MB *antes* de invocar la función, así que con
// dos fotos de propiedad ya alcanzaba para que el navegador mostrara la
// pantalla de error de la plataforma: la acción nunca corría y no había manera
// de avisar dentro del formulario. (`serverActions.bodySizeLimit` en
// next.config.mjs no puede levantar ese tope: solo aplica en `next dev`.)
//
// Ahora el servidor firma un permiso de un solo uso y el archivo va del
// navegador a Supabase. Al enviar el formulario solo viaja texto.
//
// Vivía dentro de PropertyForm.jsx. Se movió acá cuando ImagesManager pasó a
// necesitar lo mismo: con la galería de cantidad libre, mandar los archivos en
// el envío del formulario es todavía menos viable que con cinco.
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export async function subirFotoAdmin(file) {
  // La barra final es obligatoria: con trailingSlash activado, pedir la ruta
  // sin barra provoca un 308 y hay cabeceras que no sobreviven al salto.
  const res = await fetch("/api/admin/foto-firmada/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: file.name }),
  });

  const permiso = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(permiso.error || `No se pudo preparar la subida (error ${res.status}).`);
  }

  const supabase = supabaseBrowser();
  if (!supabase) throw new Error("Falta la configuración de Supabase en el navegador.");

  const { error } = await supabase.storage
    .from(permiso.bucket)
    .uploadToSignedUrl(permiso.path, permiso.token, file, {
      contentType: file.type || undefined,
    });
  if (error) throw new Error(`No se pudo subir "${file.name}": ${error.message}`);

  return permiso.urlPublica;
}
