// Corre el indice semantico del sitio a mano. El motor esta en
// lib/indexadorSitio.mjs, compartido con el cron de Vercel
// (app/api/cron/indexar-sitio): una sola implementacion, dos disparadores.
//
// Desde la terminal va sin presupuesto: entra todo el sitio de una. El cron, en
// cambio, procesa por tandas porque una funcion de Vercel se corta a los 60 s.
//
// Uso:
//   npm run indexar-sitio                          (solo lo que cambio)
//   node scripts/indexar-sitio.mjs --todo          (reindexa todo)
//   node scripts/indexar-sitio.mjs --ver           (no escribe: muestra que haria)
//
// Necesita internet: correlo desde PowerShell, no desde la shell montada.
import { readFileSync } from "node:fs";
import { indexarSitio } from "../lib/indexadorSitio.mjs";
import { respuestasIndexables } from "../data/respuestasDeLaCasa.js";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

try {
  const resumen = await indexarSitio({
    sitio: process.env.NEXT_PUBLIC_SITE_URL || "https://catalanpropiedades.com.ar",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    respuestasDeLaCasa: respuestasIndexables(),
    todo: process.argv.includes("--todo"),
    soloVer: process.argv.includes("--ver"),
    log: (linea) => console.log(linea),
  });

  for (const omitida of resumen.omitidas) console.log(`  omitida ${omitida}`);
  console.log(
    `\n${resumen.indexadas} paginas indexadas, ${resumen.fragmentos} fragmentos, ` +
    `${resumen.sinCambios} sin cambios, ${resumen.omitidas.length} omitidas, ` +
    `${resumen.retiradas} retiradas (${resumen.segundos}s)`
  );
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
