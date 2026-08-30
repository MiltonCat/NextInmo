export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://catalanpropiedades.com.ar";
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "542944301470";
export const WA_URL = `https://wa.me/${WA_NUMBER}`;
export const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+54 9 2944 30-1470";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ventascatalanprop@gmail.com";
export const LOCATION_DISPLAY = "San Martín de los Andes, Patagonia";
// Desde agosto de 2026 el tasador vive DENTRO del sitio, en /tasacion. Todos
// los enlaces internos apuntan acá: el tráfico, el SEO y los correos que deja
// la gente se quedan en el dominio propio en vez de irse a un subdominio de
// Vercel. Al ser una ruta relativa, ningún enlace que la use debe abrirse con
// target="_blank".
export const TASADOR_PATH = "/tasacion/";

// La app vieja (tasador-sma.vercel.app) sigue en pie mientras haya enlaces
// externos apuntándole, pero el sitio ya no la enlaza. Cuando deje de recibir
// visitas se la puede redirigir a TASADOR_PATH y borrar esta constante.
export const TASADOR_URL = process.env.NEXT_PUBLIC_TASADOR_URL ?? "https://tasador-sma.vercel.app";
// API del modelo predictivo (repo modelo-predictivo-m2, deploy en Render).
// Se consume solo del lado del servidor (ISR), por eso no lleva NEXT_PUBLIC_.
export const TASADOR_API_URL = process.env.TASADOR_API_URL ?? "https://modelo-predictivo-api.onrender.com";
export const BUSINESS_HOURS = "Lun–Vie: 9:30 a 19:00 · Sáb: 10:00 a 13:00";

// Code de verificación de Google Search Console.
// Si la variable no está definida, el meta no se renderiza.
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

// Ídem para Bing Webmaster Tools. Bing importa desde Search Console solo las
// propiedades de tipo prefijo de URL, y la nuestra es de dominio (sc-domain),
// así que el importador no la lista y la verificación va a mano.
//
// Este va escrito acá y no en una variable de entorno, a diferencia del de
// Google: el token se publica en el HTML de cada página, así que cualquiera que
// mire el código fuente del sitio ya lo tiene. No es un secreto, y tenerlo acá
// ahorra configurarlo en Vercel y en .env.local. La variable de entorno sigue
// teniendo prioridad por si algún día hay que rotarlo sin tocar el repo.
export const BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "76D90350937BA5499E9B26BCA8CCF203";

// URL absoluta de la imagen por defecto para Open Graph / Twitter (1200x630).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-montana.webp`;

// Helper para construir URLs canónicas con trailing slash (coincide con next.config trailingSlash:true).
// Acepta paths absolutos ("/propiedades") o relativos ("propiedades"). La raíz devuelve SITE_URL + "/".
export function canonicalUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean.endsWith("/") ? clean : `${clean}/`}`;
}
