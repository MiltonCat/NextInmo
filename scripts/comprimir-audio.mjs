// Comprime un audio (m4a/wav/mp3) a MP3 de calidad voz y lo deja en
// /public/podcast/<slug>.mp3, listo para registrar en lib/blogPosts.js.
//
// El audio crudo del TTS viene sobredimensionado (el primer episodio pesaba
// 40 MB). A 64 kbps mono la voz se escucha igual y queda en ~10 MB, que es lo
// que hace viable servir 12 episodios desde el repo.
//
// Uso: node scripts/comprimir-audio.mjs <entrada> <slug>
//   node scripts/comprimir-audio.mjs public/podcast.m4a bitcoin-ladrillos-patagonicos
//
// Imprime peso final y duración: la duración se copia a mano al campo
// `audio.duracion` del post en lib/blogPosts.js (no se lee en runtime).

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import ffmpeg from "ffmpeg-static";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "podcast");

// 64 kbps mono: suficiente para voz hablada, ~8x más liviano que el crudo.
const BITRATE = "64k";

const [entrada, slug] = process.argv.slice(2);

if (!entrada || !slug) {
  console.error("Uso: node scripts/comprimir-audio.mjs <entrada> <slug>");
  process.exit(1);
}

const entradaAbs = path.resolve(ROOT, entrada);
if (!existsSync(entradaAbs)) {
  console.error(`No existe el archivo de entrada: ${entradaAbs}`);
  process.exit(1);
}

// El slug define la URL del audio (/podcast/<slug>.mp3), así que tiene que
// coincidir con el `id` del post en lib/blogPosts.js.
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`Slug inválido: "${slug}". Usá minúsculas, números y guiones.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const salida = path.join(OUT_DIR, `${slug}.mp3`);

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

// ffmpeg escribe la duración en stderr, tanto al convertir como al fallar.
function duracionDesde(stderr) {
  const m = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, h, min, s] = m;
  const horas = Number(h);
  return horas > 0 ? `${horas}:${min}:${s}` : `${Number(min)}:${s}`;
}

const pesoEntrada = statSync(entradaAbs).size;
console.log(`Comprimiendo ${path.basename(entradaAbs)} (${mb(pesoEntrada)}) → ${slug}.mp3 …`);

try {
  const { stderr } = await execFileAsync(ffmpeg, [
    "-y",
    "-i", entradaAbs,
    "-vn",              // descarta cualquier carátula/video embebido
    "-ac", "1",         // mono: es voz, el estéreo solo duplica el peso
    "-b:a", BITRATE,
    "-codec:a", "libmp3lame",
    salida,
  ]);

  const pesoSalida = statSync(salida).size;
  const duracion = duracionDesde(stderr);
  const ahorro = Math.round((1 - pesoSalida / pesoEntrada) * 100);

  console.log(`\n✓ ${path.relative(ROOT, salida)}`);
  console.log(`  ${mb(pesoEntrada)} → ${mb(pesoSalida)}  (−${ahorro}%)`);
  if (duracion) console.log(`  duración: ${duracion}`);
  console.log(`\nRegistralo en lib/blogPosts.js, en el post "${slug}":`);
  console.log(`    audio: { duracion: "${duracion ?? "mm:ss"}", generado: "${new Date().toISOString().slice(0, 10)}" },`);
} catch (err) {
  console.error("ffmpeg falló:", err.stderr ?? err.message);
  process.exit(1);
}
