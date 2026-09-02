// Llena el indice semantico del sitio (tabla sitio_fragmentos).
//
// Lee las paginas REALES de produccion, no el codigo fuente: lo que Lucia
// busque va a ser exactamente lo que ve un visitante, y una pagina nueva entra
// sola en cuanto este en el sitemap. Extraer texto del JSX seria mas fragil y
// se desincronizaria en cuanto alguien mueva un componente.
//
// Uso:
//   node scripts/indexar-sitio.mjs            (solo lo que cambio)
//   node scripts/indexar-sitio.mjs --todo     (reindexa todo, ignora los hash)
//   node scripts/indexar-sitio.mjs --ver      (no escribe: muestra que haria)
//
// Necesita red e internet: correlo desde PowerShell, no desde la shell montada.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const SITIO = "https://www.catalanpropiedades.com.ar";
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const OPENAI = process.env.OPENAI_API_KEY;
const MODELO = "text-embedding-3-small";

const TODO = process.argv.includes("--todo");
const SOLO_VER = process.argv.includes("--ver");

if (!SUPABASE || !SECRET || !OPENAI) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY u OPENAI_API_KEY en .env.local");
  process.exit(1);
}

// Las fichas de propiedad NO se indexan: cambian todo el tiempo y Lucia ya las
// lee en vivo de la base en cada consulta. Indexarlas seria publicar precios
// viejos con cara de contenido.
const EXCLUIR = [/\/propiedades\//, /\/favoritos/, /\/cuenta/, /\/auth/, /\/admin/];

const seccionDe = (url) =>
  url.includes("/blog/") ? "blog"
  : url.includes("/barrios/") ? "barrio"
  : url.includes("/desarrollos/") ? "desarrollo"
  : url.includes("/centro-ayuda") ? "ayuda"
  : "pagina";

const sha1 = (texto) => createHash("sha1").update(texto).digest("hex");

async function urlsDelSitemap() {
  const res = await fetch(`${SITIO}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap: HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(urls)].filter((url) => !EXCLUIR.some((re) => re.test(url)));
}

const ENTIDADES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  aacute: "\u00e1", eacute: "\u00e9", iacute: "\u00ed", oacute: "\u00f3", uacute: "\u00fa",
  Aacute: "\u00c1", Eacute: "\u00c9", Iacute: "\u00cd", Oacute: "\u00d3", Uacute: "\u00da",
  ntilde: "\u00f1", Ntilde: "\u00d1", uuml: "\u00fc", Uuml: "\u00dc",
  iquest: "\u00bf", iexcl: "\u00a1", laquo: "\u00ab", raquo: "\u00bb",
  ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018", rsquo: "\u2019",
  mdash: "\u2014", ndash: "\u2013", hellip: "\u2026", deg: "\u00b0", euro: "\u20ac",
  middot: "\u00b7", bull: "\u2022", copy: "\u00a9", reg: "\u00ae", trade: "\u2122",
};

// Extractor de texto a mano, sin dependencias. Se queda con <main> si existe
// —el layout repite navbar y footer en las 48 paginas, y sin esto cada
// fragmento arrastraria el menu entero— y despues saca etiquetas y entidades.
export function textoDeHtml(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let cuerpo = main ? main[1] : html;
  cuerpo = cuerpo
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer|header)\b[\s\S]*?<\/\1>/gi, " ")
    // Los cierres de bloque marcan corte de parrafo: sin esto dos titulos
    // pegados quedan como una sola palabra ("PrecioContacto").
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr|br)\s*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return cuerpo
    // Las entidades con nombre van ANTES del comodin de abajo. Si no, un
    // &aacute; se convierte en un espacio y "calculo" queda "c lculo": la
    // palabra se rompe justo en el acento, que en castellano es en todas.
    .replace(/&(nbsp|amp|lt|gt|quot|apos|aacute|eacute|iacute|oacute|uacute|Aacute|Eacute|Iacute|Oacute|Uacute|ntilde|Ntilde|uuml|Uuml|iquest|iexcl|laquo|raquo|ldquo|rdquo|lsquo|rsquo|mdash|ndash|hellip|deg|euro|middot|bull|copy|reg|trade);/g,
      (_, nombre) => ENTIDADES[nombre] ?? " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z]+\d*;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function tituloDeHtml(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return t ? t[1].split("|")[0].trim() : null;
}

// Fragmentos de ~1200 caracteres cortados en limite de parrafo, con un parrafo
// de solapamiento: si una idea queda partida al medio, el fragmento siguiente
// la vuelve a traer entera y la busqueda igual la encuentra.
export function fragmentar(texto, { objetivo = 1200, minimo = 200 } = {}) {
  const parrafos = texto.split("\n").filter((p) => p.trim().length > 0);
  const fragmentos = [];
  let actual = [];
  let largo = 0;

  for (const parrafo of parrafos) {
    if (largo + parrafo.length > objetivo && largo >= minimo) {
      fragmentos.push(actual.join("\n"));
      const ultimo = actual[actual.length - 1];
      actual = ultimo && ultimo.length < objetivo / 2 ? [ultimo] : [];
      largo = actual.reduce((n, p) => n + p.length, 0);
    }
    actual.push(parrafo);
    largo += parrafo.length;
  }
  if (largo >= minimo || (fragmentos.length === 0 && largo > 0)) {
    fragmentos.push(actual.join("\n"));
  } else if (actual.length && fragmentos.length) {
    fragmentos[fragmentos.length - 1] += `\n${actual.join("\n")}`;
  }
  return fragmentos.map((f) => f.trim()).filter((f) => f.length >= 80);
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const texto = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${texto}`);
  return texto ? JSON.parse(texto) : null;
}

async function embeddings(textos) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELO, input: textos }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

async function main() {
  const urls = await urlsDelSitemap();
  console.log(`${urls.length} paginas en el sitemap (sin fichas de propiedad)`);

  const previos = SOLO_VER || TODO ? [] : await rest("sitio_fragmentos?select=url,pagina_hash");
  const hashPrevio = new Map((previos || []).map((row) => [row.url, row.pagina_hash]));

  let indexadas = 0;
  let sinCambios = 0;
  let fragmentosTotales = 0;

  for (const url of urls) {
    let html;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "catalan-indexador" } });
      if (!res.ok) { console.log(`  omitida ${url} (HTTP ${res.status})`); continue; }
      html = await res.text();
    } catch (error) {
      console.log(`  omitida ${url} (${error.message})`);
      continue;
    }

    const texto = textoDeHtml(html);
    if (texto.length < 300) { console.log(`  omitida ${url} (${texto.length} caracteres de texto)`); continue; }

    const hash = sha1(texto);
    if (hashPrevio.get(url) === hash) { sinCambios++; continue; }

    const titulo = tituloDeHtml(html);
    const fragmentos = fragmentar(texto);
    if (!fragmentos.length) continue;

    if (SOLO_VER) {
      console.log(`  ${url} -> ${fragmentos.length} fragmentos, ${texto.length} caracteres`);
      fragmentosTotales += fragmentos.length;
      indexadas++;
      continue;
    }

    const vectores = await embeddings(fragmentos);
    // Se borra y se reinserta la pagina entera: si el texto se acorto, los
    // fragmentos viejos quedarian sueltos contestando con contenido que ya no
    // esta publicado.
    await rest(`sitio_fragmentos?url=eq.${encodeURIComponent(url)}`, { method: "DELETE" });
    await rest("sitio_fragmentos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(fragmentos.map((fragmento, i) => ({
        url,
        titulo,
        seccion: seccionDe(url),
        orden: i,
        fragmento,
        pagina_hash: hash,
        embedding: vectores[i],
      }))),
    });

    indexadas++;
    fragmentosTotales += fragmentos.length;
    console.log(`  ${url} -> ${fragmentos.length} fragmentos`);
  }

  console.log(`\n${indexadas} paginas ${SOLO_VER ? "se indexarian" : "indexadas"}, ${fragmentosTotales} fragmentos, ${sinCambios} sin cambios`);
}

// Permite importar textoDeHtml/fragmentar en pruebas sin salir a la red.
if (process.argv[1] && process.argv[1].endsWith("indexar-sitio.mjs")) {
  main().catch((error) => { console.error("Error:", error.message); process.exit(1); });
}
