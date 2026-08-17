// Arma un video corto de una propiedad a partir de las fotos que ya tiene
// cargadas. No hace falta ir a filmar: toma la galería tal como está, le pone
// un movimiento lento de cámara (efecto Ken Burns), encadena las fotos con
// fundidos y cierra con una placa de datos (precio, m², dormitorios, barrio).
//
// Por qué: las fichas con video convierten bastante más que las de fotos
// sueltas, y el catálogo ya tiene las fotos pagas y subidas. Esto es el piso
// —el techo sigue siendo filmar con el celular—, pero se consigue hoy y sin
// volver a la propiedad.
//
// Uso:
//   node scripts/video-propiedad.mjs 4              (una propiedad)
//   node scripts/video-propiedad.mjs 4 6 107        (varias)
//   node scripts/video-propiedad.mjs --todas        (todo el catálogo)
//   node scripts/video-propiedad.mjs 4 --vertical   (además, 1080x1920 para
//                                                    reels y estados de WhatsApp)
//
// SEGURIDAD DE ARCHIVOS — importante, leer AGENTS.md:
// este script es de SOLO LECTURA sobre las fotos. Nunca renombra, mueve ni
// reescribe una imagen del catálogo, y no toca la base de datos. Lo único que
// escribe son archivos nuevos en public/videos/. Si algo sale mal, se borra
// esa carpeta y el sitio queda exactamente como estaba.

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import ffmpegStatic from "ffmpeg-static";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "videos");

// FFMPEG_PATH permite usar un ffmpeg del sistema (por ejemplo para probar en
// Linux/CI); por defecto usa el binario que ya trae el proyecto.
const FFMPEG = process.env.FFMPEG_PATH || ffmpegStatic;

// ── Parámetros del video ────────────────────────────────────────────────────
// 3 segundos por foto es el punto donde se alcanza a mirar sin aburrir. Con 5
// fotos + placa final el video queda en ~15s: entra entero en un scroll de
// celular y pesa poco.
const SEG_POR_FOTO = 3.0;
const FUNDIDO = 0.6;
const FPS = 30;
const MAX_FOTOS = 6;
const ANCHO = 1280;
const ALTO = 720;
const ANCHO_V = 1080;
const ALTO_V = 1920;

const COLOR_MARCA = "#E8325A"; // --color-primary-600 de globals.css

// ── Lectura de .env.local ───────────────────────────────────────────────────
// Los scripts sueltos no reciben las env vars de Next, hay que leer el archivo
// a mano (mismo criterio que scripts/revision-web-datos.mjs).
function leerEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(path.join(ROOT, file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in env)) env[key] = val;
    }
  }
  return env;
}

// ── Origen de las propiedades ───────────────────────────────────────────────
// La fuente de verdad es Supabase. Si no hay credenciales a mano (o la consulta
// falla) se cae al catálogo estático de data/properties.js, que alcanza para
// probar el script sin conexión.
async function traerPropiedades() {
  const env = { ...leerEnv(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    try {
      const res = await fetch(`${url}/rest/v1/properties?select=*`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        const filas = await res.json();
        if (Array.isArray(filas) && filas.length > 0) {
          console.log(`Catálogo: Supabase (${filas.length} propiedades)`);
          return filas;
        }
      } else {
        console.warn(`Supabase respondió ${res.status}; uso el catálogo local.`);
      }
    } catch (err) {
      console.warn(`No pude leer Supabase (${err.message}); uso el catálogo local.`);
    }
  }

  const { properties } = await import(path.join(ROOT, "data", "properties.js"));
  console.log(`Catálogo: data/properties.js (${properties.length} propiedades)`);
  return properties;
}

// Normaliza la galería igual que lib/photoImages.js: primero la columna
// `images` (array, formato nuevo u viejo) y si no está, los 5 campos legacy.
function fotosDe(prop) {
  const entradas =
    Array.isArray(prop.images) && prop.images.length > 0
      ? prop.images
      : [prop.image, prop.image1, prop.image2, prop.image3, prop.image4];

  return entradas
    .map((e) => {
      if (!e) return null;
      if (typeof e === "string") return e;
      if (typeof e === "object" && e.url) return e.url;
      return null;
    })
    .filter(Boolean);
}

// Resuelve cada foto a un archivo en disco. Las rutas locales (/imgs/...) se
// leen de public/; las URLs se descargan a una carpeta temporal. En ninguno de
// los dos casos se escribe sobre el original.
async function materializarFotos(urls, dirTmp) {
  const archivos = [];
  for (const [i, url] of urls.entries()) {
    const destino = path.join(dirTmp, `foto${i}.jpg`);
    try {
      if (/^https?:\/\//.test(url)) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await sharp(buf).jpeg({ quality: 92 }).toFile(destino);
      } else {
        const local = path.join(ROOT, "public", url.replace(/^\//, ""));
        if (!existsSync(local)) throw new Error("no existe en public/");
        await sharp(local).jpeg({ quality: 92 }).toFile(destino);
      }
      archivos.push(destino);
    } catch (err) {
      console.warn(`  · salteo una foto (${url}): ${err.message}`);
    }
  }
  return archivos;
}

// ── Placa final ─────────────────────────────────────────────────────────────
// Se dibuja como SVG y sharp la rasteriza. Va como última "foto" del slideshow,
// así el dato duro (precio, m², ubicación) queda fijo en la retina al terminar.
function escaparXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function textoPrecio(prop) {
  if (prop.modalidad === "alquiler_permanente" && prop.precioAlquilerARS) {
    return `$ ${Number(prop.precioAlquilerARS).toLocaleString("es-AR")} / mes`;
  }
  if (prop.price) return `USD ${Number(prop.price).toLocaleString("es-AR")}`;
  return "Consultar";
}

async function placaFinal(prop, destino, ancho, alto) {
  const vertical = alto > ancho;
  const esc = vertical ? ancho / 1080 : ancho / 1280;
  const px = (n) => Math.round(n * esc);

  const precio = escaparXml(textoPrecio(prop));
  const ubicacion = escaparXml(prop.location || "San Martín de los Andes");

  const datos = [
    prop.area > 0 ? `${prop.area} m²` : null,
    prop.bedrooms > 0 ? `${prop.bedrooms} dorm.` : null,
    prop.bathrooms > 0 ? `${prop.bathrooms} baños` : null,
  ].filter(Boolean).join("   ·   ");

  const cy = alto / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}">
  <rect width="${ancho}" height="${alto}" fill="#141414"/>
  <rect x="0" y="0" width="${ancho}" height="${px(8)}" fill="${COLOR_MARCA}"/>
  <g font-family="Segoe UI, Helvetica, Arial, sans-serif" text-anchor="middle" fill="#ffffff">
    <text x="${ancho / 2}" y="${cy - px(70)}" font-size="${px(34)}" fill="#c9c9c9" letter-spacing="${px(4)}">${ubicacion}</text>
    <text x="${ancho / 2}" y="${cy + px(20)}" font-size="${px(86)}" font-weight="700">${precio}</text>
    <text x="${ancho / 2}" y="${cy + px(90)}" font-size="${px(36)}" fill="#c9c9c9">${escaparXml(datos)}</text>
    <text x="${ancho / 2}" y="${alto - px(60)}" font-size="${px(30)}" fill="${COLOR_MARCA}" font-weight="600">catalanpropiedades.com.ar</text>
  </g>
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toFile(destino);
  return destino;
}

// ── Armado del video ────────────────────────────────────────────────────────
// Cada foto se agranda a más del doble del destino antes del zoompan: el filtro
// interpola sobre el original y, si se le da poca resolución, el zoom "tiembla".
// Con margen de sobra el movimiento sale limpio.
function ramaKenBurns(indice, ancho, alto) {
  const frames = Math.round(SEG_POR_FOTO * FPS);
  const zoomIn = indice % 2 === 0;
  const z = zoomIn
    ? `min(zoom+0.0009,1.12)`
    : `if(lte(zoom,1.0),1.12,max(1.001,zoom-0.0009))`;

  return (
    `[${indice}:v]scale=${ancho * 2}:${alto * 2}:force_original_aspect_ratio=increase,` +
    `crop=${ancho * 2}:${alto * 2},setsar=1,` +
    `zoompan=z='${z}':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${ancho}x${alto}:fps=${FPS},` +
    `trim=duration=${SEG_POR_FOTO},setpts=PTS-STARTPTS,format=yuv420p[v${indice}]`
  );
}

function cadenaFundidos(cantidad) {
  // offset del fundido k = k * (duración de foto − fundido). Con eso cada
  // transición arranca justo antes de que termine el clip anterior.
  const pasos = [];
  let previa = "[v0]";
  for (let k = 1; k < cantidad; k++) {
    const offset = (k * (SEG_POR_FOTO - FUNDIDO)).toFixed(3);
    const salida = k === cantidad - 1 ? "[vout]" : `[x${k}]`;
    pasos.push(`${previa}[v${k}]xfade=transition=fade:duration=${FUNDIDO}:offset=${offset}${salida}`);
    previa = `[x${k}]`;
  }
  return pasos;
}

async function generar(prop, fotos, { ancho, alto, destino }) {
  const total = (fotos.length * SEG_POR_FOTO - (fotos.length - 1) * FUNDIDO).toFixed(2);

  const entradas = fotos.flatMap((f) => ["-loop", "1", "-i", f]);
  const filtros = [
    ...fotos.map((_, i) => ramaKenBurns(i, ancho, alto)),
    ...cadenaFundidos(fotos.length),
  ].join(";");

  await execFileAsync(
    FFMPEG,
    [
      "-y",
      ...entradas,
      "-filter_complex", filtros,
      "-map", fotos.length > 1 ? "[vout]" : "[v0]",
      "-t", total,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      // faststart mueve el índice al principio: el navegador puede empezar a
      // reproducir sin bajar el archivo entero.
      "-movflags", "+faststart",
      "-an", // sin audio: los videos de ficha arrancan muteados igual
      destino,
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  );

  return total;
}

// Poster: el primer fotograma, para que la ficha muestre algo mientras el
// video carga (y para los navegadores que no autoreproducen).
async function generarPoster(video, destino) {
  await execFileAsync(FFMPEG, ["-y", "-i", video, "-frames:v", "1", "-q:v", "3", destino], {
    maxBuffer: 1024 * 1024 * 16,
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const vertical = args.includes("--vertical");
const todas = args.includes("--todas");
const ids = args.filter((a) => /^\d+$/.test(a)).map(Number);

if (!todas && ids.length === 0) {
  console.error(`Uso:
  node scripts/video-propiedad.mjs <id> [<id> ...] [--vertical]
  node scripts/video-propiedad.mjs --todas [--vertical]`);
  process.exit(1);
}

const catalogo = await traerPropiedades();
const elegidas = todas ? catalogo : catalogo.filter((p) => ids.includes(Number(p.id)));

if (elegidas.length === 0) {
  console.error(`No encontré ninguna propiedad con esos ids: ${ids.join(", ")}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";

let hechos = 0;
let salteados = 0;

for (const prop of elegidas) {
  const etiqueta = `#${prop.id} ${String(prop.title || "").slice(0, 55)}`;

  if (prop.vendida || prop.noDisponible || prop.status === "no_disponible") {
    console.log(`↷ ${etiqueta} — no disponible, la salteo`);
    salteados++;
    continue;
  }

  const urls = fotosDe(prop).slice(0, MAX_FOTOS - 1);
  if (urls.length < 2) {
    console.log(`↷ ${etiqueta} — necesita al menos 2 fotos (tiene ${urls.length})`);
    salteados++;
    continue;
  }

  console.log(`\n▸ ${etiqueta}`);
  const dirTmp = path.join(tmpdir(), `video-prop-${prop.id}-${Date.now()}`);
  mkdirSync(dirTmp, { recursive: true });

  try {
    const formatos = [
      { sufijo: "", ancho: ANCHO, alto: ALTO },
      ...(vertical ? [{ sufijo: "-vertical", ancho: ANCHO_V, alto: ALTO_V }] : []),
    ];

    // Las fotos se preparan una sola vez y se reusan en los dos formatos: lo
    // único que cambia entre horizontal y vertical es el encuadre del zoompan.
    const fotos = await materializarFotos(urls, dirTmp);
    if (fotos.length < 2) {
      console.warn(`  ✗ no pude preparar suficientes fotos`);
      salteados++;
      continue;
    }

    for (const fmt of formatos) {
      const placa = await placaFinal(prop, path.join(dirTmp, `placa${fmt.sufijo}.jpg`), fmt.ancho, fmt.alto);
      const secuencia = [...fotos, placa];

      const destino = path.join(OUT_DIR, `propiedad-${prop.id}${fmt.sufijo}.mp4`);
      const dur = await generar(prop, secuencia, { ancho: fmt.ancho, alto: fmt.alto, destino });

      if (!fmt.sufijo) {
        await generarPoster(destino, path.join(OUT_DIR, `propiedad-${prop.id}.jpg`));
      }

      console.log(`  ✓ ${path.relative(ROOT, destino)}  ${dur}s  ${mb(statSync(destino).size)}  (${secuencia.length} placas)`);
      hechos++;
    }
  } catch (err) {
    console.error(`  ✗ falló: ${err.stderr?.slice(-400) ?? err.message}`);
    salteados++;
  } finally {
    rmSync(dirTmp, { recursive: true, force: true });
  }
}

// Índice para que la ficha sepa qué propiedades tienen video sin adivinar
// nombres de archivo. Se lee en build/runtime; es un archivo nuevo, no toca
// la tabla properties.
const indice = {};
for (const prop of catalogo) {
  const base = path.join(OUT_DIR, `propiedad-${prop.id}.mp4`);
  if (existsSync(base)) {
    indice[prop.id] = {
      video: `/videos/propiedad-${prop.id}.mp4`,
      poster: existsSync(path.join(OUT_DIR, `propiedad-${prop.id}.jpg`)) ? `/videos/propiedad-${prop.id}.jpg` : null,
      vertical: existsSync(path.join(OUT_DIR, `propiedad-${prop.id}-vertical.mp4`))
        ? `/videos/propiedad-${prop.id}-vertical.mp4`
        : null,
    };
  }
}
writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(indice, null, 2) + "\n");

console.log(`\n${hechos} video(s) generado(s), ${salteados} salteada(s).`);
console.log(`Índice actualizado: public/videos/index.json (${Object.keys(indice).length} con video)`);
console.log(`\nNinguna foto original fue tocada. Para deshacer todo: borrá public/videos/`);
