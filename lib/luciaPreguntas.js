import "server-only";

import { rest } from "./supabaseRest";

// Alguien puede escribirle a Lucía "soy Ana, llamame al 2944 123456". La
// pregunta se guarda para saber QUÉ se pregunta, no quién: antes de insertarla
// se le sacan los mails y las tiras largas de números. El resto del texto queda
// tal cual, porque el valor está justamente en las palabras que usó la persona.
const RE_MAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
// Candidato a teléfono: una tira de dígitos que puede traer espacios, puntos,
// guiones o paréntesis en el medio. La decisión de tapar o no se toma después,
// en esTelefono(), porque acá también caen los precios.
const RE_NUMERO_LARGO = /\+?\d[\d\s.\-()]{5,}\d/g;
// Un precio escrito con separador de miles ("1.300.000", "12,000,000") NO se
// tapa: es el dato que da sentido a la pregunta. Un teléfono argentino tiene
// 8 dígitos o más y no respeta ese formato.
const RE_PRECIO = /^\+?\d{1,3}(?:[.,]\d{3})+$/;

function esTelefono(match) {
  const limpio = match.trim();
  if (RE_PRECIO.test(limpio)) return false;
  return limpio.replace(/\D/g, "").length >= 8;
}

export function limpiarPregunta(texto) {
  const base = String(texto || "").trim();
  if (!base) return "";
  return base
    .replace(RE_MAIL, "[mail]")
    .replace(RE_NUMERO_LARGO, (match) => (esTelefono(match) ? "[número]" : match))
    .replace(/\s+/g, " ")
    .slice(0, 600);
}

// Fire-and-forget desde la ruta: si esto falla, el visitante igual recibe su
// respuesta. Nunca lanza.
export async function registrarPregunta(row) {
  try {
    const pregunta = limpiarPregunta(row?.pregunta);
    if (!pregunta) return;
    await rest("lucia_preguntas", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        pregunta,
        answer_id: row.answerId || null,
        // `ruta` dice por donde fue la frase. Con "guiado" no hubo IA, asi que
        // `respondida` queda en null: no es que fallo, es que no aplica. Sin esa
        // distincion, la consulta de "las que fallaron" se llenaria de busquedas
        // que nunca intentaron responderse.
        ruta: row.ruta === "guiado" ? "guiado" : "ia",
        respondida: row.ruta === "guiado" ? null : Boolean(row.respondida),
        error: row.error || null,
        fuentes: Number(row.fuentes) || 0,
        page_path: row.pagePath || null,
        model: row.model || null,
        // Las pruebas de Milton se guardan igual —sirven para ver si el router
        // acerto— pero marcadas, para que no se cuenten como preguntas de un
        // visitante. Una prueba se escribe cinco veces seguidas: sin esto seria
        // el "tema" mas preguntado del panel.
        interno: Boolean(row.interno),
      }),
    });
  } catch (error) {
    console.error("[Lucía/preguntas]", error?.message || error);
  }
}
