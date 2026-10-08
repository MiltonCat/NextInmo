-- Tabla `cierres`: operaciones cerradas con su precio REAL de cierre.
-- Etapa 3a de docs/plan-red-catalan.md.
--
-- `precio_cierre` es el monto real acordado por la propiedad, no el valor
-- escriturado si difiere. Sin `referencia` pública: ese campo es una nota
-- interna para que Milton reconozca la operación; nunca se publica.
--
-- RLS activo y SIN policies, igual que `subscribers` y el CRM: lee y escribe
-- solo el servidor con la clave secreta.
--
-- Idempotente: se puede correr varias veces. Pegar en el SQL Editor de Supabase.

create table if not exists public.cierres (
  id                bigint generated always as identity primary key,
  creado            timestamptz not null default now(),
  barrio            text not null,
  tipo              text not null check (tipo in ('casa','departamento','cabana','ph','lote','local')),
  operacion         text not null default 'venta' check (operacion in ('venta')),
  m2_cubiertos      numeric check (m2_cubiertos is null or m2_cubiertos > 0),
  m2_terreno        numeric check (m2_terreno is null or m2_terreno > 0),
  dormitorios       integer check (dormitorios is null or dormitorios >= 0),
  moneda            text not null default 'USD' check (moneda in ('USD')),
  precio_publicado  numeric not null check (precio_publicado > 0),
  precio_cierre     numeric not null check (precio_cierre > 0),
  fecha_cierre      date not null,
  dias_publicada    integer check (dias_publicada is null or dias_publicada >= 0),
  fuente            text not null default 'propia' check (fuente in ('propia','corredor','escribano')),
  validado          boolean not null default true,
  referencia        text,
  notas             text
);

create index if not exists cierres_barrio_fecha on public.cierres (barrio, fecha_cierre desc);

alter table public.cierres enable row level security;
