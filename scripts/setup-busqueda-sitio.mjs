// Indice semantico del sitio. Es lo que le permite a Lucia encontrar una nota o
// una guia por SIGNIFICADO y no por coincidencia de palabras: "me conviene
// comprar ahora" no comparte una sola palabra con /inversiones, y hasta ahora
// por eso no la encontraba.
//
// Cada fila es un fragmento de una pagina publicada, con su embedding. Lo llena
// scripts/indexar-sitio.mjs, que lee las paginas REALES de produccion (no el
// codigo): asi lo que busca Lucia es exactamente lo que ve un visitante.
//
// RLS habilitado sin policies: lee el servidor con la clave secreta. La funcion
// buscar_sitio queda como SECURITY INVOKER a proposito, para que nadie pueda
// vaciar el contenido del sitio desde el navegador con la clave publica.
//
// Uso: node scripts/setup-busqueda-sitio.mjs
import { Client } from "pg";
import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of raw.split("\n")) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

// 1536 son las dimensiones de text-embedding-3-small. Si algun dia se cambia de
// modelo hay que recrear la columna Y reindexar todo: los vectores de dos
// modelos distintos no se pueden comparar entre si.
const SQL = `
create extension if not exists vector;

create table if not exists public.sitio_fragmentos (
  id             bigint generated always as identity primary key,
  url            text not null,
  titulo         text,
  seccion        text,
  orden          integer not null default 0,
  fragmento      text not null,
  pagina_hash    text not null,
  embedding      vector(1536) not null,
  actualizado_at timestamptz not null default now()
);

create index if not exists sitio_fragmentos_url_idx on public.sitio_fragmentos (url);
-- HNSW: busqueda aproximada por coseno. Anda bien desde la primera fila, a
-- diferencia de ivfflat, que necesita datos cargados antes de construirse.
create index if not exists sitio_fragmentos_embedding_idx
  on public.sitio_fragmentos using hnsw (embedding vector_cosine_ops);

alter table public.sitio_fragmentos enable row level security;

-- El vector entra como texto ("[0.1,0.2,...]") y se castea adentro: PostgREST no
-- sabe serializar el tipo vector en los argumentos de una RPC.
create or replace function public.buscar_sitio(consulta text, cantidad integer default 6)
returns table (url text, titulo text, seccion text, fragmento text, similitud double precision)
language sql
stable
as $$
  select f.url, f.titulo, f.seccion, f.fragmento,
         1 - (f.embedding <=> consulta::vector(1536)) as similitud
  from public.sitio_fragmentos f
  order by f.embedding <=> consulta::vector(1536)
  limit greatest(1, least(coalesce(cantidad, 6), 20));
$$;
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
  console.log("Tabla sitio_fragmentos + indice HNSW + funcion buscar_sitio listos");
} catch (error) {
  console.error("Error:", error.message);
  try { await client.end(); } catch {}
  process.exit(1);
}
