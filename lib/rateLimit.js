// Rate limiting simple en memoria, por IP y por endpoint ("bucket").
// En Vercel cada instancia serverless tiene su propia memoria, así que el
// límite es aproximado (por instancia caliente), pero corta en seco bots y
// loops de spam sin agregar infraestructura (Redis/Upstash). Si algún día el
// spam persiste pese a esto, el paso siguiente es Vercel Firewall o Upstash.

const buckets = new Map();

// IP real del cliente detrás del proxy de Vercel.
export function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// Ventana deslizante: permite hasta `limit` pedidos por `windowMs` para `key`.
// Devuelve true si el pedido pasa, false si hay que rechazarlo.
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);

  // Limpieza ocasional para que el Map no crezca indefinidamente.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

// Recorta un string a un largo máximo (defensa contra payloads gigantes).
export function clamp(value, max) {
  if (typeof value !== "string") return value ?? null;
  const s = value.trim();
  return s ? s.slice(0, max) : null;
}
