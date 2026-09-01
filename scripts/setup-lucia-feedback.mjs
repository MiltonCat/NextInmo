// Tabla mínima para evaluar Lucía. No guarda preguntas, respuestas, IP ni
// identidad del visitante. RLS sin policies: escribe solo el servidor.
// Uso: node scripts/setup-lucia-feedback.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const SQL = `
create table if not exists public.lucia_feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  answer_id   uuid not null unique,
  rating      smallint not null check (rating in (-1, 1)),
  reason      text check (reason is null or reason in ('incorrect','outdated','not_understood','incomplete')),
  comment     text check (comment is null or char_length(comment) <= 500),
  model       text,
  page_path   text
);

create index if not exists lucia_feedback_created_at_idx
  on public.lucia_feedback (created_at desc);
create index if not exists lucia_feedback_rating_idx
  on public.lucia_feedback (rating);
alter table public.lucia_feedback enable row level security;
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
  console.log("Tabla lucia_feedback + índices + RLS listos");
} catch (error) {
  console.error("Error:", error.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
