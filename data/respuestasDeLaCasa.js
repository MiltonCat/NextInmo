// LO QUE CONTESTA LA CASA — respuestas escritas por Milton.
//
// ─────────────────────────────────────────────────────────────────────────────
// EN QUÉ SE DIFERENCIA DE data/vozDeLucia.js
//
//   vozDeLucia.js        le enseña CÓMO decirlo (tono, ritmo, muletillas).
//   respuestasDeLaCasa   le enseña QUÉ decir. Es tu palabra, no una deducción.
//
// Cuando veas a Lucía contestar algo flojo, escribí acá la respuesta buena. Se
// corrige una vez y queda aprendida. Es acumulativo: el archivo crece con cada
// cosa que la viste errar.
//
// ─────────────────────────────────────────────────────────────────────────────
// CÓMO SE USA
//
// Estas respuestas NO viajan en todas las consultas. Se indexan junto con el
// resto del sitio y Lucía trae la que se parece a lo que le preguntaron. Por eso
// podés tener cincuenta sin que cueste más ni la confundas: solo aparece la que
// viene al caso.
//
// Contra: hay que reindexar para que entren. `npm run indexar-sitio`, o esperar
// al cron de la mañana.
//
// ─────────────────────────────────────────────────────────────────────────────
// CÓMO AGREGAR UNA
//
//   {
//     id: "comision",                       // corto, sin espacios, único y estable
//     pregunta: "¿Cuánto cobran de comisión?",
//     respuesta: "...",                     // como se lo dirías a un cliente
//     href: "/vender/",                     // opcional: página para ampliar
//   },
//
// El `id` es la identidad de la respuesta en el índice. Si lo cambiás, se
// indexa como una nueva y la vieja queda dando vueltas hasta el próximo
// reindexado completo. Cambiá el texto todo lo que quieras; el id, no.
//
// La `pregunta` no es un disparador exacto: se busca por significado. No hace
// falta anticipar cómo la va a escribir la gente — ese problema ya está resuelto.
//
// ─────────────────────────────────────────────────────────────────────────────
// LO QUE HAY QUE TENER EN CUENTA
//
// Lucía va a dar esto como palabra de la casa, con tu autoridad detrás. Eso es
// justamente para lo que sirve, y también el cuidado que hay que tener:
//
// - Preferí CRITERIOS antes que CIFRAS. Un criterio ("los lotes en zona de
//   expansión se valorizan más a la larga, pero tardan en venderse") sigue
//   siendo verdad el año que viene. Un número no.
// - Si igual ponés una cifra, se vuelve tuya para mantener. Nadie te va a
//   avisar cuando quede vieja, y Lucía la va a repetir con seguridad.
// - Los datos que ya salen del modelo —el m², las medianas por barrio, el
//   catálogo— NO van acá. Esos ya llegan solos y actualizados.
// ─────────────────────────────────────────────────────────────────────────────

export const RESPUESTAS_DE_LA_CASA = [
  // Vacío a propósito: una respuesta escrita por mí no sería la palabra de la
  // casa, sería una invención con la firma de Milton. Las escribe él.
];

// Se exporta armado para que el indexador no tenga que conocer la forma de cada
// entrada, y para filtrar en un solo lugar las que quedaron a medio escribir.
export function respuestasIndexables() {
  return RESPUESTAS_DE_LA_CASA
    .filter((item) => item?.id && item?.pregunta && item?.respuesta)
    .map((item) => ({
      id: String(item.id).trim(),
      pregunta: String(item.pregunta).trim(),
      respuesta: String(item.respuesta).trim(),
      href: item.href ? String(item.href).trim() : null,
    }));
}
