// Modo sombra de Jev: interpreta la misma frase que ya ruteó el router actual
// y guarda las dos decisiones lado a lado. NO cambia nada de lo que ve el
// visitante: corre después de responder (after()) y nunca lanza.
//
// Solo servidor: la clave de Jev vive en JEV_API_KEY y no sale de acá.
import "server-only";

import { rest } from "./supabaseRest";
import { limpiarPregunta } from "./luciaPreguntas";
import { parseLuciaText, rutaDelTexto } from "./luciaAdvisor.mjs";
import {
  JEV_MODELO_POR_DEFECTO,
  compararConRouter,
  construirPedidoJev,
  leerRespuestaJev,
  planSegunJev,
} from "./luciaJev.mjs";

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
// En sombra nadie espera esta respuesta, así que el techo es generoso. Igual
// se guarda la latencia real: es el dato para decidir si puede ir en línea.
const TIMEOUT_MS = 8_000;

export const RUTAS_REALES = new Set(["ia", "guiado", "tasador", "ia_tasacion"]);

export function sombraActiva() {
  return process.env.LUCIA_JEV_SOMBRA === "1" && Boolean(process.env.JEV_API_KEY);
}

// Mismo recorte que usa /api/lucia, más la limpieza de mails y teléfonos:
// esto sale a un tercero, así que no viaja ningún dato de contacto.
export function limpiarHistorial(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-8)
    .map((item) => ({
      role: item?.role === "user" || item?.role === "assistant" ? item.role : null,
      content: limpiarPregunta(typeof item?.content === "string" ? item.content.slice(0, 700) : ""),
    }))
    .filter((item) => item.role && item.content);
}

export async function consultarJev({ question, history }) {
  const inicio = Date.now();
  try {
    const pedido = construirPedidoJev({
      question,
      history,
      modelo: process.env.JEV_MODEL || JEV_MODELO_POR_DEFECTO,
    });
    const res = await fetch(process.env.JEV_API_URL || JEV_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JEV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedido),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const body = await res.json().catch(() => null);
    const latenciaMs = Date.now() - inicio;
    if (!res.ok) return { ok: false, error: `http_${res.status}`, latenciaMs };
    const leido = leerRespuestaJev(body);
    if (!leido) return { ok: false, error: "respuesta_invalida", latenciaMs };
    return { ok: true, ...leido, latenciaMs };
  } catch (error) {
    return {
      ok: false,
      error: error?.name === "TimeoutError" || error?.name === "AbortError" ? "timeout" : "network_error",
      latenciaMs: Date.now() - inicio,
    };
  }
}

// Una fila por frase. El router se recalcula acá con la misma función pura que
// usa el navegador, para guardar también los filtros que extrajo; la ruta que
// manda es la que informó el cliente, porque ahí están los desvíos previos
// (tasador, charla sobre una tasación) que el router no ve.
export async function procesarSombra({ question, history = [], paso = "welcome", rutaReal, pagePath = null, interno = false }) {
  try {
    const pregunta = limpiarPregunta(question);
    if (!pregunta) return null;

    const parsed = parseLuciaText(question, paso);
    const rutaRouter = rutaDelTexto(question, paso, parsed);
    const ruta = RUTAS_REALES.has(rutaReal) ? rutaReal : rutaRouter;

    const jev = await consultarJev({ question: pregunta, history: limpiarHistorial(history) });
    const plan = jev.ok ? planSegunJev(jev.senales, jev.probabilidades) : null;
    const comparacion = compararConRouter({ rutaReal: ruta, filtrosRouter: parsed.filters, plan });

    const fila = {
      pregunta,
      paso: String(paso || "").slice(0, 40) || null,
      ruta_real: ruta,
      ruta_router: rutaRouter,
      filtros_router: parsed.filters,
      ruta_jev: plan?.ruta ?? null,
      operacion_jev: plan?.operacion ?? null,
      modulos_jev: plan?.modulos ?? null,
      senales: jev.ok ? jev.senales : null,
      probabilidades: jev.ok ? jev.probabilidades : null,
      aclarar_entre: plan?.aclararEntre ?? [],
      coincide: comparacion.coincide,
      diferencias: comparacion.diferencias,
      latencia_ms: Number.isFinite(jev.latenciaMs) ? jev.latenciaMs : null,
      error: jev.ok ? null : jev.error,
      model: jev.ok ? jev.modelo : null,
      con_historial: history.length > 0,
      page_path: pagePath,
      interno: Boolean(interno),
    };

    await rest("lucia_sombra_jev", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(fila),
    });
    return fila;
  } catch (error) {
    console.error("[Lucía/sombra-jev]", error?.message || error);
    return null;
  }
}
