// Prepara el backend de SUSCRIPTORES ("sé el primero en enterarte"):
//   Tabla `subscribers` (cada persona que deja su email para recibir avisos
//   de propiedades nuevas) con RLS habilitado.
//
// RLS queda activo SIN policies de acceso anónimo a propósito: las escrituras
// las hace el servidor con la clave secreta (que ignora RLS), igual que el CRM.
// Así nadie puede leer ni insertar suscriptores directo contra la API.
//
// Idempotente: se puede correr varias veces sin romper nada.
// Uso: node scripts/setup-suscriptores.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

// Cargar .env.local
const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const l of raw.split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SQL = `
-- Cada persona que se suscribe para recibir avisos de propiedades nuevas.
create table if not exists public.subscribers (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  email       text not null unique,
  nombre      text,
  interes     text,   -- qué busca: comprar / alquilar / invertir / mirar
  source      text not null default 'web',
  estado      text not null default 'activo'
                check (estado in ('activo','baja')),
  notas       text
);

-- Listar por fecha en el panel.
create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);

-- RLS activo y sin policies: solo el servidor (clave secreta) puede leer/escribir.
alter table public.subscribers enable row level security;
`;

const client = new Client({
  host: "db.fukarishpopbtxtzhrrd.supabase.co",
  port: 5432,
  user: "postgres",
  password: process.env.CLAVE_BASE_DATOS,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("✓ Tabla subscribers + índice + RLS listos");
  console.log("\nListo. Backend de suscriptores preparado.");
} catch (e) {
  console.error("Error:", e.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
