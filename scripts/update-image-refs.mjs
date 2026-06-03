// Reemplaza referencias .jpg/.jpeg → .webp en archivos de código.
// Solo toca strings tipo "foo.jpg" o 'foo.jpeg'. No toca .png ni .svg.
// Uso: node scripts/update-image-refs.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FILES = [
  "data/properties.js",
  "public/data.js",
  "app/layout.js",
  "app/page.js",
  "app/nosotros/page.js",
  "components/Navbar.jsx",
  "components/Hero.jsx",
  "components/Footer.jsx",
  "components/PropertyMap.jsx",
  "components/PropertyDetailClient.jsx",
  "components/InvestmentMap.jsx",
  "components/ExperienciaBarrioPage.jsx",
];

const PATTERN = /\.jpe?g(["'`])/g;

let totalReplacements = 0;
let touched = 0;

for (const rel of FILES) {
  const full = path.join(ROOT, rel);
  const before = await readFile(full, "utf8");
  const matches = before.match(PATTERN);
  const count = matches ? matches.length : 0;
  if (count === 0) {
    console.log(`  -  ${rel} (sin cambios)`);
    continue;
  }
  const after = before.replace(PATTERN, ".webp$1");
  await writeFile(full, after);
  console.log(`  ✓  ${rel} — ${count} refs`);
  totalReplacements += count;
  touched++;
}

console.log(`\nTotal: ${totalReplacements} refs en ${touched} archivos`);
