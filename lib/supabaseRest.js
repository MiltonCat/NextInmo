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
