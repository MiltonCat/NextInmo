// La tasación que la persona acaba de hacer viaja del navegador hasta el chat,
// así que vuelve a entrar al servidor como cualquier otra entrada de afuera:
// acá se valida campo por campo contra los mismos límites del tasador y se
// descarta en silencio todo lo que no cierre. Lo que sobrevive es lo único que
// Lucía puede afirmar sobre ese resultado.
//
// Función pura y sin dependencias de servidor: se prueba con node, sin red y
// sin base (tests/luciaTasacion.test.mjs).
import { EXTRAS_TASADOR, LIMITES, TIPOS_TASADOR } from "./tasadorOpciones.js";

const TIPOS = new Set(TIPOS_TASADOR.map((tipo) => tipo.valor));
const ETIQUETAS_EXTRA = new Set(EXTRAS_TASADOR.map((extra) => extra.label));

// Techos de cordura. No son reglas del negocio: son el corte para que un objeto
// armado a mano en la consola no meta un valor absurdo en el contexto del modelo.
const TOPE_USD = 50_000_000;
const TOPE_M2_USD = 100_000;

const texto = (valor, max) => String(valor ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function numero(valor, { min = 0, max = Infinity } = {}) {
  const n = Number(valor);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function entero(valor, limites) {
  const n = numero(valor, limites);
  return n === null ? null : Math.round(n);
}

// El modelo informa su error como fracción (0,161) o ya en porcentaje (16,1)
// según la versión. Es la misma lectura que hace la pantalla del resultado:
// atarse a una sola forma es publicar "0,2 % de error" el día que cambie.
export function errorEnPorcentaje(valor) {
  const n = numero(valor, { min: 0, max: 100 });
  if (n === null || n <= 0) return null;
  return Number((n < 1 ? n * 100 : n).toFixed(1));
}

export function normalizarTasacion(entrada) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) return null;

  const tipo = texto(entrada.tipo, 40);
  const barrio = texto(entrada.barrio, 120);
  const valorTotal = numero(entrada.valorTotal, { min: 1, max: TOPE_USD });
  // Sin tipo, barrio y valor no hay tasación que explicar. Se devuelve null y la
  // conversación sigue como una charla común: es preferible a que Lucía hable de
  // "tu tasación" con la mitad de los datos.
  if (!TIPOS.has(tipo) || !barrio || valorTotal === null) return null;

  const rangoMin = numero(entrada.rangoMin, { min: 1, max: TOPE_USD });
  const rangoMax = numero(entrada.rangoMax, { min: 1, max: TOPE_USD });
  const valorM2 = numero(entrada.valorM2, { min: 1, max: TOPE_M2_USD });
  const medianaBarrio = numero(entrada.medianaBarrio, { min: 1, max: TOPE_M2_USD });
  const terreno = numero(entrada.superficieTerreno, LIMITES.terreno);

  const advertencias = Array.isArray(entrada.advertencias)
    ? entrada.advertencias.map((aviso) => texto(aviso, 240)).filter(Boolean).slice(0, 4)
    : [];

  return {
    tipo,
    barrio,
    superficieCubiertaM2: numero(entrada.superficie, LIMITES.superficie),
    superficieTerrenoM2: terreno && terreno > 0 ? Math.round(terreno) : null,
    dormitorios: entero(entrada.dormitorios, LIMITES.dormitorios),
    banos: entero(entrada.banos, LIMITES.banos),
    ambientes: entero(entrada.ambientes, LIMITES.ambientes),
    extras: Array.isArray(entrada.extras)
      ? entrada.extras.map((extra) => texto(extra, 40)).filter((extra) => ETIQUETAS_EXTRA.has(extra)).slice(0, 8)
      : [],
    valorEstimadoUSD: Math.round(valorTotal),
    // El rango se cae entero si no es coherente: medio rango es peor que ninguno,
    // porque el modelo igual lo diría como si fuera el margen real.
    rangoUSD: rangoMin !== null && rangoMax !== null && rangoMin < rangoMax
      ? { min: Math.round(rangoMin), max: Math.round(rangoMax) }
      : null,
    valorM2USD: valorM2 === null ? null : Math.round(valorM2),
    errorPromedioPct: errorEnPorcentaje(entrada.errorPromedioPct),
    nEntrenamiento: entero(entrada.nEntrenamiento, { min: 1, max: 1_000_000 }),
    medianaBarrioM2USD: medianaBarrio === null ? null : Math.round(medianaBarrio),
    nBarrioRelevadas: entero(entrada.nBarrio, { min: 1, max: 100_000 }),
    // El desvío se calcula acá y no lo manda el navegador: es el dato con el que
    // Lucía lee el caso, y no tiene por qué depender de una cuenta hecha afuera.
    desvioVsMedianaPct: valorM2 !== null && medianaBarrio !== null
      ? Number((((valorM2 - medianaBarrio) / medianaBarrio) * 100).toFixed(1))
      : null,
    advertenciasDelModelo: advertencias,
  };
}
