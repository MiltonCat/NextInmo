// Precio del m² por barrio — derivado del modelo, no cargado a mano.
//
// ANTES (hasta 2026-08-09): este archivo tenía 13 filas `barrio × tipo` escritas
// a mano (Centro·Departamento 2.735, Chapelco Golf·Departamento 3.400, etc.).
// Ese cruce no existe en ningún lado: el modelo publica la mediana POR BARRIO y
// el valor POR TIPO, pero no "los departamentos del Centro". Las 13 filas eran
// una interpolación de la que nadie se acordaba, y ya se habían desincronizado
// del modelo hasta un 20% (Centro decía 2.735 contra una mediana real de 3.400).
//
// Es lo mismo que ya había pasado con el sitemap y con las tres listas de
// barrios. La solución es la misma: una sola fuente. Acá no hay números.
//
// Qué se publica y qué no: solo los barrios que el modelo marca `usable`
// (n >= 4). Con una o dos propiedades relevadas la mediana no significa nada y
// confunde más de lo que ayuda — mismo criterio que `referenciaBarrio()`.

import { M2_POR_BARRIO } from "@/lib/mercado";
import { BARRIOS } from "@/lib/barrios";

// El JSON del modelo nombra los barrios como vienen del scraping y el sitio usa
// nombres canónicos: "Chapelco Golf" acá es "Chapelco Golf & Resort" allá, y
// "Las Marías" es "Las Marias del Valle Club de Campo". No alcanza con
// normalizar acentos, así que el puente es explícito.
//
// Un slug que no está en este mapa simplemente no tiene dato del modelo, y la
// ficha de ese barrio muestra el rango editorial de su perfil. No se inventa.
const SLUG_A_MODELO = {
  centro: "Centro",
  "chapelco-golf": "Chapelco Golf & Resort",
  "la-cascada": "La Cascada",
  "vega-maipu": "Vega Maipu",
  "penon-de-lolog": "Peñon De Lolog",
  caleuche: "Caleuche",
  "las-marias": "Las Marias del Valle Club de Campo",
  "las-pendientes": "Las Pendientes Ski Village",
};

// "General" es el cajón donde caen las publicaciones sin barrio declarado
// (n=173, el segundo más grande). No es un lugar de San Martín: publicarlo en
// una tabla de barrios sería inventar una zona que no existe.
const NO_ES_BARRIO = new Set(["General", "Otro", "Sin especificar"]);

const MODELO_A_SLUG = new Map(
  Object.entries(SLUG_A_MODELO).map(([slug, nombre]) => [nombre, slug])
);

const NOMBRE_CANONICO = new Map(BARRIOS.map((b) => [b.slug, b.nombre]));

// Mediana del m² de un barrio del sitio, o null si el modelo no tiene datos
// suficientes. `n` viaja siempre con el número: un valor sin su respaldo es
// justo lo que hacía que estas cifras se pudieran desincronizar sin que nadie
// lo notara.
export function medianaDeBarrio(slug) {
  const nombreModelo = SLUG_A_MODELO[slug];
  if (!nombreModelo) return null;

  const b = M2_POR_BARRIO.find((x) => x.barrio === nombreModelo);
  if (!b || b.estado !== "usable") return null;

  return { medianaM2: b.mediana_m2_usd, n: b.n, fuente: b.barrio };
}

// Todos los barrios publicables, ordenados de más a menos datos. `slug` viene
// cargado solo cuando ese barrio además tiene ficha en el sitio — es lo que
// decide si la fila es un link o texto plano.
export function barriosConMediana() {
  return M2_POR_BARRIO.filter((b) => b.estado === "usable" && !NO_ES_BARRIO.has(b.barrio))
    .map((b) => {
      const slug = MODELO_A_SLUG.get(b.barrio) ?? null;
      return {
        slug,
        // Si el barrio existe en el sitio se muestra con su nombre canónico
        // ("Vega Maipú", con tilde); si no, con el nombre que trae el modelo.
        nombre: (slug && NOMBRE_CANONICO.get(slug)) || b.barrio,
        medianaM2: b.mediana_m2_usd,
        n: b.n,
      };
    })
    .sort((a, b) => b.n - a.n);
}

export default barriosConMediana;
