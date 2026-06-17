// Capa de datos de analítica (Google Analytics 4 Data API). SOLO servidor:
// usa una cuenta de servicio (GA_CLIENT_EMAIL / GA_PRIVATE_KEY) cuyas claves
// NUNCA llegan al navegador. La consume el panel /admin/analytics, siempre
// detrás de requireUser (ver lib/auth.js).
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const PROPERTY_ID = process.env.GA_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL;
// Las claves privadas de Google traen "\n" literales al guardarse en una env var;
// hay que devolverlos a saltos de línea reales para que la firma funcione.
const PRIVATE_KEY = (process.env.GA_PRIVATE_KEY || "").replace(/\\n/g, "\n");

// True solo si están las 3 variables. La página lo usa para mostrar instrucciones
// de configuración en vez de romper cuando aún no hay credenciales.
export function isAnalyticsConfigured() {
  return Boolean(PROPERTY_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

// Cliente perezoso: se crea una sola vez y solo si hay credenciales.
let _client = null;
function getClient() {
  if (!_client) {
    _client = new BetaAnalyticsDataClient({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
    });
  }
  return _client;
}

// Rangos que ofrece el selector (en días). normalizeRange protege el searchParam.
const RANGOS_VALIDOS = new Set([7, 28, 90]);
export function normalizeRange(value) {
  const n = Number(value);
  return RANGOS_VALIDOS.has(n) ? n : 28;
}

// Periodo actual (termina ayer, para no mezclar el día de hoy aún incompleto) y
// el periodo inmediatamente anterior de igual longitud, para comparar.
function dateRangesFor(rangeDays) {
  return {
    current: { startDate: `${rangeDays}daysAgo`, endDate: "yesterday" },
    previous: { startDate: `${rangeDays * 2}daysAgo`, endDate: `${rangeDays + 1}daysAgo` },
  };
}

// --- Helpers de parseo de la respuesta de GA4 -------------------------------
const num = (v) => Number(v || 0);

// Variación porcentual protegida (evita dividir por cero).
function pctChange(cur, prev) {
  if (prev > 0) return ((cur - prev) / prev) * 100;
  if (cur > 0) return 100;
  return 0;
}

function dimIndex(resp, name) {
  return (resp.dimensionHeaders || []).findIndex((h) => h.name === name);
}
function metricIndex(resp, name) {
  return (resp.metricHeaders || []).findIndex((h) => h.name === name);
}
function metric(resp, row, name) {
  const i = metricIndex(resp, name);
  return i >= 0 && row ? num(row.metricValues[i].value) : 0;
}
function makeKpi(current, previous) {
  return { current, previous, changePct: Math.round(pctChange(current, previous)) };
}

// Construye la comparativa de una dimensión (páginas, canales) cruzando el
// periodo actual y el anterior, que vienen en la misma respuesta de 2 dateRanges.
function compareByDimension(resp, dimName, metricName) {
  const di = dimIndex(resp, dimName);
  const ri = dimIndex(resp, "dateRange");
  const mi = metricIndex(resp, metricName);
  const map = new Map();
  for (const row of resp.rows || []) {
    const key = row.dimensionValues[di].value;
    const value = num(row.metricValues[mi].value);
    const isCurrent = row.dimensionValues[ri].value === "date_range_0";
    const entry = map.get(key) || { key, current: 0, previous: 0 };
    if (isCurrent) entry.current = value;
    else entry.previous = value;
    map.set(key, entry);
  }
  return [...map.values()].map((e) => ({
    ...e,
    changePct: Math.round(pctChange(e.current, e.previous)),
  }));
}

// Lee todas las métricas que necesita el panel para un rango dado y devuelve un
// objeto plano y serializable (apto para pasar a Client Components).
export async function getAnalyticsOverview(rangeDays) {
  const client = getClient();
  const property = `properties/${PROPERTY_ID}`;
  const { current, previous } = dateRangesFor(rangeDays);

  const [
    [kpiResp],
    [serieResp],
    [pagesResp],
    [channelsResp],
    [devicesResp],
  ] = await Promise.all([
    // KPIs totales: 2 dateRanges → GA añade la dimensión "dateRange" y devuelve 2 filas.
    client.runReport({
      property,
      dateRanges: [current, previous],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    }),
    // Serie diaria de usuarios (para el gráfico de tendencia).
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    // Páginas más vistas, con comparativa de periodo.
    client.runReport({
      property,
      dateRanges: [current, previous],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 50,
    }),
    // Canales de adquisición (orgánico, directo, redes...), con comparativa.
    client.runReport({
      property,
      dateRanges: [current, previous],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    // Dispositivos del periodo actual.
    client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    }),
  ]);

  // KPIs: separar la fila del periodo actual (date_range_0) y la del anterior.
  const kdi = dimIndex(kpiResp, "dateRange");
  const curRow = (kpiResp.rows || []).find((r) => r.dimensionValues[kdi].value === "date_range_0");
  const prevRow = (kpiResp.rows || []).find((r) => r.dimensionValues[kdi].value === "date_range_1");
  const kpis = {
    activeUsers: makeKpi(metric(kpiResp, curRow, "activeUsers"), metric(kpiResp, prevRow, "activeUsers")),
    sessions: makeKpi(metric(kpiResp, curRow, "sessions"), metric(kpiResp, prevRow, "sessions")),
    screenPageViews: makeKpi(metric(kpiResp, curRow, "screenPageViews"), metric(kpiResp, prevRow, "screenPageViews")),
    bounceRate: makeKpi(metric(kpiResp, curRow, "bounceRate"), metric(kpiResp, prevRow, "bounceRate")),
    avgSessionDuration: makeKpi(metric(kpiResp, curRow, "averageSessionDuration"), metric(kpiResp, prevRow, "averageSessionDuration")),
  };

  // Serie diaria: la dimensión "date" llega como YYYYMMDD.
  const series = (serieResp.rows || [])
    .map((r) => {
      const ymd = r.dimensionValues[0].value;
      return {
        rawDate: ymd,
        label: `${ymd.slice(6, 8)}/${ymd.slice(4, 6)}`,
        users: num(r.metricValues[0].value),
      };
    })
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

  const topPages = compareByDimension(pagesResp, "pagePath", "screenPageViews")
    .map((e) => ({ path: e.key, views: e.current, prevViews: e.previous, changePct: e.changePct }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const channels = compareByDimension(channelsResp, "sessionDefaultChannelGroup", "sessions")
    .map((e) => ({ channel: e.key, sessions: e.current, prevSessions: e.previous, changePct: e.changePct }))
    .sort((a, b) => b.sessions - a.sessions);

  const devices = (devicesResp.rows || []).map((r) => ({
    device: r.dimensionValues[0].value,
    users: num(r.metricValues[0].value),
  }));

  return { rangeDays, updatedAt: new Date().toISOString(), kpis, series, topPages, channels, devices };
}

// --- Traducciones para la UI -------------------------------------------------
const CANALES_ES = {
  "Organic Search": "búsqueda orgánica (Google)",
  Direct: "tráfico directo",
  "Organic Social": "redes sociales",
  "Paid Social": "anuncios en redes",
  "Paid Search": "anuncios de búsqueda",
  Referral: "sitios que te enlazan",
  Email: "email",
  Display: "anuncios display",
  "Organic Video": "video orgánico",
  Affiliates: "afiliados",
  Unassigned: "sin clasificar",
};
export function canalES(name) {
  return CANALES_ES[name] || name;
}

const DISPOSITIVOS_ES = {
  desktop: "Computadora",
  mobile: "Celular",
  tablet: "Tablet",
  smart_tv: "Smart TV",
};
export function dispositivoES(name) {
  return DISPOSITIVOS_ES[name] || name;
}

// Genera una explicación en lenguaje natural de POR QUÉ subieron o bajaron las
// visitas, atribuyendo el cambio al canal y a la página con mayor variación.
export function summarizeCauses(overview) {
  const { kpis, channels, topPages, rangeDays } = overview;
  const pct = kpis.activeUsers.changePct;
  const abs = Math.abs(pct);
  const dir = pct > 3 ? "subieron" : pct < -3 ? "bajaron" : "se mantuvieron estables";

  const frases = [];
  if (dir === "se mantuvieron estables") {
    frases.push(`Las visitas se mantuvieron estables respecto a los ${rangeDays} días anteriores (${pct >= 0 ? "+" : ""}${pct}%).`);
  } else {
    frases.push(`Las visitas ${dir} un ${abs}% frente a los ${rangeDays} días anteriores (${kpis.activeUsers.previous} → ${kpis.activeUsers.current} usuarios).`);
  }

  // Canal que más sumó y canal que más restó (por variación absoluta de sesiones).
  const conDelta = channels.map((c) => ({ ...c, delta: c.sessions - c.prevSessions }));
  const masSubio = [...conDelta].sort((a, b) => b.delta - a.delta)[0];
  const masBajo = [...conDelta].sort((a, b) => a.delta - b.delta)[0];

  if (masSubio && masSubio.delta > 0) {
    frases.push(`El mayor impulso vino de ${canalES(masSubio.channel)} (${masSubio.prevSessions} → ${masSubio.sessions} sesiones).`);
  }
  if (masBajo && masBajo.delta < 0 && masBajo.channel !== masSubio?.channel) {
    frases.push(`En cambio, ${canalES(masBajo.channel)} cayó (${masBajo.prevSessions} → ${masBajo.sessions} sesiones).`);
  }

  // Página que más creció en visitas (suele explicar picos: un artículo, una propiedad).
  const pagSubio = [...topPages]
    .map((p) => ({ ...p, delta: p.views - p.prevViews }))
    .sort((a, b) => b.delta - a.delta)[0];
  if (pagSubio && pagSubio.delta > 0) {
    frases.push(`La página que más creció fue «${pagSubio.path}» (+${pagSubio.delta} vistas).`);
  }

  return frases.join(" ");
}
