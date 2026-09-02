import "server-only";

import { rest } from "@/lib/supabaseRest";

// Busqueda semantica sobre el contenido publicado (tabla sitio_fragmentos, que
// llena scripts/indexar-sitio.mjs). Es lo que le permite a Lucia encontrar una
// nota por lo que dice y no por las palabras que la persona haya elegido:
// "me conviene comprar ahora" y /inversiones no comparten una sola palabra.
//
// Complementa los bloques con datos duros de luciaKnowledge.js, no los
// reemplaza: el catalogo, el m² y las fichas de barrio siguen viniendo
// estructurados y en vivo. Esto aporta la prosa —guias, notas, centro de ayuda—
// que hasta ahora Lucia no leia.
const MODELO = "text-embedding-3-small";

async function vectorDe(texto) {
  const clave = process.env.OPENAI_API_KEY;
  if (!clave) return null;
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELO, input: String(texto || "").slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}`);
  const data = await res.json();
  return data?.data?.[0]?.embedding ?? null;
}

// Umbral de similitud: por debajo, el fragmento entra igual en el "top 6" pero
// no tiene nada que ver con la pregunta. Sin corte, cualquier consulta arrastra
// seis pedazos de sitio al contexto y el modelo los toma como relevantes.
const MINIMO_SIMILITUD = 0.28;

export async function buscarEnElSitio(pregunta, { cantidad = 6 } = {}) {
  try {
    const vector = await vectorDe(pregunta);
    if (!vector) return [];
    const filas = await rest("rpc/buscar_sitio", {
      method: "POST",
      body: JSON.stringify({ consulta: JSON.stringify(vector), cantidad }),
    });
    if (!Array.isArray(filas)) return [];
    return filas.filter((fila) => (fila?.similitud ?? 0) >= MINIMO_SIMILITUD);
  } catch (error) {
    // Nunca lanza: si el indice no esta creado todavia, o OpenAI falla, Lucia
    // sigue contestando con los bloques de siempre.
    console.error("[Lucía/busqueda]", error?.message || error);
    return [];
  }
}
