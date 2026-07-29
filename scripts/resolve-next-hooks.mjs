// Hooks del loader (corren en un hilo aparte, de ahí el archivo separado).
// Traducen a rutas reales lo que Next resuelve por convención:
//   1. "@/lib/x"      -> "<raíz>/lib/x"
//   2. "./seoRadar"   -> "./seoRadar.js" | ".mjs" | "/index.js"

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve as resolvePath, dirname } from "node:path";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const EXTS = [".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"];

// Prueba el candidato tal cual, con cada extensión, y como directorio con index.
function primeraQueExiste(base) {
  if (existsSync(base) && !base.endsWith("/")) return base;
  for (const ext of EXTS) if (existsSync(base + ext)) return base + ext;
  for (const ext of EXTS) {
    const idx = resolvePath(base, `index${ext}`);
    if (existsSync(idx)) return idx;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  // Alias del proyecto.
  if (specifier.startsWith("@/")) {
    const hit = primeraQueExiste(resolvePath(ROOT, specifier.slice(2)));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }

  // Relativos sin extensión: solo intervenimos si Node falla, para no pisar
  // resoluciones válidas (paquetes, exports maps, etc.).
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith(".") && context.parentURL) {
      const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
      const hit = primeraQueExiste(base);
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }
    throw err;
  }
}
