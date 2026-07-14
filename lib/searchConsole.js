// Capa de datos de Google Search Console (Search Analytics API). SOLO servidor.
//
// Mide algo DISTINTO a GA4 (lib/analytics.js): GA4 cuenta a la gente que ya está
// dentro del sitio (y pierde a quienes usan bloqueadores). Search Console mide lo
// que pasa ANTES, en los resultados de Google: cuántas veces apareciste
// (impresiones), cuántos hicieron clic, el CTR, la posición media y QUÉ buscaron.
// Son datos del propio Google, no los frenan los bloqueadores → es la métrica
// real de "cuánta gente me ve". Ideal para crecer en SEO.
//
// Reutiliza la MISMA cuenta de servicio que GA4 (GA_CLIENT_EMAIL / GA_PRIVATE_KEY).
// Solo hay que darle acceso a la propiedad en Search Console (ver README abajo).
import { JWT } from "google-auth-library";
import { buildSeoRadar } from "./seoRadar";

const CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL;
// Las claves privadas de Google traen "\n" literales al guardarse en una env var;
// hay que devolverlos a saltos de línea reales para que la firma funcione.
const PRIVATE_KEY = (process.env.GA_PRIVATE_KEY || "").replace(/\\n/g, "\n");

// Propiedad de Search Console a consultar. Puede ser:
//   - Propiedad de dominio:   sc-domain:catalanpropiedades.com.ar   (recomendada)
//   - Propiedad de URL:       https://catalanpropiedades.com.ar/
// Si no se define GSC_SITE_URL, se deriva una propiedad de dominio del host de
// NEXT_PUBLIC_SITE_URL (cubre http/https/www de una sola vez).
function resolveSiteUrl() {
  if (process.env.GSC_SITE_URL) return process.env.GSC_SITE_URL;
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return `sc-domain:${new URL(raw).hostname.replace(/^www\./, "")}`;
  } catch {
    return null;
  }
}
const SITE_URL = resolveSiteUrl();

// Scope mínimo: solo lectura de la propiedad.
const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

// Search Console tiene un retraso de ~2 días en consolidar los datos; pedir hasta
// "ayer" devolvería días incompletos. Por eso terminamos el periodo 2 días atrás.
const DATA_LAG_DAYS = 2;

// True solo si hay credenciales y una propiedad resoluble. La página lo usa para
// mostrar instrucciones de configuración en vez de romper.
export function isSearchConsoleConfigured() {
  return Boolean(CLIENT_EMAIL && PRIVATE_KEY && SITE_URL);
}

// Cliente JWT perezoso (se crea una vez). JWT extiende OAuth2Client, así que
// client.request() ya firma la petición con el token de la cuenta de servicio.
let _client = null;
function getClient() {
  if (!_client) {
    _client = new JWT({ email: CLIENT_EMAIL, key: PRIVATE_KEY, scopes: SCOPES });
  }
  return _client;
}

// --- Helpers de fechas (YYYY-MM-DD, en UTC para evitar saltos por timezone) ---
function ymd(date) {
  return date.toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

// Periodo actual (termina hace DATA_LAG_DAYS días) y el inmediatamente anterior
// de igual longitud, para comparar igual que el panel de GA4.
function dateRangesFor(rangeDays) {
  return {
    current: {
      startDate: ymd(daysAgo(DATA_LAG_DAYS + rangeDays - 1)),
      endDate: ymd(daysAgo(DATA_LAG_DAYS)),
    },
    previous: {
      startDate: ymd(daysAgo(DATA_LAG_DAYS + rangeDays * 2 - 1)),
      endDate: ymd(daysAgo(DATA_LAG_DAYS + rangeDays)),
    },
  };
}

// Una llamada a searchAnalytics.query. dimensions=[] devuelve los totales.
async function query(body) {
  const client = getClient();
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE_URL,
  )}/searchAnalytics/query`;
  const res = await client.request({ url, method: "POST", data: body });
  return res.data?.rows || [];
}

const num = (v) => Number(v || 0);
function pctChange(cur, prev) {
  if (prev > 0) return ((cur - prev) / prev) * 100;
  if (cur > 0) return 100;
  return 0;
}
function makeKpi(current, previous) {
  return { current, previous, changePct: Math.round(pctChange(current, previous)) };
}

// Lee todo lo que el panel necesita de Search Console y devuelve un objeto plano
// y serializable (apto para Server → Client Components).
export async function getSearchConsoleOverview(rangeDays) {
  const { current, previous } = dateRangesFor(rangeDays);

  const [curTotals, prevTotals, topQueries, topPages] = await Promise.all([
    // Totales del periodo actual (clics, impresiones, ctr, posición).
    query({ ...current, dimensions: [] }),
    // Totales del periodo anterior, para la comparativa.
    query({ ...previous, dimensions: [] }),
    // Búsquedas que más clics te trajeron (lo más valioso para SEO).
    query({ ...current, dimensions: ["query"], rowLimit: 25 }),
    // Páginas que más entran por búsqueda de Google.
    query({ ...current, dimensions: ["page"], rowLimit: 15 }),
  ]);

  const totalsOf = (rows) => {
    const r = rows[0] || {};
    return {
      clicks: num(r.clicks),
      impressions: num(r.impressions),
      ctr: num(r.ctr), // fracción 0..1
      position: num(r.position),
    };
  };
  const cur = totalsOf(curTotals);
  const prev = totalsOf(prevTotals);

  const kpis = {
    clicks: makeKpi(cur.clicks, prev.clicks),
    impressions: makeKpi(cur.impressions, prev.impressions),
    ctr: makeKpi(cur.ctr, prev.ctr),
    // En posición media, BAJAR es MEJOR (1 = primer resultado). La UI lo invierte.
    position: makeKpi(cur.position, prev.position),
  };

  const queries = topQueries.map((r) => ({
    query: r.keys?.[0] || "(sin dato)",
    clicks: num(r.clicks),
    impressions: num(r.impressions),
    ctr: num(r.ctr),
    position: num(r.position),
  }));

  const pages = topPages.map((r) => ({
    page: (r.keys?.[0] || "").replace(/^https?:\/\/[^/]+/, "") || "/",
    clicks: num(r.clicks),
    impressions: num(r.impressions),
    ctr: num(r.ctr),
    position: num(r.position),
  }));

  return {
    rangeDays,
    range: { ...current },
    updatedAt: new Date().toISOString(),
    kpis,
    queries,
    pages,
  };
}

// Cruza página + búsqueda entre dos períodos para detectar oportunidades de CTR
// y posicionamiento. Se mantiene separado del resumen para no encarecer todas las
// vistas que solo necesitan KPIs generales.
export async function getSeoRadar(rangeDays = 28) {
  const { current, previous } = dateRangesFor(rangeDays);
  const dimensions = ["page", "query"];
  const [currentRows, previousRows] = await Promise.all([
    query({ ...current, dimensions, rowLimit: 25000, dataState: "final" }),
    query({ ...previous, dimensions, rowLimit: 25000, dataState: "final" }),
  ]);

  return {
    ...buildSeoRadar(currentRows, previousRows, rangeDays),
    range: current,
  };
}
