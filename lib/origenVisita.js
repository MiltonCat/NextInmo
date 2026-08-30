/**
 * De dónde llegó el visitante, con foco en los asistentes de IA.
 *
 * Por qué existe: el tráfico que mandan ChatGPT, Perplexity o Gemini llega
 * como un referrer común y GA4 lo mete en "Referral" o, peor, en "Directo"
 * cuando la app móvil no manda referrer. Sin esto no hay forma de saber que
 * una consulta nació de una respuesta de IA.
 *
 * La otra mitad del problema es que el referrer solo existe en la PRIMERA
 * carga: apenas el visitante navega a otra página del sitio, se pierde. Por
 * eso se guarda el primer origen en sessionStorage y todo lo que pase después
 * en esa visita lo sigue arrastrando.
 *
 * Solo cliente: no lo importe nada del servidor.
 */

// Los dominios desde los que responden los asistentes. Si aparece uno nuevo,
// se agrega acá y queda cubierto todo el sitio.
const FUENTES_IA = [
  { fuente: "ChatGPT", dominios: ["chatgpt.com", "chat.openai.com", "openai.com"] },
  { fuente: "Perplexity", dominios: ["perplexity.ai"] },
  { fuente: "Claude", dominios: ["claude.ai"] },
  { fuente: "Gemini", dominios: ["gemini.google.com"] },
  { fuente: "Copilot", dominios: ["copilot.microsoft.com"] },
  { fuente: "DeepSeek", dominios: ["deepseek.com"] },
  { fuente: "Grok", dominios: ["grok.com"] },
  { fuente: "Meta AI", dominios: ["meta.ai"] },
];

const CLAVE = "origen-visita";

function dominioDe(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Coincide con el dominio exacto o con cualquier subdominio suyo, nunca con un
// dominio que apenas lo contenga: "chatgpt.com.ar" no es ChatGPT.
function fuenteDeDominio(host) {
  if (!host) return null;
  for (const { fuente, dominios } of FUENTES_IA) {
    if (dominios.some((d) => host === d || host.endsWith(`.${d}`))) return fuente;
  }
  return null;
}

/**
 * Lee el origen de ESTA carga. No toca sessionStorage.
 * Devuelve { fuente, canal, referrer } o null si no hay nada que decir.
 * `canal` es "ia" | "buscador" | "referencia" | "campaña".
 */
export function leerOrigenActual() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const utmSource = (params.get("utm_source") || "").toLowerCase();

  // Algunas respuestas de IA arrastran utm_source aunque se pierda el referrer.
  const porUtm = fuenteDeDominio(utmSource) || fuenteDeDominio(`${utmSource}.com`);
  if (porUtm) return { fuente: porUtm, canal: "ia", referrer: "utm_source" };

  const referrer = document.referrer || "";
  const host = dominioDe(referrer);

  // Navegación interna: no es un origen nuevo.
  if (host && host === window.location.hostname.replace(/^www\./, "")) return null;

  const fuenteIA = fuenteDeDominio(host);
  if (fuenteIA) return { fuente: fuenteIA, canal: "ia", referrer: host };

  if (params.get("utm_campaign") || utmSource) {
    return { fuente: utmSource || "campaña", canal: "campaña", referrer: host || "sin referrer" };
  }
  if (!host) return null;
  if (/google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\./.test(host)) {
    return { fuente: host, canal: "buscador", referrer: host };
  }
  return { fuente: host, canal: "referencia", referrer: host };
}

/**
 * El origen de la visita: el de la primera carga, recordado durante toda la
 * sesión. Si ya había uno guardado NO se pisa — interesa por dónde entró, no
 * la última página que tocó.
 */
export function origenDeLaVisita() {
  if (typeof window === "undefined") return null;

  try {
    const guardado = sessionStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch {
    // Almacenamiento bloqueado: se sigue con lo de esta carga, sin recordar.
  }

  const actual = leerOrigenActual();
  if (!actual) return null;

  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(actual));
  } catch {
    // Igual se devuelve: perder la memoria no debe perder el dato de hoy.
  }
  return actual;
}
