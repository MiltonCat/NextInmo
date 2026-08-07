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

import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

// Saca la lista de propiedades de la base: solo para saber qué páginas visitar.
const client = createClient(url, key, { auth: { persistSession: false } });
const { data: propiedades, error } = await client
  .from("properties")
  .select("id, title, image, image1, image2, image3, image4")
  .order("sort_order", { ascending: true, nullsFirst: false });

if (error) {
  console.error("Error leyendo Supabase:", error.message);
  process.exit(1);
}
if (!propiedades || propiedades.length === 0) {
  console.error("Supabase no devolvió propiedades. Abortado: un snapshot vacío no verifica nada.");
  process.exit(1);
}

// next/image sirve las fotos a través de /_next/image?url=<original>&w=...&q=...
// Desenvolvemos ese formato para quedarnos siempre con la URL original.
function urlOriginal(src) {
  if (!src) return null;
  const limpia = src.replace(/&amp;/g, "&");
  const match = limpia.match(/\/_next\/image\?[^"']*?url=([^&"']+)/);
  if (match) return decodeURIComponent(match[1]);
  return limpia;
}

// Extrae los src de todas las etiquetas <img> del HTML, en orden de aparición.
// (next/image también termina renderizando un <img> en el HTML final.)
function fotosDelHtml(html) {
  const encontradas = [];
  const regex = /<img\b[^>]*?\ssrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const original = urlOriginal(m[1]);
    if (!original) continue;
    // Ignoramos los assets fijos del sitio (logo, foto del asesor, etc.):
    // acá nos importan las fotos del catálogo, que viven en Supabase.
    if (!original.includes("/storage/v1/object/public/")) continue;
    if (!encontradas.includes(original)) encontradas.push(original);
  }
  return encontradas;
}

const lineas = [];
let totalFotos = 0;
let problemas = 0;

for (const p of propiedades) {
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

  const enPagina = fotosDelHtml(html);
  // Lo que la base dice que son las fotos de ESTA propiedad.
  const enBase = [p.image, p.image1, p.image2, p.image3, p.image4].filter(Boolean);

  lineas.push(`# ${p.id} | ${p.title ?? "(sin título)"}`);
  for (const foto of enPagina) {
    // La comprobación que importa: cada foto que aparece en la ficha tiene que
    // ser una de las fotos que la base le asigna a esta propiedad.
    const corresponde = enBase.includes(foto);
    if (!corresponde) problemas++;
    lineas.push(`${p.id}\t${corresponde ? "OK " : "AJENA"}\t${foto}`);
    totalFotos++;
  }
  // Fotos que la base tiene cargadas y la página no muestra.
  for (const foto of enBase) {
    if (!enPagina.includes(foto)) {
      lineas.push(`${p.id}\tFALTA\t${foto}`);
      problemas++;
    }
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

console.log(`\n${propiedades.length} propiedades · ${totalFotos} fotos encontradas en las fichas`);
if (problemas > 0) {
  console.error(`\n*** ${problemas} problema(s): buscá las líneas AJENA o FALTA en el snapshot. ***`);
  process.exit(1);
}
console.log("Todas las fotos de cada ficha corresponden a esa propiedad.");
