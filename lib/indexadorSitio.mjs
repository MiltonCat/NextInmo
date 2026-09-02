// Motor del indice semantico del sitio. Vive en un .mjs sin alias "@/" y sin
// "server-only" a proposito: lo importan DOS cosas que corren distinto —
// scripts/indexar-sitio.mjs con node pelado desde la terminal, y la ruta de
// cron app/api/cron/indexar-sitio a traves del bundler de Next—. Mismo criterio
// que lib/luciaAdvisor.mjs.
//
// Lee las paginas REALES de produccion, no el codigo: lo que Lucia busque va a
// ser exactamente lo que ve un visitante, y una pagina nueva entra sola en
// cuanto este en el sitemap.
import { createHash } from "node:crypto";

export const MODELO_EMBEDDINGS = "text-embedding-3-small";

// Las fichas de propiedad NO se indexan: cambian todo el tiempo y Lucia ya las
// lee en vivo de la base en cada consulta. Indexarlas seria publicar precios
// viejos con cara de contenido.
const EXCLUIR = [/\/propiedades\//, /\/favoritos/, /\/cuenta/, /\/auth/, /\/admin/];

const ENTIDADES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
  iquest: "¿", iexcl: "¡", laquo: "«", raquo: "»",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  mdash: "—", ndash: "–", hellip: "…", deg: "°", euro: "€",
  middot: "·", bull: "•", copy: "©", reg: "®", trade: "™",
};

export const sha1 = (texto) => createHash("sha1").update(texto).digest("hex");

export const seccionDe = (url) =>
  url.includes("/blog/") ? "blog"
  : url.includes("/barrios/") ? "barrio"
  : url.includes("/desarrollos/") ? "desarrollo"
  : url.includes("/centro-ayuda") ? "ayuda"
  : "pagina";

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
    // palabra se rompe justo en el acento, que en castellano es en casi todas.
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

export async function urlsDelSitemap(sitio) {
  const res = await fetch(`${sitio}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap: HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(urls)].filter((url) => !EXCLUIR.some((re) => re.test(url)));
}

function clienteRest(supabaseUrl, secret) {
  return async function rest(path, init = {}) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    const texto = await res.text();
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${texto}`);
    return texto ? JSON.parse(texto) : null;
  };
}

async function embeddings(clave, textos) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELO_EMBEDDINGS, input: textos }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

/**
 * Indexa el sitio. Devuelve un resumen; no lanza por una pagina suelta.
 *
 * `maxPaginas` y `msDisponibles` existen por el cron: una funcion de Vercel se
 * corta a los 60 s, asi que la corrida diaria procesa lo que cambio hasta
 * agotar su presupuesto y deja el resto para el dia siguiente. Desde la
 * terminal van sin limite y entra todo de una.
 */
export async function indexarSitio({
  sitio,
  supabaseUrl,
  secret,
  openaiKey,
  todo = false,
  soloVer = false,
  maxPaginas = Infinity,
  msDisponibles = Infinity,
  log = () => {},
} = {}) {
  if (!sitio || !supabaseUrl || !secret || !openaiKey) {
    throw new Error("Faltan sitio, supabaseUrl, secret u openaiKey");
  }
  const arranque = Date.now();
  const rest = clienteRest(supabaseUrl, secret);

  const urls = await urlsDelSitemap(sitio);
  log(`${urls.length} paginas en el sitemap (sin fichas de propiedad)`);

  // Solo el fragmento 0 de cada pagina: el hash es de la pagina entera, asi que
  // pedir las 205 filas seria traer el mismo dato repetido. Ademas PostgREST
  // corta la respuesta en 1000 filas, y con el sitio creciendo eso empezaria a
  // devolver paginas "sin hash" que se reindexarian al pedo todos los dias.
  const previos = soloVer || todo
    ? []
    : await rest("sitio_fragmentos?select=url,pagina_hash&orden=eq.0");
  const hashPrevio = new Map((previos || []).map((row) => [row.url, row.pagina_hash]));

  const resumen = {
    enSitemap: urls.length,
    indexadas: 0,
    fragmentos: 0,
    sinCambios: 0,
    omitidas: [],
    pendientes: 0,
    paginas: [],
  };

  for (const [i, url] of urls.entries()) {
    if (resumen.indexadas >= maxPaginas || Date.now() - arranque > msDisponibles) {
      resumen.pendientes = urls.length - i;
      log(`presupuesto agotado, quedan ${resumen.pendientes} paginas para la proxima corrida`);
      break;
    }

    let html;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "catalan-indexador" } });
      if (!res.ok) { resumen.omitidas.push(`${url} (HTTP ${res.status})`); continue; }
      html = await res.text();
    } catch (error) {
      resumen.omitidas.push(`${url} (${error.message})`);
      continue;
    }

    const texto = textoDeHtml(html);
    if (texto.length < 300) { resumen.omitidas.push(`${url} (${texto.length} caracteres)`); continue; }

    const hash = sha1(texto);
    if (hashPrevio.get(url) === hash) { resumen.sinCambios++; continue; }

    const fragmentos = fragmentar(texto);
    if (!fragmentos.length) { resumen.omitidas.push(`${url} (sin fragmentos)`); continue; }

    if (soloVer) {
      log(`  ${url} -> ${fragmentos.length} fragmentos, ${texto.length} caracteres`);
      resumen.indexadas++;
      resumen.fragmentos += fragmentos.length;
      resumen.paginas.push(url);
      continue;
    }

    const vectores = await embeddings(openaiKey, fragmentos);
    // Se borra y se reinserta la pagina entera: si el texto se acorto, los
    // fragmentos viejos quedarian sueltos contestando con contenido que ya no
    // esta publicado.
    await rest(`sitio_fragmentos?url=eq.${encodeURIComponent(url)}`, { method: "DELETE" });
    await rest("sitio_fragmentos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(fragmentos.map((fragmento, orden) => ({
        url,
        titulo: tituloDeHtml(html),
        seccion: seccionDe(url),
        orden,
        fragmento,
        pagina_hash: hash,
        embedding: vectores[orden],
      }))),
    });

    resumen.indexadas++;
    resumen.fragmentos += fragmentos.length;
    resumen.paginas.push(url);
    log(`  ${url} -> ${fragmentos.length} fragmentos`);
  }

  resumen.segundos = Math.round((Date.now() - arranque) / 100) / 10;
  return resumen;
}
