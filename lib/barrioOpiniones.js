// Capa de datos de la GUÍA DE BARRIOS (tabla `barrio_opiniones`).
//
// SOLO SERVIDOR: usa la clave secreta vía REST (ver lib/supabaseRest.js). No
// importar desde componentes cliente — para eso está lib/barrioEncuesta.js, que
// tiene las constantes del formulario sin dependencias de servidor.
//
// El alta pública va detrás de app/api/barrio-opinion; la lectura y moderación
// del panel van detrás de requireUser (ver lib/auth.js).
import { rest } from "./supabaseRest";
import { SLUGS_VALIDOS } from "./barrios";
import { DIMENSION_KEYS } from "./barrioEncuesta";
import { marcarDegradado } from "./salud";

const TABLE = "barrio_opiniones";
const VISTA = "barrio_agregados";

// ── Alta pública ───────────────────────────────────────────────────────────

// Campos que aceptamos al insertar (lista blanca: nunca pasamos el body crudo).
const CAMPOS = [
  "barrio", "barrio_otro", "relacion", "antiguedad",
  ...DIMENSION_KEYS,
  "rec_vivir", "rec_invertir", "volveria_elegir", "sin_auto", "perfiles",
  "cita", "nombre", "email", "quiere_informe",
  "ip_hash", "user_agent",
];

export async function insertOpinion(input) {
  const row = {};
  for (const k of CAMPOS) if (input[k] !== undefined) row[k] = input[k];
  // `estado` queda siempre en el default 'pendiente': nada entra publicado.
  const data = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  return data?.[0] ?? null;
}

// Cuántas opiniones mandó este origen en las últimas 24 h. Frena a alguien que
// quiera inflar un barrio a mano; el rate limit por minuto no alcanza para eso.
export async function contarPorIpReciente(ipHash, horas = 24) {
  if (!ipHash) return 0;
  const desde = new Date(Date.now() - horas * 3600_000).toISOString();
  const rows = await rest(
    `${TABLE}?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${desde}`
  );
  return Array.isArray(rows) ? rows.length : 0;
}

// ── Panel de moderación ────────────────────────────────────────────────────

export async function getOpiniones({ estado = null } = {}) {
  const filtro = estado ? `&estado=eq.${encodeURIComponent(estado)}` : "";
  return rest(`${TABLE}?select=*${filtro}&order=created_at.desc`);
}

export async function contarPorEstado() {
  const rows = await rest(`${TABLE}?select=estado`);
  const out = { pendiente: 0, aprobada: 0, rechazada: 0 };
  for (const r of rows ?? []) {
    if (out[r.estado] !== undefined) out[r.estado] += 1;
  }
  return out;
}

export async function setEstadoOpinion(id, estado) {
  if (!["pendiente", "aprobada", "rechazada"].includes(estado)) {
    throw new Error(`Estado inválido: ${estado}`);
  }
  await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

// La cita se publica aparte del estado: se puede aprobar una respuesta para que
// compute en los promedios sin publicar su frase.
export async function setCitaPublicable(id, publicable) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ cita_publicable: Boolean(publicable) }),
  });
}

export async function deleteOpinion(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// ── Lectura pública (fichas de barrio) ─────────────────────────────────────

// Agregados de todos los barrios, indexados por slug.
export async function getAgregados() {
  const rows = await rest(`${VISTA}?select=*`);
  const out = {};
  for (const r of rows ?? []) out[r.barrio] = r;
  return out;
}

export async function getAgregadoDeBarrio(slug) {
  if (!SLUGS_VALIDOS.has(slug)) return null;
  const rows = await rest(`${VISTA}?select=*&barrio=eq.${encodeURIComponent(slug)}&limit=1`);
  return rows?.[0] ?? null;
}

// Citas aprobadas y marcadas como publicables de un barrio. Nunca devuelve
// email ni nombre: solo lo que se puede mostrar.
export async function getCitasDeBarrio(slug, limite = 10) {
  if (!SLUGS_VALIDOS.has(slug)) return [];
  const rows = await rest(
    `${TABLE}?select=id,cita,relacion,antiguedad,created_at` +
      `&barrio=eq.${encodeURIComponent(slug)}` +
      `&estado=eq.aprobada&cita_publicable=is.true&cita=not.is.null` +
      `&order=created_at.desc&limit=${Number(limite)}`
  );
  return rows ?? [];
}

// Lectura tolerante a fallos para las fichas públicas /barrios/[slug].
//
// `rest()` tira excepción ante cualquier error, y estas páginas se generan en
// build: si la tabla todavía no está creada en ese entorno, o falta la env var,
// una ficha que rompe se lleva puesto el build entero. El perfil editorial no
// depende de Supabase, así que la ficha tiene que poder renderizar igual y
// simplemente no mostrar el bloque de opiniones.
export async function getOpinionesPublicas(slug) {
  try {
    const [agregado, citas] = await Promise.all([
      getAgregadoDeBarrio(slug),
      getCitasDeBarrio(slug),
    ]);
    return { agregado, citas, disponible: true };
  } catch (err) {
    marcarDegradado("barrio-opiniones", `sin opiniones para "${slug}": ${err.message}`);
    return { agregado: null, citas: [], disponible: false };
  }
}
