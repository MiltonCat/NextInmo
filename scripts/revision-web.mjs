// Extrae la foto de analítica del sitio (GA4 + Search Console) y la imprime como
// JSON por stdout. Reutiliza las mismas capas de datos que /admin/analytics, así
// que los números son idénticos a los del panel — no hay una segunda verdad.
//
// Uso:  node scripts/revision-web.mjs [dias]      (por defecto 28)
//       node scripts/revision-web.mjs 7
//
// Lo consume el skill /revision-web para diagnosticar y proponer mejoras.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- Carga de .env.local -----------------------------------------------------
// Next inyecta las env vars solo cuando corre el server; en un script suelto hay
// que leer el archivo a mano. Parser mínimo: KEY=VALUE, ignora comentarios, y
// respeta valores entre comillas (la private key de Google viene así).
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(resolve(ROOT, file), "utf8");
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
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}
loadEnv();

// Los módulos leen process.env al importarse, por eso el import va DESPUÉS de
// loadEnv() y tiene que ser dinámico.
const ga = await import(resolve(ROOT, "lib/analytics.js"));
const gsc = await import(resolve(ROOT, "lib/searchConsole.js"));

const dias = Number(process.argv[2]) || 28;

const salida = {
  generado: new Date().toISOString(),
  rangoDias: dias,
  ga4: { configurado: ga.isAnalyticsConfigured() },
  searchConsole: { configurado: gsc.isSearchConsoleConfigured() },
  errores: [],
};

if (salida.ga4.configurado) {
  try {
    const overview = await ga.getAnalyticsOverview(dias);
    salida.ga4.overview = overview;
    // summarizeCauses ya contiene la heurística del panel para explicar caídas:
    // aprovecharla evita reinventar el diagnóstico acá.
    salida.ga4.causas = ga.summarizeCauses(overview);
  } catch (e) {
    salida.errores.push(`GA4: ${e.message}`);
  }
} else {
  salida.errores.push("GA4 sin credenciales (faltan GA_PROPERTY_ID / GA_CLIENT_EMAIL / GA_PRIVATE_KEY).");
}

if (salida.searchConsole.configurado) {
  try {
    salida.searchConsole.overview = await gsc.getSearchConsoleOverview(dias);
  } catch (e) {
    salida.errores.push(`GSC overview: ${e.message}`);
  }
  try {
    // El radar trae las keywords en tierra de nadie (pos. 5-20): las que están
    // a un empujón del top 3 y donde una mejora rinde más.
    salida.searchConsole.radar = await gsc.getSeoRadar(dias);
  } catch (e) {
    salida.errores.push(`GSC radar: ${e.message}`);
  }
} else {
  salida.errores.push("Search Console sin credenciales (faltan GSC_SITE_URL / GA_CLIENT_EMAIL / GA_PRIVATE_KEY).");
}

process.stdout.write(JSON.stringify(salida, null, 2));
