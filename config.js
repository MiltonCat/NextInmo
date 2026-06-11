export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://catalanpropiedades.com.ar";
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "542944301470";
export const WA_URL = `https://wa.me/${WA_NUMBER}`;
export const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+54 9 2944 30-1470";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ventascatalanprop@gmail.com";
export const LOCATION_DISPLAY = "San Martín de los Andes, Patagonia";
// Cambiar a https://tasador.catalanpropiedades.com.ar cuando exista el registro DNS en WNPower.
export const TASADOR_URL = process.env.NEXT_PUBLIC_TASADOR_URL ?? "https://tasador-sma.vercel.app";
export const BUSINESS_HOURS = "Lun–Vie: 9:30 a 19:00 · Sáb: 10:00 a 13:00";

// Code de verificación de Google Search Console.
// Si la variable no está definida, el meta no se renderiza.
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

// URL absoluta de la imagen por defecto para Open Graph / Twitter (1200x630).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-montana.webp`;

// Helper para construir URLs canónicas con trailing slash (coincide con next.config trailingSlash:true).
// Acepta paths absolutos ("/propiedades") o relativos ("propiedades"). La raíz devuelve SITE_URL + "/".
export function canonicalUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean.endsWith("/") ? clean : `${clean}/`}`;
}
