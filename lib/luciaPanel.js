// Lectura de lo que le preguntan a Lucía, para el panel. SOLO servidor: usa la
// clave secreta vía REST (ver lib/supabaseRest.js) y va detrás de requireUser.
//
// Son dos tablas que se cruzan por `answer_id`: `lucia_preguntas` guarda la
// pregunta y `lucia_feedback` el pulgar. Se traen por separado y se juntan acá
// porque PostgREST no puede hacer el join sin una foreign key declarada, y
// declararla obligaría a que toda pregunta tenga respuesta — las guiadas no la
// tienen.
import "server-only";

import { rest } from "./supabaseRest";

// Lista explícita: `select=*` traería las columnas que se agreguen mañana sin
// que nadie lo decida (ver la nota del servidor MCP).
const CAMPOS =
  "id,created_at,pregunta,answer_id,ruta,respondida,error,fuentes,page_path,model";

export const FILTROS = [
  { value: "", label: "Todas" },
  { value: "pulgar_abajo", label: "Con pulgar abajo" },
  { value: "sin_responder", label: "Sin responder" },
  { value: "guiado", label: "No llegaron a la IA" },
];

// Cuántas filas mira el panel. Es una ventana, no la tabla entera: los números
// de arriba dicen "sobre las últimas N" por eso mismo.
export const VENTANA = 200;

// El pulgar más reciente de cada respuesta, indexado por answer_id.
export async function getFeedbackMap({ limite = 500 } = {}) {
  const rows = await rest(
    `lucia_feedback?select=answer_id,rating,reason,comment,created_at&order=created_at.desc&limit=${limite}`
  );
  const map = new Map();
  for (const row of rows ?? []) {
    if (row.answer_id && !map.has(row.answer_id)) map.set(row.answer_id, row);
  }
  return map;
}

async function idsConPulgarAbajo({ limite = 500 } = {}) {
  const rows = await rest(
    `lucia_feedback?select=answer_id&rating=eq.-1&order=created_at.desc&limit=${limite}`
  );
  return (rows ?? []).map((r) => r.answer_id).filter(Boolean);
}

export async function getPreguntas({ filtro = "", limite = VENTANA } = {}) {
  const params = new URLSearchParams({
    select: CAMPOS,
    order: "created_at.desc",
    limit: String(limite),
  });

  if (filtro === "sin_responder") {
    // `respondida` va en null en las guiadas: ahí no falló nada, nunca hubo
    // intento. `is.false` deja afuera esas filas, `neq.true` no.
    params.set("respondida", "is.false");
  } else if (filtro === "guiado") {
    params.set("ruta", "eq.guiado");
  } else if (filtro === "pulgar_abajo") {
    const ids = await idsConPulgarAbajo();
    if (ids.length === 0) return [];
    params.set("answer_id", `in.(${ids.join(",")})`);
  }

  return (await rest(`lucia_preguntas?${params.toString()}`)) ?? [];
}

// Todo lo que necesita la página, en un viaje por tabla.
export async function getPanelDeLucia({ filtro = "" } = {}) {
  const [preguntas, feedback] = await Promise.all([
    getPreguntas({ filtro }),
    getFeedbackMap(),
  ]);

  const conFeedback = preguntas.map((p) => ({
    ...p,
    feedback: p.answer_id ? feedback.get(p.answer_id) ?? null : null,
  }));

  return {
    preguntas: conFeedback,
    resumen: {
      total: conFeedback.length,
      pulgarAbajo: conFeedback.filter((p) => p.feedback?.rating === -1).length,
      sinResponder: conFeedback.filter((p) => p.respondida === false).length,
      guiadas: conFeedback.filter((p) => p.ruta === "guiado").length,
    },
  };
}
