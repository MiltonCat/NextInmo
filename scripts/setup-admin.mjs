// Prepara el backend de Supabase para el panel de administración:
//   1. Crea (o actualiza) el usuario admin que inicia sesión en /admin.
//   2. Crea el bucket público de Storage para las fotos de las propiedades.
//
// Idempotente: se puede correr varias veces sin duplicar nada.
// Usa la API REST de Supabase directamente (sin supabase-js) para evitar la
// dependencia de WebSocket que no existe en Node 20.
//
// Uso:
//   node scripts/setup-admin.mjs <email> <password>
import { readFileSync } from "node:fs";

// Carga simple de .env.local (sin dependencias externas).
function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* sin .env.local: se usan variables de entorno del sistema */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "property-images";

const [, , email, password] = process.argv;

if (!url || !secret) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Uso: node scripts/setup-admin.mjs <email> <password>");
  process.exit(1);
}

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

async function api(path, init = {}) {
  const res = await fetch(`${url}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = body?.msg || body?.message || body?.error || text || res.statusText;
    throw new Error(`${res.status} ${path} → ${msg}`);
  }
  return body;
}

async function ensureUser() {
  // ¿Ya existe un usuario con ese email?
  const list = await api(`/auth/v1/admin/users?per_page=1000`);
  const users = list?.users ?? [];
  const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    await api(`/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({ password, email_confirm: true }),
    });
    console.log(`✓ Usuario admin actualizado: ${email}`);
  } else {
    await api(`/auth/v1/admin/users`, {
      method: "POST",
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    console.log(`✓ Usuario admin creado: ${email}`);
  }
}

async function ensureBucket() {
  const buckets = await api(`/storage/v1/bucket`);
  if (Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET || b.id === BUCKET)) {
    console.log(`✓ Bucket de fotos ya existe: ${BUCKET}`);
    return;
  }
  await api(`/storage/v1/bucket`, {
    method: "POST",
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true, // las fotos se sirven públicamente en la web
      file_size_limit: 10485760, // 10 MB
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    }),
  });
  console.log(`✓ Bucket de fotos creado: ${BUCKET} (público)`);
}

try {
  await ensureUser();
  await ensureBucket();
  console.log("\nListo. Backend preparado.");
} catch (e) {
  console.error("Error preparando el backend:", e.message);
  process.exit(1);
}
