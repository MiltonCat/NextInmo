// Tabla del modo sombra de Jev: por cada frase escrita a Lucía, qué hizo el
// router actual y qué habría hecho Jev. Sirve para decidir con datos si Jev
// entra en línea, no para responder. Sin IP ni identidad; la pregunta se
// guarda saneada igual que en lucia_preguntas (ver lib/luciaPreguntas.js).
//
// Uso: node scripts/setup-lucia-sombra.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const SQL = `
create table if not exists public.lucia_sombra_jev (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  pregunta       text not null check (char_length(pregunta) <= 600),
  paso           text,
  -- ruta_real: lo que pasó de verdad (ia | guiado | tasador | ia_tasacion).
  -- ruta_router: lo que dice rutaDelTexto recalculado en el servidor.
  ruta_real      text not null check (ruta_real in ('ia', 'guiado', 'tasador', 'ia_tasacion')),
  ruta_router    text,
  filtros_router jsonb not null default '{}',
  ruta_jev       text check (ruta_jev is null or ruta_jev in ('ia', 'guiado')),
  operacion_jev  text,
  modulos_jev    jsonb,
  senales        jsonb,
  probabilidades jsonb,
  aclarar_entre  text[] not null default '{}',
  coincide       boolean,
  diferencias    text[] not null default '{}',
  latencia_ms    integer,
  error          text,
  model          text,
  con_historial  boolean not null default false,
  page_path      text,
  interno        boolean not null default false
);

create index if not exists lucia_sombra_jev_created_at_idx
  on public.lucia_sombra_jev (created_at desc);
create index if not exists lucia_sombra_jev_discrepancias_idx
  on public.lucia_sombra_jev (created_at desc) where coincide = false;
create index if not exists lucia_sombra_jev_diferencias_idx
  on public.lucia_sombra_jev using gin (diferencias);

-- Sin políticas: solo la clave secreta del servidor lee y escribe.
alter table public.lucia_sombra_jev enable row level security;
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
  console.log("Tabla lucia_sombra_jev + índices + RLS listos");
} catch (error) {
  console.error("Error:", error.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
