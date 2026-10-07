// "Seguí el valor de tu propiedad": el dueño que tasó en el sitio se anota y
// le escribimos una vez por mes cuánto vale su propiedad y cómo se movió su
// barrio. Es la pieza de captación de la etapa 1 de docs/plan-red-catalan.md:
// el que tasa deja de irse para siempre y, cuando decida vender, ya nos conoce.
//
// Capa de datos de la tabla `seguimientos_valor` (scripts/setup-seguimientos.mjs).
// SOLO servidor: escribe con la clave secreta vía REST.

import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { rest } from "./supabaseRest";
import { TASADOR_API_URL } from "@/config";
import { headersTasador } from "./tasadorAuth";

const TABLA = "seguimientos_valor";
const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

export function hashPayload(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function etiquetaDe(payload) {
  return `${payload.tipo_propiedad} en ${payload.barrio} · ${payload.superficie_cubierta} m²`;
}

// Alta. Si la misma persona ya sigue esa misma propiedad, no duplica: devuelve
// la que ya estaba (la segunda vez que toca el botón no es un error).
export async function crearSeguimiento({ email, nombre, ciudad, payload, resultado }) {
  const payloadHash = hashPayload(payload);
  const existentes = await rest(
    `${TABLA}?select=id,token&email=eq.${encodeURIComponent(email)}&payload_hash=eq.${payloadHash}&activo=eq.true&limit=1`
  );
  if (existentes?.length) return { ...existentes[0], yaExistia: true };

  const valor = Number.isFinite(resultado?.valorTotal) ? resultado.valorTotal : null;
  const filas = await rest(TABLA, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      token: randomBytes(24).toString("hex"),
      email,
      nombre: nombre || null,
      ciudad,
      payload,
      payload_hash: payloadHash,
      etiqueta: etiquetaDe(payload),
      tipo: payload.tipo_propiedad,
      barrio: payload.barrio,
      valor_inicial: valor,
      valor_ultimo: valor,
      rango_min_ultimo: Number.isFinite(resultado?.rangoMin) ? resultado.rangoMin : null,
      rango_max_ultimo: Number.isFinite(resultado?.rangoMax) ? resultado.rangoMax : null,
    }),
  });
  return { ...filas?.[0], yaExistia: false };
}

// Los que ya cumplieron su mes, del más atrasado al más nuevo.
export async function seguimientosPendientes(limite = 10) {
  const ahora = new Date().toISOString();
  return rest(
    `${TABLA}?select=*&activo=eq.true&proximo_envio=lte.${encodeURIComponent(ahora)}&order=proximo_envio.asc&limit=${limite}`
  );
}

export async function registrarEnvio(id, resultado) {
  const ahora = new Date();
  const fila = (await rest(`${TABLA}?select=envios&id=eq.${id}`))?.[0];
  return rest(`${TABLA}?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      valor_ultimo: Number.isFinite(resultado?.valorTotal) ? resultado.valorTotal : null,
      rango_min_ultimo: Number.isFinite(resultado?.rangoMin) ? resultado.rangoMin : null,
      rango_max_ultimo: Number.isFinite(resultado?.rangoMax) ? resultado.rangoMax : null,
      ultimo_envio: ahora.toISOString(),
      proximo_envio: new Date(ahora.getTime() + TREINTA_DIAS).toISOString(),
      envios: (fila?.envios || 0) + 1,
    }),
  });
}

// Si el modelo no respondió, se reintenta mañana en vez de esperar otro mes.
export async function posponer(id) {
  return rest(`${TABLA}?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ proximo_envio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }),
  });
}

const TOKEN_RE = /^[a-f0-9]{48}$/;

export async function seguimientoPorToken(token) {
  if (!TOKEN_RE.test(String(token || ""))) return null;
  return (await rest(`${TABLA}?select=*&token=eq.${token}&limit=1`))?.[0] || null;
}

export async function darDeBaja(token) {
  if (!TOKEN_RE.test(String(token || ""))) return null;
  return rest(`${TABLA}?token=eq.${token}`, {
    method: "PATCH",
    body: JSON.stringify({ activo: false, baja: new Date().toISOString() }),
  });
}

export async function marcarQuiereVender(token) {
  if (!TOKEN_RE.test(String(token || ""))) return null;
  return rest(`${TABLA}?token=eq.${token}`, {
    method: "PATCH",
    body: JSON.stringify({ quiere_vender: new Date().toISOString() }),
  });
}

// Cómo se movió el m² de ese tipo en ese barrio, con el índice mensual que
// guarda la API del modelo (GET /mercado/historia). Devuelve null si la API no
// responde o no hay dato publicable: en ese caso el mail no dice nada del
// barrio, nunca un número de relleno.
export async function movimientoDelBarrio(ciudad, barrio, tipo, cache = new Map()) {
  try {
    if (!cache.has(ciudad)) {
      const res = await fetch(`${TASADOR_API_URL}/mercado/historia?ciudad=${encodeURIComponent(ciudad)}`, {
        headers: headersTasador(),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      cache.set(ciudad, res.ok ? (await res.json())?.meses || [] : []);
    }
    const meses = cache.get(ciudad);
    const fila = (mes) => mes?.por_barrio?.find((b) => b.barrio === barrio && b.tipo === tipo) || null;
    const actual = fila(meses.at(-1));
    if (!actual) return null;
    const anterior = meses.length > 1 ? fila(meses.at(-2)) : null;
    const variacionPct =
      anterior?.mediana_m2_usd > 0
        ? Math.round(((actual.mediana_m2_usd - anterior.mediana_m2_usd) / anterior.mediana_m2_usd) * 1000) / 10
        : null;
    return { medianaM2: actual.mediana_m2_usd, n: actual.n, variacionPct, mes: meses.at(-1)?.mes || null };
  } catch {
    return null;
  }
}
