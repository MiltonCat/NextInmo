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

// Cuantas paginas se leen a la vez. Leerlas de a una era el cuello de botella
// real: 40 fetch en fila se comian el presupuesto de tiempo del cron antes de
// llegar al final del sitemap, asi que las paginas de abajo —las notas nuevas
// del blog, entre otras— no se revisaban NUNCA. Leer es barato y no escribe
// nada; lo caro son los embeddings. De a 6 el sitio entero se revisa en
// segundos y el presupuesto queda entero para indexar.
const CONCURRENCIA = 6;

// Lee una pagina y devuelve ya digerido lo unico que hace falta despues: el
// texto, su titulo y su hash. El HTML crudo se descarta aca para no tener 40
// paginas enteras en memoria al mismo tiempo.
async function leerPagina(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "catalan-indexador" } });
    if (!res.ok) return { url, error: `HTTP ${res.status}` };
    const html = await res.text();
    const texto = textoDeHtml(html);
    if (texto.length < 300) return { url, error: `${texto.length} caracteres` };
    return { url, texto, titulo: tituloDeHtml(html), hash: sha1(texto) };
  } catch (error) {
    return { url, error: error.message };
  }
}

async function enTandas(items, tamano, fn, seguir = () => true) {
  const salida = [];
  for (let i = 0; i < items.length; i += tamano) {
    if (!seguir()) break;
    salida.push(...(await Promise.all(items.slice(i, i + tamano).map(fn))));
  }
  return salida;
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
 *
 * Va en dos fases —revisar todo el sitio en paralelo, despues indexar por
 * turno— justamente para que ese presupuesto no vuelva a decidir QUE paginas se
 * miran, solo cuantas se escriben.
 */
export async function indexarSitio({
  sitio,
  supabaseUrl,
  secret,
  openaiKey,
  respuestasDeLaCasa = [],
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
  //
  // `actualizado_at` viene de arrastre y sale gratis: como cada reindexado borra
  // y reinserta la pagina entera, la fecha de la fila es la ultima vez que esa
  // pagina entro al indice. Sirve de turno rotativo sin guardar estado en
  // ningun lado.
  const previos = soloVer || todo
    ? []
    : await rest("sitio_fragmentos?select=url,pagina_hash,actualizado_at&orden=eq.0");
  const hashPrevio = new Map((previos || []).map((row) => [row.url, row.pagina_hash]));
  const indexadaEn = new Map((previos || []).map((row) => [row.url, row.actualizado_at || ""]));

  // El orden es lo que arregla el problema de fondo. Antes se recorria SIEMPRE
  // el sitemap desde la primera URL, y como las primeras son la home,
  // /propiedades, /alquileres y /blog —que se arman con datos de Supabase y por
  // eso cambian casi todos los dias— el techo de paginas por corrida se gastaba
  // una y otra vez en las mismas, y una nota nueva mas abajo en la lista podia
  // no entrar nunca.
  //
  // Ahora: primero lo que nunca se indexo (clave "", que ordena antes que
  // cualquier fecha), despues lo que hace mas que no se toca. Una pagina nueva
  // entra en la proxima corrida si o si, y ninguna conocida se queda sin turno.
  const turno = (url) => (hashPrevio.has(url) ? indexadaEn.get(url) || "" : "");
  const enOrden = [...urls].sort((a, b) => turno(a).localeCompare(turno(b)));

  const resumen = {
    enSitemap: urls.length,
    indexadas: 0,
    fragmentos: 0,
    sinCambios: 0,
    omitidas: [],
    pendientes: 0,
    retiradas: 0,
    paginas: [],
  };

  // Las respuestas de la casa van primero y NUNCA se saltean por presupuesto:
  // son pocas, son la palabra de Milton, y son lo que corrige un error que ya
  // vio. Dejarlas para manana por falta de tiempo seria dejar el error suelto un
  // dia mas. Cada una es un fragmento solo, sin cortar: son cortas por diseno.
  const idsVigentes = [];
  for (const item of respuestasDeLaCasa) {
    const url = `casa:${item.id}`;
    idsVigentes.push(url);
    const texto = `${item.pregunta}\n${item.respuesta}`;
    const hash = sha1(texto + (item.href || ""));
    if (hashPrevio.get(url) === hash) { resumen.sinCambios++; continue; }
    if (soloVer) {
      log(`  ${url} -> respuesta de la casa`);
      resumen.indexadas++;
      resumen.fragmentos++;
      continue;
    }
    const [vector] = await embeddings(openaiKey, [texto]);
    await rest(`sitio_fragmentos?url=eq.${encodeURIComponent(url)}`, { method: "DELETE" });
    await rest("sitio_fragmentos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([{
        url,
        titulo: item.pregunta,
        // El href opcional viaja en `seccion` para no agregar una columna por
        // un dato que solo tiene este tipo de fila.
        seccion: item.href ? `casa|${item.href}` : "casa",
        orden: 0,
        fragmento: texto,
        pagina_hash: hash,
        embedding: vector,
      }]),
    });
    resumen.indexadas++;
    resumen.fragmentos++;
    log(`  ${url} -> respuesta de la casa`);
  }

  // Una respuesta borrada del archivo tiene que desaparecer del indice, o Lucia
  // la sigue dando como palabra de la casa despues de que Milton la retiro.
  if (!soloVer) {
    const casaEnIndice = (await rest("sitio_fragmentos?select=url&url=like.casa:*")) || [];
    const sobrantes = casaEnIndice
      .map((fila) => fila.url)
      .filter((url) => !idsVigentes.includes(url));
    for (const url of sobrantes) {
      await rest(`sitio_fragmentos?url=eq.${encodeURIComponent(url)}`, { method: "DELETE" });
      log(`  ${url} -> borrada del indice (ya no esta en el archivo)`);
    }
    resumen.retiradas = sobrantes.length;
  }

  // FASE 1 — revisar. Se leen todas las paginas y se compara el hash. Es la
  // parte barata (no escribe nada, no gasta embeddings) y ahora va en paralelo,
  // asi que el sitio entero se revisa en cada corrida en vez de cortarse por la
  // mitad. Si aun asi se acabara el tiempo, lo ya leido es lo mas prioritario.
  const leidas = await enTandas(
    enOrden,
    CONCURRENCIA,
    leerPagina,
    () => Date.now() - arranque < msDisponibles,
  );
  if (leidas.length < enOrden.length) {
    log(`no se alcanzo a leer ${enOrden.length - leidas.length} paginas`);
  }

  const cambiadas = [];
  for (const pagina of leidas) {
    if (pagina.error) { resumen.omitidas.push(`${pagina.url} (${pagina.error})`); continue; }
    if (hashPrevio.get(pagina.url) === pagina.hash) { resumen.sinCambios++; continue; }
    cambiadas.push(pagina);
  }
  log(`${resumen.sinCambios} sin cambios, ${cambiadas.length} para indexar`);

  // FASE 2 — indexar. Aca si hay techo: cada pagina son fragmentos, una llamada
  // a OpenAI y dos a Supabase. Lo que no entre queda para la corrida siguiente,
  // y como la lista viene ordenada por turno, lo pendiente sale primero manana.
  for (const [i, { url, texto, titulo, hash }] of cambiadas.entries()) {
    if (resumen.indexadas >= maxPaginas || Date.now() - arranque > msDisponibles) {
      resumen.pendientes = cambiadas.length - i + (enOrden.length - leidas.length);
      log(`presupuesto agotado, quedan ${resumen.pendientes} paginas para la proxima corrida`);
      break;
    }

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
        titulo,
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

  // Si el bucle termino entero pero quedaron paginas sin leer, tambien son
  // pendientes: el resumen tiene que decir la verdad o el log del cron deja de
  // servir para darse cuenta de que algo se esta quedando afuera.
  if (!resumen.pendientes) resumen.pendientes = enOrden.length - leidas.length;

  resumen.segundos = Math.round((Date.now() - arranque) / 100) / 10;
  return resumen;
}
