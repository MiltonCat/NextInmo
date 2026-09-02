// Tabla de preguntas de texto libre que le hacen a Lucía. Es el insumo para
// decidir qué contenido escribir: cada fila es una búsqueda real, con las
// palabras de una persona. NO guarda IP ni identidad del visitante, y el
// servidor le borra a la pregunta los mails y los números largos antes de
// insertarla (ver lib/luciaPreguntas.js).
//
// Se cruza con lucia_feedback por answer_id: ahí se ve qué preguntas se
// llevaron un pulgar abajo.
//
// Uso: node scripts/setup-lucia-preguntas.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const SQL = `
create table if not exists public.lucia_preguntas (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  pregunta    text not null check (char_length(pregunta) <= 600),
  answer_id   uuid unique,
  -- "ia" = paso por el modelo. "guiado" = el router la mando al arbol de
  -- botones y nunca hubo respuesta de IA; en esas filas respondida va en null.
  ruta        text not null default 'ia' check (ruta in ('ia', 'guiado')),
  respondida  boolean default true,
  error       text,
  fuentes     smallint not null default 0,
  page_path   text,
  model       text
);

create index if not exists lucia_preguntas_created_at_idx
  on public.lucia_preguntas (created_at desc);
-- Para buscar por tema:
--   select pregunta from lucia_preguntas
--   where to_tsvector('spanish', pregunta) @@ plainto_tsquery('spanish', 'alquiler');
create index if not exists lucia_preguntas_texto_idx
  on public.lucia_preguntas using gin (to_tsvector('spanish', pregunta));
alter table public.lucia_preguntas enable row level security;

-- Migracion para la tabla que ya existe (creada el 02/09/2026 sin estas dos):
alter table public.lucia_preguntas add column if not exists ruta text not null default 'ia';
alter table public.lucia_preguntas alter column respondida drop not null;
do $$ begin
  alter table public.lucia_preguntas add constraint lucia_preguntas_ruta_check
    check (ruta in ('ia', 'guiado'));
exception when duplicate_object then null; end $$;
create index if not exists lucia_preguntas_ruta_idx
  on public.lucia_preguntas (ruta, created_at desc);
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
  console.log("Tabla lucia_preguntas + índices + RLS listos");
} catch (error) {
  console.error("Error:", error.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
