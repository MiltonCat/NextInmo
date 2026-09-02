// CÓMO HABLA LUCÍA — ejemplos de tono escritos por Milton.
//
// ─────────────────────────────────────────────────────────────────────────────
// PARA QUÉ SIRVE ESTE ARCHIVO
//
// Describirle a un modelo "sé cálida y natural" produce calidez genérica: la
// misma que produciría en cualquier inmobiliaria del mundo. Mostrarle tres
// respuestas escritas por vos produce TU voz. Los adjetivos dan un promedio;
// los ejemplos dan una persona.
//
// Lo que el modelo copia de acá es CÓMO hablás: por dónde arrancás, cuánto te
// extendés, tus muletillas, que separes "para vivir" de "para invertir" antes
// de tirar un número, que no uses signos de exclamación.
//
// ─────────────────────────────────────────────────────────────────────────────
// CÓMO AGREGAR UNO
//
// Escribí la respuesta como se la mandarías a alguien por WhatsApp. No la
// corrijas, no te pongas en modo folleto. Si te sale con un error de tipeo,
// mejor: lo que se está copiando es cómo hablás, no cómo redactás.
//
//   { pregunta: "...", respuesta: "..." },
//
// Guardá, `git push`, y listo. No hay que tocar nada más.
//
// ─────────────────────────────────────────────────────────────────────────────
// LO ÚNICO IMPORTANTE
//
// Los NÚMEROS de estos ejemplos no se usan. Lucía copia el tono y saca los
// datos del contexto en vivo (el m² del modelo, el catálogo, las notas del
// sitio). Si acá escribís "el m² está en 2.800" y el mes que viene está en
// 3.000, Lucía va a decir 3.000: este archivo no le enseña cifras.
//
// Aun así, escribilos bien. Un ejemplo con un dato disparatado le enseña a
// hablar con seguridad de cosas que no sabe, que es exactamente lo que no
// queremos.
//
// Con 5 o 6 alcanza. Más de 8 no mejora el tono y encarece cada consulta.
// ─────────────────────────────────────────────────────────────────────────────

export const VOZ_DE_LUCIA = [
  // Ejemplo del formato, comentado a propósito: hasta que no haya respuestas
  // escritas por Milton, este archivo va vacío. Poner una respuesta inventada
  // acá sería enseñarle a Lucía una voz que no es la de nadie.
  //
  // {
  //   pregunta: "¿Conviene comprar ahora o esperar?",
  //   respuesta:
  //     "Mirá, si es para vivir no esperes nada. Acá el m² no baja...",
  // },
];

// Tope duro: más ejemplos no mejoran el tono y cada uno viaja en TODAS las
// consultas. Se cortan acá y no en el prompt para que el límite se vea al lado
// de la lista, cuando alguien está agregando el noveno.
export const MAX_EJEMPLOS = 8;

export function bloqueDeVoz() {
  const ejemplos = VOZ_DE_LUCIA
    .filter((item) => item?.pregunta && item?.respuesta)
    .slice(0, MAX_EJEMPLOS);
  if (!ejemplos.length) return "";

  return `\n\nASÍ CONTESTA LA CASA (ejemplos de TONO, no de contenido)
Copiá el ritmo, el vocabulario y la forma de arrancar. Los datos salen del CONTEXTO CATALÁN, nunca de estos ejemplos: sus números pueden estar viejos.

${ejemplos.map((item) => `— Le preguntan: ${item.pregunta}\n  Contesta: ${item.respuesta}`).join("\n\n")}`;
}
