// Prepara la tabla `seguimientos_valor` ("Seguí el valor de tu propiedad"):
// cada dueño que tasó en el sitio y pidió que le escribamos una vez por mes
// cuánto vale su propiedad.
//
// RLS activo y SIN policies, igual que `subscribers` y el CRM: lee y escribe
// solo el servidor con la clave secreta.
//
// Idempotente: se puede correr varias veces sin romper nada.
// Uso: node scripts/setup-seguimientos.mjs
// (o pegar el SQL de abajo en el SQL Editor de Supabase)
import { Client } from "pg";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const l of raw.split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

export const SQL = `
create table if not exists public.seguimientos_valor (
  id               bigint generated always as identity primary key,
  creado           timestamptz not null default now(),
  -- Llave de los enlaces del mail (baja, "quiero vender"). Larga y aleatoria.
  token            text not null unique,
  email            text not null,
  nombre           text,
  ciudad           text not null default 'sma',
  -- Lo que se le manda al modelo cada mes, ya normalizado (lib/tasador.js).
  payload          jsonb not null,
  payload_hash     text not null,
  etiqueta         text not null,
  tipo             text not null,
  barrio           text not null,
  -- Lo que vio la persona al anotarse y lo último que le mandamos.
  valor_inicial    numeric,
  valor_ultimo     numeric,
  rango_min_ultimo numeric,
  rango_max_ultimo numeric,
  ultimo_envio     timestamptz,
  proximo_envio    timestamptz not null default (now() + interval '30 days'),
  envios           integer not null default 0,
  activo           boolean not null default true,
  baja             timestamptz,
  quiere_vender    timestamptz
);

-- Una sola alta activa por persona y propiedad.
create unique index if not exists seguimientos_valor_unico_activo
  on public.seguimientos_valor (email, payload_hash) where activo;

-- Lo que lee el cron todos los días.
create index if not exists seguimientos_valor_pendientes
  on public.seguimientos_valor (proximo_envio) where activo;

alter table public.seguimientos_valor enable row level security;
`;

if (import.meta.url === `file://${process.argv[1]}`) {
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
    console.log("✓ Tabla seguimientos_valor + índices + RLS listos");
  } catch (e) {
    console.error("Error:", e.message);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}
