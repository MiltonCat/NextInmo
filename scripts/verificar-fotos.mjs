// Verificación de integridad de fotos por propiedad.
//
// POR QUÉ EXISTE ESTE SCRIPT
// En un sitio anterior de Milton, una migración de imágenes renombró archivos y
// las fotos terminaron cruzadas entre propiedades: la ficha de una casa mostraba
// las fotos de otra. Hubo que rehacer el catálogo a mano, foto por foto.
//
// Este script es el seguro contra eso. No mira la base de datos: mira lo que la
// página realmente devuelve, que es lo que el visitante ve. Entiende tanto un
// <img src="..."> común como el envoltorio /_next/image?url=... que genera
// next/image, y en los dos casos anota la URL original de la foto. Por eso los
// resultados de antes y después de migrar a next/image tienen que ser IDÉNTICOS:
// cambia el envoltorio, no la foto.
//
// USO
//   1. npm run dev   (en otra terminal, esperar a que levante)
//   2. node scripts/verificar-fotos.mjs docs/fotos-antes.txt
//   3. ...hacer el cambio de código...
//   4. node scripts/verificar-fotos.mjs docs/fotos-despues.txt
//   5. diff docs/fotos-antes.txt docs/fotos-despues.txt
//
// El paso 5 tiene que salir vacío. Si imprime aunque sea una línea, alguna foto
// cambió de propiedad: revertir el cambio y revisar.
//
// Opcional: BASE=https://catalanpropiedades.com.ar node scripts/verificar-fotos.mjs
// para verificar producción en vez del entorno local.

// Se habla con Supabase por HTTP directo (PostgREST) y no con @supabase/supabase-js
// a propósito: el cliente oficial levanta un canal de tiempo real que en Node 20
// necesita WebSocket nativo y revienta. Para leer una tabla alcanza con un fetch.
import { readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";

// --- Cargar .env.local sin depender de dotenv ---
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const linea of env.split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const i = limpia.indexOf("=");
    if (i === -1) continue;
    const clave = limpia.slice(0, i).trim();
    const valor = limpia.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[clave]) process.env[clave] = valor;
  }
} catch {
  console.error("No se pudo leer .env.local");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o la clave de Supabase en .env.local");
  process.exit(1);
}

// Saca la lista de propiedades de la base: solo para saber qué páginas visitar
// y con qué fotos comparar.
// select=* a propósito: la tabla no tiene exactamente las mismas columnas que el
// array de respaldo de data/properties.js (por ejemplo, "noDisponible" no existe
// en la base). Pedirlas por nombre haría fallar el script cada vez que cambie el
// esquema; pedir todo y leer lo que haya es más robusto para un verificador.
const consulta = `${url}/rest/v1/properties?select=*&order=sort_order.asc.nullslast`;

let propiedades;
try {
  const res = await fetch(consulta, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const texto = await res.text();
  if (!res.ok) {
    console.error(`Supabase respondió ${res.status}: ${texto}`);
    process.exit(1);
  }
  propiedades = JSON.parse(texto);
} catch (e) {
  console.error("No se pudo consultar Supabase:", e.message);
  process.exit(1);
}

if (!Array.isArray(propiedades) || propiedades.length === 0) {
  console.error("Supabase no devolvió propiedades. Abortado: un snapshot vacío no verifica nada.");
  process.exit(1);
}

// Índice global: qué propiedad es dueña de cada foto.
// No alcanza con reconocer las fotos por dónde están alojadas. El catálogo tiene
// dos generaciones conviviendo: las propiedades viejas guardan rutas locales
// (/imgs/Imgs9/casa5.webp, archivos de public/) y las nuevas, cargadas desde el
// panel, guardan URLs de Supabase. La única definición sólida de "foto del
// catálogo" es: una URL que la base le asigna a alguna propiedad.
const CAMPOS_FOTO = ["image", "image1", "image2", "image3", "image4"];
const duenoDeLaFoto = new Map();
for (const p of propiedades) {
  for (const campo of CAMPOS_FOTO) {
    if (p[campo] && !duenoDeLaFoto.has(p[campo])) duenoDeLaFoto.set(p[campo], p.id);
  }
}

// Una foto puede aparecer en el HTML de dos formas:
//   1. cruda:          /imgs/Imgs9/casa5.webp   o   https://...supabase.co/...
//   2. por next/image: /_next/image/?url=<la misma URL, codificada>&w=...&q=...
// Las dos apuntan a la misma foto. Normalizamos siempre a la forma cruda, así el
// resultado de antes y después de la migración es directamente comparable.
//
// Ojo con la barra antes del "?": el proyecto tiene trailingSlash:true en
// next.config.mjs, así que Next emite "/_next/image/?url=..." y no
// "/_next/image?url=...". La barra va como opcional para que el script sirva
// con y sin esa opción.
function desenvolver(src) {
  const limpia = src.replace(/&amp;/g, "&");
  const m = limpia.match(/\/_next\/image\/?\?[^"'\s]*?url=([^&"'\s]+)/);
  if (!m) return limpia;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return limpia;
  }
}

// Fotos del catálogo que el navegador realmente pinta: las que están dentro de
// una etiqueta <img>. Se ignora todo lo que no sea foto de alguna propiedad
// (logo, foto del asesor, iconos).
function fotosRenderizadas(html) {
  const encontradas = [];
  const tags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of tags) {
    for (const m of tag.matchAll(/\ssrc=["']([^"']+)["']/gi)) {
      const url = desenvolver(m[1]);
      if (duenoDeLaFoto.has(url) && !encontradas.includes(url)) encontradas.push(url);
    }
  }
  return encontradas;
}

// ¿La foto aparece en algún lugar del HTML, aunque no se haya pintado? Sirve
// para distinguir "no se dibujó" de "no está por ningún lado".
function apareceEnElHtml(html, foto) {
  return html.includes(foto) || html.includes(encodeURIComponent(foto));
}

// Las propiedades vendidas o no disponibles devuelven 404 a propósito
// (app/propiedades/[slug]/page.js llama a notFound()). No son un error: se saltean.
const publicadas = propiedades.filter(
  (p) => !p.vendida && !p.noDisponible && p.status !== "no_disponible",
);
const saltadas = propiedades.length - publicadas.length;

const lineas = [];
let totalFotos = 0;
let problemas = 0;
let htmlDeMuestra = null;

for (const p of publicadas) {
  const ruta = `${BASE}/propiedades/${p.id}/`;
  let html;
  try {
    const res = await fetch(ruta);
    if (!res.ok) {
      console.error(`  ! ${ruta} devolvió ${res.status}`);
      problemas++;
      continue;
    }
    html = await res.text();
  } catch (e) {
    console.error(`  ! No se pudo abrir ${ruta}: ${e.message}`);
    console.error("    ¿Está corriendo npm run dev?");
    process.exit(1);
  }

  if (htmlDeMuestra === null) htmlDeMuestra = html;

  const renderizadas = fotosRenderizadas(html);
  // Lo que la base dice que son las fotos de ESTA propiedad.
  const enBase = CAMPOS_FOTO.map((c) => p[c]).filter(Boolean);

  lineas.push(`# ${p.id} | ${p.title ?? "(sin título)"}`);
  for (const foto of renderizadas) {
    // La comprobación que importa: cada foto que la ficha pinta tiene que ser
    // una de las fotos que la base le asigna a esta propiedad.
    if (enBase.includes(foto)) {
      lineas.push(`${p.id}\tOK \t${foto}`);
    } else {
      // Es foto del catálogo pero de OTRA propiedad: exactamente el accidente
      // que este script existe para detectar.
      lineas.push(`${p.id}\tAJENA\t${foto}\t(es de la propiedad ${duenoDeLaFoto.get(foto)})`);
      problemas++;
    }
    totalFotos++;
  }
  // Fotos que la base tiene cargadas y la ficha no pinta.
  for (const foto of enBase) {
    if (renderizadas.includes(foto)) continue;
    // Distinguimos los dos casos: la foto no está en ningún lado (FALTA) o está
    // en los datos de la página pero no llegó a pintarse (SIN-PINTAR).
    const etiqueta = apareceEnElHtml(html, foto) ? "SIN-PINTAR" : "FALTA";
    lineas.push(`${p.id}\t${etiqueta}\t${foto}`);
    problemas++;
  }
  lineas.push("");
}

const salida = process.argv[2];
const texto = lineas.join("\n");

if (salida) {
  writeFileSync(salida, texto);
  console.log(`Snapshot escrito en ${salida}`);
} else {
  console.log(texto);
}

console.log(
  `\n${publicadas.length} propiedades publicadas · ${totalFotos} fotos pintadas en las fichas` +
    (saltadas ? `\n(${saltadas} vendidas o no disponibles: se saltean, su ficha da 404 a propósito)` : ""),
);

// Si no se encontró ni una sola foto, el problema casi seguro es del script y no
// del sitio. Guardamos el HTML de una ficha para poder mirarlo.
if (totalFotos === 0 && htmlDeMuestra) {
  const ruta = "docs/debug-ficha.html";
  writeFileSync(ruta, htmlDeMuestra);
  console.error(
    `\nNo se encontró NINGUNA foto en ninguna ficha. Eso apunta a un fallo del script,\n` +
      `no a fotos cruzadas. Guardé el HTML de una ficha en ${ruta} para revisarlo.`,
  );
  process.exit(1);
}

if (problemas > 0) {
  console.error(
    `\n*** ${problemas} problema(s). En el snapshot:\n` +
      `    AJENA      = la ficha muestra una foto de OTRA propiedad. Grave.\n` +
      `    SIN-PINTAR = la foto está en los datos de la página pero no se pintó.\n` +
      `    FALTA      = la foto no aparece por ningún lado. ***`,
  );
  process.exit(1);
}
console.log("Todas las fotos de cada ficha corresponden a esa propiedad.");
