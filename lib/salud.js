// Un solo lugar para registrar y sondear la salud de las fuentes de datos.
//
// El problema que resuelve: las tres capas de datos del sitio (propiedades,
// desarrollos y la lista de barrios del tasador) degradan a un respaldo estático
// cuando su fuente no responde. Eso está bien —la web nunca queda vacía— pero
// hasta ahora cada una lo anunciaba a su manera y a nadie: `console.error` en
// dos, `console.info` en la tercera, sin prefijo común, en unos logs de Vercel
// que nadie lee. El resultado es que un deploy hecho con las fuentes caídas
// publica datos de respaldo en silencio y los deja congelados lo que dure el
// `revalidate` de cada ruta.
//
// Acá viven dos cosas distintas, y conviene no confundirlas:
//
//   1. `marcarDegradado` — el aviso PASIVO. Lo llaman las capas de datos cuando
//      ya cayeron al respaldo. Unifica el formato del log para que sea greppable
//      y alertable desde Vercel.
//   2. `estadoDeSalud` — la sonda ACTIVA. Va y pregunta. Es lo que consume
//      `/api/salud`.
//
// Son independientes a propósito: el aviso pasivo solo aparece cuando alguien
// renderiza una página, y las páginas están cacheadas, así que puede pasar un
// día entero sin un solo log aunque la base esté caída. La sonda no depende de
// que nadie visite el sitio.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { TASADOR_API_URL } from "@/config";
import { headersTasador } from "./tasadorAuth";

// Prefijo único para los logs de degradación. Buscar "[salud]" en Vercel trae
// todo, y sirve como patrón para una alerta de log drain.
const PREFIJO = "[salud]";

// Cuánto puede tardar una sonda antes de darla por caída.
//
// La API del tasador vive en Render con plan gratuito y se duerme sola: la
// primera llamada después de un rato despierta el contenedor y tarda. Eso NO es
// una caída —responde, solo que lento— y tratarlo como tal llenaría de falsos
// positivos cualquier monitor. Por eso el techo es generoso y hay un umbral
// intermedio: por encima de `LENTA_MS` la sonda avisa "lenta" y sigue dando el
// servicio por sano.
const SONDA_TIMEOUT_MS = 20_000;
const LENTA_MS = 5_000;

// Sonda a Supabase: más corta, porque acá no hay contenedor que despertar.
const SONDA_SUPABASE_MS = 8_000;

/**
 * Registra que una capa de datos cayó a su respaldo estático.
 *
 * @param {string} fuente  Nombre corto y estable: "properties", "developments", "tasador".
 * @param {string} motivo  Qué pasó, en una línea. Va al log, no al navegador.
 * @param {{ esperado?: boolean }} [opciones]
 *        `esperado: true` para las degradaciones que son parte del diseño y no
 *        un incidente —por ejemplo, una tabla de Supabase que todavía no se
 *        creó—. Bajan a nivel `info` para no ensuciar los logs de producción ni
 *        disparar alertas por algo que ya sabemos.
 */
export function marcarDegradado(fuente, motivo, { esperado = false } = {}) {
  const linea = `${PREFIJO} ${fuente} degradado: ${motivo}`;
  if (esperado) {
    console.info(linea, "(esperado)");
  } else {
    console.error(linea);
  }
}

function clienteSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Envuelve una sonda para que nunca lance y siempre reporte cuánto tardó.
// Devuelve { estado, ms }, donde estado ∈ "ok" | "lenta" | "caida" | "sin_configurar".
async function medir(fn) {
  const arranque = Date.now();
  try {
    const resultado = await fn();
    const ms = Date.now() - arranque;
    if (resultado === "sin_configurar") return { estado: "sin_configurar", ms };
    return { estado: ms > LENTA_MS ? "lenta" : "ok", ms };
  } catch (err) {
    return { estado: "caida", ms: Date.now() - arranque, motivo: err?.message || String(err) };
  }
}

// ¿Responde Supabase y hay catálogo real detrás?
//
// Pide una sola fila en vez de contar: alcanza para probar credenciales, red y
// permisos de RLS, y no le cuesta nada a la base. Una tabla vacía sí cuenta como
// caída: el sitio serviría el respaldo estático igual que si la base no
// estuviera, y para el visitante el efecto es idéntico.
async function sondearSupabase() {
  const client = clienteSupabase();
  if (!client) return "sin_configurar";

  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), SONDA_SUPABASE_MS);
  try {
    const { data, error } = await client
      .from("properties")
      .select("id")
      .limit(1)
      .abortSignal(controlador.signal);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("sin filas");
    return "ok";
  } finally {
    clearTimeout(reloj);
  }
}

// ¿Contesta la API del modelo con una lista de barrios usable?
//
// `cache: "no-store"` es lo que distingue esta sonda de `getBarrios`: aquella
// cachea 24 h a propósito, y una sonda que lee de caché no sondea nada — diría
// "ok" durante un día entero después de que la API se cayó.
async function sondearTasador() {
  if (!TASADOR_API_URL) return "sin_configurar";

  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), SONDA_TIMEOUT_MS);
  try {
    const res = await fetch(`${TASADOR_API_URL}/barrios?ciudad=sma`, {
      headers: headersTasador(),
      cache: "no-store",
      signal: controlador.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const barrios = Array.isArray(data?.barrios) ? data.barrios.filter(Boolean) : [];
    if (!barrios.length) throw new Error("lista vacía");
    return "ok";
  } finally {
    clearTimeout(reloj);
  }
}

/**
 * Sondea todas las fuentes en paralelo y arma el veredicto.
 *
 * Las dos sondas van juntas porque son independientes y esperar una detrás de
 * la otra podría sumar casi 30 s en el peor caso.
 *
 * `sin_configurar` no cuenta como caída: es el estado normal de un entorno de
 * desarrollo sin `.env.local`, y un monitor no debería despertar a nadie por
 * eso. Sí aparece en la respuesta, para que se note al mirarla.
 */
export async function estadoDeSalud() {
  const [supabase, tasador] = await Promise.all([medir(sondearSupabase), medir(sondearTasador)]);

  const fuentes = { supabase, tasador };
  const caidas = Object.entries(fuentes)
    .filter(([, v]) => v.estado === "caida")
    .map(([k]) => k);

  for (const [nombre, v] of Object.entries(fuentes)) {
    if (v.estado === "caida") marcarDegradado(nombre, `sonda falló: ${v.motivo}`);
  }

  return {
    ok: caidas.length === 0,
    verificado: new Date().toISOString(),
    fuentes,
    caidas,
  };
}
