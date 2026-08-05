// Capa de datos de SUSCRIPTORES (tabla `subscribers`). SOLO servidor: usa la
// clave secreta vía REST (ver lib/supabaseRest.js). La lectura/borrado del panel
// va detrás de requireUser (ver lib/auth.js); el alta pública va detrás de la
// API route app/api/suscripcion.
import { rest } from "./supabaseRest";

const TABLE = "subscribers";

// Campos que aceptamos al insertar (lista blanca).
const CAMPOS = ["email", "nombre", "interes", "source"];

// Da de alta un suscriptor. Si el email ya existe, no rompe: lo deja como está
// (merge-duplicates sobre la columna única `email`).
export async function insertSubscriber(input) {
  const row = {};
  for (const k of CAMPOS) if (input[k] !== undefined) row[k] = input[k];
  const data = await rest(`${TABLE}?on_conflict=email`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });
  return data?.[0] ?? null;
}

// Suma a la lista de correo a quien creó una cuenta de visitante.
//
// Las cuentas viven en `auth.users` y la lista de correo en `subscribers`: son
// dos tablas distintas y hasta ahora no se cruzaban, así que quien se
// registraba quedaba fuera del panel de suscriptores. Esto lo cierra.
//
// Se consulta antes de insertar en vez de confiar en el upsert: la resolución
// merge-duplicates pisaría el `source` de alguien que ya se había suscrito
// desde el sitio o el tasador, y ahí se perdería de dónde vino originalmente.
//
// El alta por cuenta no trae `nombre` ni `interes` — el registro solo pide el
// correo — así que esos campos quedan nulos hasta que la persona complete el
// formulario de suscripción.
//
// Nunca lanza: se llama desde el callback de autenticación y un fallo acá no
// puede impedirle a nadie iniciar sesión.
export async function ensureSubscriberFromAccount(email) {
  const limpio = String(email || "").trim().toLowerCase();
  if (!limpio) return false;

  try {
    if (await subscriberExists(limpio)) return false;
    await insertSubscriber({ email: limpio, source: "cuenta" });
    return true;
  } catch (err) {
    console.error("[suscriptores] no se pudo sumar la cuenta a la lista:", err);
    return false;
  }
}

// ¿Existe ya un suscriptor con este email? (para no repetir el email de bienvenida)
export async function subscriberExists(email) {
  const rows = await rest(`${TABLE}?select=id&email=eq.${encodeURIComponent(email)}&limit=1`);
  return Array.isArray(rows) && rows.length > 0;
}

export async function getSubscribers() {
  return rest(`${TABLE}?select=*&order=created_at.desc`);
}

export async function deleteSubscriber(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// Cantidad total de suscriptores activos (para el contador del panel).
export async function countSubscribers() {
  const rows = await rest(`${TABLE}?select=id&estado=eq.activo`);
  return Array.isArray(rows) ? rows.length : 0;
}
