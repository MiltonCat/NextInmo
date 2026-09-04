// Agrupa por tema las preguntas que le hacen a Lucía. Es lo que convierte la
// lista de `lucia_preguntas` en una cola de contenido: veinte preguntas sueltas
// no dicen nada, "nueve de alquiler esta semana" sí.
//
// Sin IA y sin llamadas: son palabras de una persona buscando una casa en San
// Martín, no lenguaje abierto. Una lista de raíces alcanza, se lee de un vistazo
// y —lo que importa— Milton la puede corregir cuando vea un tema mal puesto.
//
// Se compara por RAÍZ, no por palabra entera: "alquil" atrapa alquiler,
// alquilar, alquileres y alquilo. Por eso las raíces van cortas y sin acento.

// El orden desempata cuando una pregunta toca dos temas: gana el de más arriba.
// "Temporario" va primero a propósito — la casa no lo opera (ver la nota
// lucia-que-opera-la-casa), así que una pregunta así es una derivación perdida
// y no un alquiler más.
export const TEMAS = [
  {
    id: "temporario",
    label: "Temporario",
    raices: ["temporari", "por dia", "por noche", "fin de semana", "airbnb", "vacacion", "verano", "temporada"],
  },
  {
    id: "financiacion",
    label: "Financiación",
    raices: ["credito", "hipotec", "cuota", "financ", " uva", "prestamo", "banco"],
  },
  {
    id: "gastos",
    label: "Gastos y escritura",
    raices: ["escritur", "sellado", "impuesto", "gasto", "comision", "honorario", "iti", "ganancias", "boleto", "posesion", "sucesion"],
  },
  {
    id: "precios",
    label: "Precios y tasación",
    raices: ["precio", "m2", "metro cuadrado", "cuanto vale", "cuanto sale", "cuanto cuesta", "tasac", "tasar", "cotiza", "valor de"],
  },
  {
    id: "inversion",
    label: "Inversión",
    raices: ["invers", "invertir", "rentabilidad", "renta anual", "revalor"],
  },
  {
    id: "alquiler",
    label: "Alquiler",
    raices: ["alquil", "garantia", "expensa", "contrato de locacion", "inquilino"],
  },
  {
    id: "operacion",
    label: "Comprar / vender",
    raices: ["comprar", "compro", "compra ", "vender", "vendo", "venta", "permuta"],
  },
  {
    id: "barrios",
    label: "Barrios y zonas",
    raices: ["barrio", "zona", "loteo", "chapelco", "cascada", "vega maipu", "pinares", "chacra"],
  },
  {
    id: "propiedades",
    label: "Qué hay disponible",
    raices: ["casa", "departamento", "depto", "terreno", "lote", "cabana", "dormitorio", "ambiente", "cochera", "galpon", "local"],
  },
];

export const SIN_CLASIFICAR = { id: "sin_clasificar", label: "Sin clasificar" };

// Minúsculas y sin acentos: la gente escribe "cuánto" y "cuanto" por igual, y
// una raíz que dependa del acento se pierde la mitad de las preguntas.
export function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Devuelve el id del tema, o "sin_clasificar". Gana el que más raíces toca; a
// igual cantidad, el que está más arriba en TEMAS.
export function temaDePregunta(texto) {
  const limpio = " " + normalizar(texto) + " ";
  if (limpio.trim() === "") return SIN_CLASIFICAR.id;
  let mejor = null;
  let mejorPuntaje = 0;
  for (const tema of TEMAS) {
    let puntaje = 0;
    for (const raiz of tema.raices) if (limpio.includes(raiz)) puntaje++;
    if (puntaje > mejorPuntaje) {
      mejor = tema.id;
      mejorPuntaje = puntaje;
    }
  }
  return mejor ?? SIN_CLASIFICAR.id;
}

export function etiquetaDeTema(id) {
  if (id === SIN_CLASIFICAR.id) return SIN_CLASIFICAR.label;
  return TEMAS.find((t) => t.id === id)?.label ?? id;
}

// Cuenta cuántas preguntas cayeron en cada tema, de mayor a menor. Los temas sin
// una sola pregunta no aparecen: un cero no es una señal, es ruido en la fila.
// "Sin clasificar" va siempre último aunque sea el más grande — es la pila de
// pendientes de esta función, no un tema.
export function contarPorTema(preguntas = []) {
  const cuenta = new Map();
  for (const p of preguntas) {
    const id = temaDePregunta(p?.pregunta);
    cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
  }
  const filas = [];
  for (const tema of TEMAS) {
    const cantidad = cuenta.get(tema.id) ?? 0;
    if (cantidad > 0) filas.push({ id: tema.id, label: tema.label, cantidad });
  }
  filas.sort((a, b) => b.cantidad - a.cantidad);
  const sueltas = cuenta.get(SIN_CLASIFICAR.id) ?? 0;
  if (sueltas > 0) filas.push({ id: SIN_CLASIFICAR.id, label: SIN_CLASIFICAR.label, cantidad: sueltas });
  return filas;
}
