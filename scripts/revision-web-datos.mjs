// Baja la foto de analítica desde /api/revision-web y la guarda en
// revision-web.json (en la raíz del proyecto, ignorado por git).
//
// Existe porque las credenciales de Google viven solo en Vercel: este script
// corre en tu máquina, le pide los datos al endpoint en producción y deja el
// resultado en un archivo local que el asistente puede leer.
//
// Uso:  npm run revision-web:datos          (28 días)
//       npm run revision-web:datos -- 7     (7 días)
//
// Requiere CRON_SECRET en .env.local — es el token de tu propio endpoint,
// el mismo de /api/cron/seo-radar.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = resolve(ROOT, "revision-web.json");

// Parser mínimo de .env.local: Next inyecta las env vars solo cuando corre el
// server, así que en un script suelto hay que leer el archivo a mano.
function leerEnv() {
  const env = {};
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
      if (env[key] === undefined) env[key] = val;
    }
  }
  return env;
}

const env = leerEnv();
const token = process.env.CRON_SECRET || env.CRON_SECRET;
const site =
  process.env.NEXT_PUBLIC_SITE_URL ||
  env.NEXT_PUBLIC_SITE_URL ||
  "https://catalanpropiedades.com.ar";

if (!token) {
  console.error(
    "Falta CRON_SECRET.\n" +
      "Copialo de Vercel → Settings → Environment Variables y agregá esta línea\n" +
      "al final de tu .env.local:\n\n" +
      "  CRON_SECRET=el-valor-que-copiaste\n",
  );
  process.exit(1);
}

const dias = Number(process.argv[2]) || 28;
const url = `${site.replace(/\/$/, "")}/api/revision-web?dias=${dias}`;

let res;
try {
  res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
} catch (error) {
  console.error(`No se pudo conectar a ${site}: ${error.message}`);
  process.exit(1);
}

if (res.status === 401) {
  console.error("401: el CRON_SECRET no coincide con el que tiene Vercel.");
  process.exit(1);
}
if (res.status === 404) {
  console.error("404: el endpoint no está deployado todavía. Esperá a que Vercel termine el build.");
  process.exit(1);
}
if (!res.ok) {
  console.error(`El endpoint respondió ${res.status}.`);
  process.exit(1);
}

const datos = await res.json();
writeFileSync(DESTINO, JSON.stringify(datos, null, 2), "utf8");

// Resumen corto en consola para saber si sirvió sin abrir el archivo.
const u = datos?.ga4?.overview?.totals;
console.log(`Listo: revision-web.json (${dias} días)`);
if (u) console.log(`Usuarios en el período: ${u.users ?? u.activeUsers ?? "—"}`);
if (datos?.errores?.length) console.log("Avisos:", datos.errores.join(" · "));
