/**
 * Foto y nombre del visitante, tal como los deja Google al entrar.
 *
 * Los dos datos viven en `user_metadata`, que es el lado del perfil que el
 * propio usuario puede escribir. Sirven para MOSTRAR, nunca para decidir
 * permisos: el rol se resuelve con `app_metadata` y ADMIN_EMAILS en
 * `isAdminUser()`. Mezclar las dos cosas sería el agujero clásico.
 */

// Solo se acepta una URL https de los servidores de imágenes de Google.
//
// Sin este filtro, cualquiera que lograra escribir su propio `avatar_url`
// haría que la página cargue una imagen de un dominio arbitrario. Eso le
// entrega al dueño de ese dominio la IP y el user-agent de quien abra la
// página, y permite usar el sitio para servir contenido ajeno.
const AVATAR_HOST = /^lh\d+\.googleusercontent\.com$/;

export function avatarDeGoogle(user) {
  const crudo = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  if (!crudo) return null;

  try {
    const url = new URL(String(crudo));
    if (url.protocol !== "https:" || !AVATAR_HOST.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function nombreVisible(user) {
  const meta = user?.user_metadata || {};
  const nombre = String(meta.full_name || meta.name || "").trim();
  return nombre ? nombre.slice(0, 60) : null;
}

/** Primera letra del nombre, o del correo si no hay nombre. Para el círculo
 *  de respaldo cuando la persona entró por código y no tiene foto. */
export function inicial(user) {
  const base = nombreVisible(user) || user?.email || "";
  const letra = String(base).trim().charAt(0).toUpperCase();
  return /[A-ZÁÉÍÓÚÑ0-9]/.test(letra) ? letra : null;
}
