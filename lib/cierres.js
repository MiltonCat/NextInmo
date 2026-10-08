// Capa de datos de CIERRES (tabla `cierres`, ver docs/sql/cierres.sql).
// Etapa 3a de docs/plan-red-catalan.md: el precio real al que se cerró cada
// operación, que es el dato propio sobre el que se arma el informe de cierres.
//
// SOLO SERVIDOR: usa la clave secreta vía REST. La carga y el borrado van
// detrás de requireUser (app/admin/cierres).
import { rest } from "./supabaseRest";
import { BARRIO_SLUGS } from "./barrios";

const TABLE = "cierres";

export const TIPOS_CIERRE = [
  { valor: "casa", nombre: "Casa" },
  { valor: "departamento", nombre: "Departamento" },
  { valor: "cabana", nombre: "Cabaña" },
  { valor: "ph", nombre: "PH / Dúplex" },
  { valor: "lote", nombre: "Lote" },
  { valor: "local", nombre: "Local" },
];
const TIPOS_VALIDOS = new Set(TIPOS_CIERRE.map((t) => t.valor));
const FUENTES_VALIDAS = new Set(["propia", "corredor", "escribano"]);

// Ningún barrio se publica con menos de esta cantidad de cierres validados:
// con menos, alguien que conoce el barrio puede deducir cuál es cada operación.
export const MINIMO_POR_BARRIO = 5;

function numero(v) {
  if (v === null || v === undefined) return null;
  let limpio = String(v).trim().replace(/\s/g, "");
  if (!limpio) return null;
  // "150.000" y "150.000,5" llevan punto de miles; "120.5" es decimal.
  if (limpio.includes(",")) limpio = limpio.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) limpio = limpio.replace(/\./g, "");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : NaN;
}

// Valida y arma la fila a partir del formulario. Devuelve { fila } o { error }.
// Nunca rellena: lo que no se cargó queda en null.
export function filaDesdeFormulario(formData) {
  const get = (k) => String(formData.get(k) ?? "").trim();

  const barrio = get("barrio");
  if (!BARRIO_SLUGS.includes(barrio)) return { error: "Elegí un barrio de la lista." };

  const tipo = get("tipo");
  if (!TIPOS_VALIDOS.has(tipo)) return { error: "Elegí el tipo de propiedad." };

  const precioPublicado = numero(get("precio_publicado"));
  const precioCierre = numero(get("precio_cierre"));
  if (!(precioPublicado > 0)) return { error: "Falta el precio publicado (en USD, solo números)." };
  if (!(precioCierre > 0)) return { error: "Falta el precio de cierre (en USD, solo números)." };

  const fecha = get("fecha_cierre");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "Falta la fecha de cierre." };
  if (new Date(`${fecha}T00:00:00`) > new Date()) return { error: "La fecha de cierre no puede ser futura." };

  const opcionales = {};
  for (const [campo, entero] of [["m2_cubiertos", false], ["m2_terreno", false], ["dormitorios", true], ["dias_publicada", true]]) {
    const n = numero(get(campo));
    if (Number.isNaN(n) || (n !== null && n < 0)) return { error: `Revisá el campo ${campo.replace("_", " ")}: solo números.` };
    opcionales[campo] = n === null ? null : entero ? Math.round(n) : n;
  }
  if (opcionales.m2_cubiertos === 0) opcionales.m2_cubiertos = null;
  if (opcionales.m2_terreno === 0) opcionales.m2_terreno = null;

  const fuente = get("fuente") || "propia";
  if (!FUENTES_VALIDAS.has(fuente)) return { error: "Fuente inválida." };

  return {
    fila: {
      barrio,
      tipo,
      precio_publicado: precioPublicado,
      precio_cierre: precioCierre,
      fecha_cierre: fecha,
      ...opcionales,
      fuente,
      // Lo propio entra validado; lo de terceros se revisa a mano antes de contar.
      validado: fuente === "propia",
      referencia: get("referencia") || null,
      notas: get("notas") || null,
    },
  };
}

export async function getCierres() {
  return rest(`${TABLE}?select=*&order=fecha_cierre.desc,id.desc`);
}

export async function insertCierre(fila) {
  const data = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(fila),
  });
  return data?.[0] ?? null;
}

export async function deleteCierre(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// ── Cuentas ────────────────────────────────────────────────────────────────

// Cuánto por debajo del publicado se cerró, en % (positivo = se cerró abajo).
export function diferenciaPct(c) {
  const pub = Number(c.precio_publicado);
  const cie = Number(c.precio_cierre);
  if (!(pub > 0) || !(cie > 0)) return null;
  return ((pub - cie) / pub) * 100;
}

function mediana(valores) {
  const v = valores.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

// Resumen por barrio y total, solo con cierres validados.
export function resumenDeCierres(cierres = []) {
  const validados = cierres.filter((c) => c.validado);
  const grupos = new Map();
  for (const c of validados) {
    if (!grupos.has(c.barrio)) grupos.set(c.barrio, []);
    grupos.get(c.barrio).push(c);
  }
  const resumir = (lista) => ({
    n: lista.length,
    diferenciaMediana: mediana(lista.map(diferenciaPct)),
    diasMediana: mediana(lista.map((c) => (c.dias_publicada == null ? NaN : Number(c.dias_publicada)))),
    conDias: lista.filter((c) => c.dias_publicada != null).length,
    publicable: lista.length >= MINIMO_POR_BARRIO,
  });
  const porBarrio = [...grupos.entries()]
    .map(([barrio, lista]) => ({ barrio, ...resumir(lista) }))
    .sort((a, b) => b.n - a.n);
  return { total: resumir(validados), porBarrio, pendientes: cierres.length - validados.length };
}
