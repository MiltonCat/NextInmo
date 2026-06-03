// Convierte JPG/JPEG/PNG de /public a WebP al lado (sin borrar originales).
// Uso: node scripts/convert-to-webp.mjs

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const QUALITY = 80;

const SOURCE_EXT = /\.(jpe?g|png)$/i;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && SOURCE_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

function fmtKB(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

const start = Date.now();
const files = await walk(PUBLIC_DIR);
console.log(`Encontradas ${files.length} imágenes en /public\n`);

let converted = 0;
let skipped = 0;
let failed = 0;
let totalIn = 0;
let totalOut = 0;

for (const file of files) {
  const webp = file.replace(SOURCE_EXT, ".webp");
  if (existsSync(webp)) {
    skipped++;
    continue;
  }
  try {
    const inStat = await stat(file);
    await sharp(file).webp({ quality: QUALITY }).toFile(webp);
    const outStat = await stat(webp);
    totalIn += inStat.size;
    totalOut += outStat.size;
    converted++;
    if (converted % 25 === 0) {
      process.stdout.write(`  ${converted}/${files.length}...\n`);
    }
  } catch (err) {
    failed++;
    console.error(`  ✗ ${path.relative(PUBLIC_DIR, file)}: ${err.message}`);
  }
}

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const reduction = totalIn > 0 ? (100 - (totalOut / totalIn) * 100).toFixed(1) : 0;

console.log("\n─────────── Resultado ───────────");
console.log(`Convertidas:    ${converted}`);
console.log(`Ya existían:    ${skipped}`);
console.log(`Fallidas:       ${failed}`);
console.log(`Peso original:  ${(totalIn / 1024 / 1024).toFixed(1)} MB`);
console.log(`Peso WebP:      ${(totalOut / 1024 / 1024).toFixed(1)} MB`);
console.log(`Reducción:      ${reduction}%`);
console.log(`Tiempo:         ${elapsed}s`);
