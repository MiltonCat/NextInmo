// Distancias de cada barrio al centro y al lago. Las completa Milton: es
// conocimiento suyo del lugar y no se deduce de ningún dato del sitio. En San
// Martín la línea recta miente —el Peñón de Lolog está cerca en el mapa y a
// media hora de manejo—, así que van los minutos reales.
//
// CÓMO COMPLETARLO
//   auto: minutos manejando, número entero. null si no lo sabés.
//   aPie: minutos caminando, número entero. Poné null si nadie hace ese
//         trayecto a pie: es un dato tan útil como el número, y la ficha va a
//         decir "no es distancia caminable" en vez de inventar un tiempo.
//   lago.nombre: "Lácar", "Lolog", "Quilquihue"… el que le queda cerca.
//
// REGLA: lo que queda en null NO se dibuja ni se le pasa a Lucía. Un barrio a
// medio completar muestra lo que tiene y calla el resto — nunca un "aprox.".
// Ver nunca-inventar-datos.
//
// El centro de referencia es la Plaza San Martín.

export const DISTANCIAS_BARRIO = {
  // Centro
  "centro": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: "Lácar", auto: null, aPie: null },
  },
  // Chapelco Golf
  "chapelco-golf": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // La Cascada
  "la-cascada": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Vega Maipú
  "vega-maipu": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Peñón de Lolog
  "penon-de-lolog": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: "Lolog", auto: null, aPie: null },
  },
  // Caleuche
  "caleuche": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Costanera
  "costanera": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Las Marías
  "las-marias": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Las Pendientes
  "las-pendientes": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Vía Blanca
  "via-blanca": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Arrayán
  "arrayan": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Lácar
  "lacar": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Patagonia Norte
  "patagonia-norte": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Vega San Martín
  "vega-san-martin": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Orillas del Quilquihue
  "orillas-del-quilquihue": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // San Fernando
  "san-fernando": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Las Nalcas
  "las-nalcas": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
  // Ruca Hue
  "ruca-hue": {
    alCentro: { auto: null, aPie: null },
    alLago: { nombre: null, auto: null, aPie: null },
  },
};

const vacio = { alCentro: { auto: null, aPie: null }, alLago: { nombre: null, auto: null, aPie: null } };

// Devuelve solo lo cargado. Un barrio sin nada devuelve null, así quien lo
// consume no tiene que preguntar si hay dato: si es null, no dibuja la sección.
export function getDistancias(slug) {
  const d = DISTANCIAS_BARRIO[slug] || vacio;
  const centro = {};
  if (Number.isFinite(d.alCentro?.auto)) centro.autoMin = d.alCentro.auto;
  if (Number.isFinite(d.alCentro?.aPie)) centro.aPieMin = d.alCentro.aPie;

  const lago = {};
  if (d.alLago?.nombre) lago.nombre = d.alLago.nombre;
  if (Number.isFinite(d.alLago?.auto)) lago.autoMin = d.alLago.auto;
  if (Number.isFinite(d.alLago?.aPie)) lago.aPieMin = d.alLago.aPie;

  const hayCentro = Object.keys(centro).length > 0;
  // El nombre del lago solo no alcanza: sin ningún tiempo no hay distancia que contar.
  const hayLago = lago.autoMin !== undefined || lago.aPieMin !== undefined;
  if (!hayCentro && !hayLago) return null;

  return {
    ...(hayCentro ? { centro } : {}),
    ...(hayLago ? { lago } : {}),
    referencia: "Minutos aproximados desde la Plaza San Martín.",
  };
}

// Frase lista para mostrar o para pasarle a un asistente. Devuelve null si no
// hay nada que decir.
export function textoDistancias(slug) {
  const d = getDistancias(slug);
  if (!d) return null;
  const partes = [];
  if (d.centro) {
    const modos = [
      d.centro.autoMin !== undefined ? `${d.centro.autoMin} min en auto` : null,
      d.centro.aPieMin !== undefined ? `${d.centro.aPieMin} min a pie` : null,
    ].filter(Boolean);
    partes.push(`Al centro: ${modos.join(" · ")}`);
  }
  if (d.lago) {
    const modos = [
      d.lago.autoMin !== undefined ? `${d.lago.autoMin} min en auto` : null,
      d.lago.aPieMin !== undefined ? `${d.lago.aPieMin} min a pie` : null,
    ].filter(Boolean);
    partes.push(`Al lago${d.lago.nombre ? ` ${d.lago.nombre}` : ""}: ${modos.join(" · ")}`);
  }
  return partes.join(". ") + ".";
}

export default DISTANCIAS_BARRIO;
