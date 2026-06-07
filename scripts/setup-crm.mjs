// Prepara el backend del MINI-CRM de consultas (Fase 3):
//   Tabla `inquiries` (cada lead que entra por la web) con RLS habilitado.
//
// RLS queda activo SIN policies de acceso anónimo a propósito: las escrituras
// las hace el servidor con la clave secreta (que ignora RLS), igual que adminDb.
// Así nadie puede leer ni insertar consultas directo contra la API de Supabase.
//
// Idempotente: se puede correr varias veces sin romper nada.
// Uso: node scripts/setup-crm.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

// Cargar .env.local
const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const l of raw.split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SQL = `
-- Cada consulta/lead que entra por la web (tasación, propiedad, visita, contacto).
create table if not exists public.inquiries (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  tipo            text not null check (tipo in ('tasacion','propiedad','visita','contacto')),
  nombre          text,
  telefono        text,
  email           text,
  mensaje         text,
  property_id     integer,
  property_title  text,
  detalle         jsonb not null default '{}'::jsonb,
  estado          text not null default 'nuevo'
                    check (estado in ('nuevo','contactado','en_proceso','cerrado','descartado')),
  notas           text
);

-- Índices para el panel: listar por fecha y filtrar por estado.
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_estado_idx on public.inquiries (estado);

-- RLS activo y sin policies: solo el servidor (clave secreta) puede leer/escribir.
alter table public.inquiries enable row level security;
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
  console.log("✓ Tabla inquiries + índices + RLS listos");
  console.log("\nListo. Backend del mini-CRM preparado.");
} catch (e) {
  console.error("Error:", e.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
