// Helper compartido para hablar con la API REST (PostgREST) de Supabase usando
// la clave secreta. SOLO servidor — la clave nunca debe llegar al navegador.
// Lo usan lib/crm.js y demás capas de escritura del lado del servidor.
import "server-only";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

export function authHeaders(extra = {}) {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}`, ...extra };
}

export async function rest(path, init = {}) {
  // Sin credenciales no hay llamada posible, y cortar acá en vez de dejar que
  // falle `fetch` es lo que mantiene el build en pie: `fetch("undefined/rest/v1/...")`
  // no tira un error que se pueda atrapar, deja el render colgado. Las fichas
  // /barrios/[slug] son las unicas que llaman a `rest()` en build, asi que cada
  // una se comia los 60 s de `staticPageGenerationTimeout`, reintentaba tres
  // veces y volteaba el build entero. El CI de GitHub —que no tiene las
  // credenciales— estuvo en rojo por esto desde el 2026-08-05.
  if (!URL_BASE || !SECRET) {
    throw new Error("Supabase sin configurar: falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY");
  }

  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: authHeaders({ "Content-Type": "application/json", ...init.headers }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.hint || text || res.statusText;
    throw new Error(`Supabase ${res.status}: ${msg}`);
  }
  return body;
}
