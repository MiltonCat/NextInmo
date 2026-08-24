// Capa de acceso a datos de DESARROLLOS INMOBILIARIOS.
//
// Mismo criterio que `lib/properties.js`: intenta leer de Supabase y, si la base
// no responde o todavía no existe la tabla, cae al array estático de
// `data/developments.js`. La sección nunca queda vacía por un problema de red.
//
// La tabla `developments` NO está creada todavía. Mientras no exista, todo el
// sitio se sirve del respaldo estático y no hace falta tocar la base para nada.
// Cuando la crees, los nombres de columna tienen que coincidir con los campos
// que usa `data/developments.js`.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  developments as fallbackDevelopments,
  getDevelopmentSlug,
} from "@/data/developments";
import { marcarDegradado } from "@/lib/salud";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _client = null;
function getClient() {
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

// Campos que tienen que ser número aunque la base los devuelva como texto.
const NUMERIC_FIELDS = [
  "id", "avance", "precioDesde", "precioM2Desde",
  "unidadesTotales", "unidadesDisponibles", "lat", "lng",
];

// Campos que el código recorre como array. Si vienen null desde la base, un
// `.map()` más adelante rompe la página entera.
const ARRAY_FIELDS = ["gallery", "tipologias", "amenities", "etapas", "fichaTecnica"];

function normalize(row) {
  const out = { ...row };
  for (const f of NUMERIC_FIELDS) {
    if (out[f] === null || out[f] === undefined || out[f] === "") continue;
    const n = Number(out[f]);
    out[f] = Number.isNaN(n) ? out[f] : n;
  }
  for (const f of ARRAY_FIELDS) {
    if (!Array.isArray(out[f])) out[f] = [];
  }
  return out;
}

export async function getDevelopments() {
  const client = getClient();
  if (!client) return fallbackDevelopments;

  const { data, error } = await client
    .from("developments")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });

  if (error || !data || data.length === 0) {
    // Que la tabla no exista todavía es el caso esperado, no un incidente: va
    // marcado como tal para que no ensucie los logs ni dispare alertas. Cuando
    // la tabla exista, este `esperado: true` hay que sacarlo — a partir de ahí
    // un error acá sí es un incidente.
    if (error) {
      marcarDegradado("developments", `sin tabla en Supabase: ${error.message}`, { esperado: true });
    }
    return fallbackDevelopments;
  }
  return data.map(normalize);
}

export async function getDevelopmentById(id) {
  const all = await getDevelopments();
  return all.find((d) => Number(d.id) === Number(id)) ?? null;
}

// Resuelve por slug descriptivo ("terrazas-del-chapelco-1") o por id suelto.
export async function getDevelopmentBySlug(slug) {
  const match = String(slug).match(/(\d+)$/);
  if (!match) return null;
  return getDevelopmentById(parseInt(match[1], 10));
}

// Un desarrollo se considera publicable salvo que esté explícitamente agotado
// (unidadesDisponibles === 0) u oculto. Que todavía no sepamos cuántas unidades
// quedan (null) NO lo saca de circulación: así se carga un emprendimiento el
// primer día, antes de que el desarrollador pase la lista de disponibilidad.
export function estaDisponible(development) {
  return development.unidadesDisponibles !== 0 && !development.oculto;
}

// Saca del objeto los campos que son de uso INTERNO y no se publican.
//
// No alcanza con no dibujarlos en el componente: todo lo que una página server
// le pasa a un componente cliente viaja igual al navegador, serializado en el
// payload de React, y se lee en "ver código fuente". Antes de este filtro, la
// ficha no mostraba el sitio de Lugares del Sur pero lo mandaba igual, junto
// con su Instagram, sus tres oficinas y el enlace a la ficha del proyecto en
// su propio sitio.
//
// Catalán Propiedades vende estos lotes y cobra comisión del desarrollador: el
// camino para comprar sin nosotros no se publica ni en pantalla ni en el HTML.
// Los datos siguen enteros en la base y en data/developments.js — se usan para
// verificar de dónde salió cada número, del lado del servidor.
const CAMPOS_INTERNOS_DESARROLLADOR = ["web", "instagram", "oficinas", "proyectos"];

export function paraPublicar(development) {
  if (!development) return development;
  const out = { ...development };

  if (out.desarrolladorInfo) {
    const info = { ...out.desarrolladorInfo };
    for (const campo of CAMPOS_INTERNOS_DESARROLLADOR) delete info[campo];
    out.desarrolladorInfo = info;
  }

  // De la fuente se publica que existe y cuándo se relevó, no su URL: ese
  // enlace lleva a la única página donde el comprador ve estos mismos precios
  // sin nosotros en el medio.
  if (out.fuente) {
    const { url, ...resto } = out.fuente;
    out.fuente = resto;
  }

  return out;
}

export { getDevelopmentSlug };
