-- Cuentas de clientes: perfiles, roles controlados por servidor y aislamiento RLS.
--
-- Aplicar manualmente una sola vez desde el SQL Editor del proyecto correcto de
-- Supabase. El script es repetible y no habilita todavía ninguna UI de cliente.
-- /admin sigue dependiendo de ADMIN_USER_ID en la aplicación; esta migración no
-- reemplaza ni relaja esa protección.

begin;

-- El rol nunca se toma de user_metadata ni de datos enviados por el navegador.
-- Solo service_role / SQL Editor pueden modificar esta tabla: authenticated
-- recibe únicamente SELECT, limitado por RLS.
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'client'
              check (role in ('client', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

-- SECURITY DEFINER permite consultar el rol dentro de políticas sin provocar
-- recursión sobre profiles. El search_path vacío evita object shadowing.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

drop policy if exists profiles_read_own_or_admin on public.profiles;
create policy profiles_read_own_or_admin
on public.profiles
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Cada alta de Auth obtiene un perfil client. No se copian roles desde metadata.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Incluye usuarios existentes sin otorgar privilegios administrativos.
insert into public.profiles (user_id, role)
select id, 'client'
from auth.users
on conflict (user_id) do nothing;

-- Favoritos futuros. La clave compuesta impide duplicados por usuario.
create table if not exists public.client_favorites (
  user_id      uuid not null references auth.users(id) on delete cascade,
  property_id  bigint not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists client_favorites_user_created_idx
  on public.client_favorites (user_id, created_at desc);

alter table public.client_favorites enable row level security;
revoke all on table public.client_favorites from anon, authenticated;
grant select, insert, delete on table public.client_favorites to authenticated;

drop policy if exists client_favorites_read_own_or_admin on public.client_favorites;
create policy client_favorites_read_own_or_admin
on public.client_favorites
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists client_favorites_insert_own on public.client_favorites;
create policy client_favorites_insert_own
on public.client_favorites
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists client_favorites_delete_own_or_admin on public.client_favorites;
create policy client_favorites_delete_own_or_admin
on public.client_favorites
for delete
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Tasaciones guardadas futuras. payload/result quedan en JSONB para no fijar
-- prematuramente el contrato del modelo; RLS ya garantiza pertenencia.
create table if not exists public.saved_valuations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text check (label is null or char_length(label) <= 200),
  payload     jsonb not null default '{}'::jsonb,
  result      jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists saved_valuations_user_created_idx
  on public.saved_valuations (user_id, created_at desc);

alter table public.saved_valuations enable row level security;
revoke all on table public.saved_valuations from anon, authenticated;
grant select, insert, update, delete on table public.saved_valuations to authenticated;

drop policy if exists saved_valuations_read_own_or_admin on public.saved_valuations;
create policy saved_valuations_read_own_or_admin
on public.saved_valuations
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists saved_valuations_insert_own on public.saved_valuations;
create policy saved_valuations_insert_own
on public.saved_valuations
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists saved_valuations_update_own on public.saved_valuations;
create policy saved_valuations_update_own
on public.saved_valuations
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists saved_valuations_delete_own_or_admin on public.saved_valuations;
create policy saved_valuations_delete_own_or_admin
on public.saved_valuations
for delete
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Relación explícita entre una cuenta y una publicación. No se infiere por
-- email, teléfono ni metadata. Solo service_role / SQL Editor asignan vínculos.
create table if not exists public.property_owners (
  user_id      uuid not null references auth.users(id) on delete cascade,
  property_id  bigint not null references public.properties(id) on delete cascade,
  assigned_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists property_owners_property_idx
  on public.property_owners (property_id, user_id);

alter table public.property_owners enable row level security;
revoke all on table public.property_owners from anon, authenticated;
grant select on table public.property_owners to authenticated;

drop policy if exists property_owners_read_own_or_admin on public.property_owners;
create policy property_owners_read_own_or_admin
on public.property_owners
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Métricas limitadas a una publicación y una fecha. La tabla arranca vacía:
-- un proceso de servidor deberá poblarla desde fuentes reales. Los clientes no
-- tienen INSERT/UPDATE/DELETE, por lo que no pueden fabricar rendimiento.
create table if not exists public.property_performance_daily (
  property_id         bigint not null references public.properties(id) on delete cascade,
  metric_date         date not null,
  detail_views        integer not null default 0 check (detail_views >= 0),
  favorite_adds       integer not null default 0 check (favorite_adds >= 0),
  inquiries_received integer not null default 0 check (inquiries_received >= 0),
  updated_at          timestamptz not null default now(),
  primary key (property_id, metric_date)
);

alter table public.property_performance_daily enable row level security;
revoke all on table public.property_performance_daily from anon, authenticated;
grant select on table public.property_performance_daily to authenticated;

drop policy if exists property_performance_read_owner_or_admin on public.property_performance_daily;
create policy property_performance_read_owner_or_admin
on public.property_performance_daily
for select
to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1
    from public.property_owners
    where property_owners.property_id = property_performance_daily.property_id
      and property_owners.user_id = (select auth.uid())
  )
);

-- Las consultas anónimas actuales siguen entrando por /api/consultas usando
-- service_role y user_id NULL. Una futura sesión podrá asociar la consulta, pero
-- el servidor debe obtener auth.uid(); nunca debe aceptar user_id del body.
alter table if exists public.inquiries
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists inquiries_user_created_idx
  on public.inquiries (user_id, created_at desc);

alter table public.inquiries enable row level security;

-- No existe hoy acceso directo legítimo de anon/authenticated a inquiries: la
-- app usa service_role. Se eliminan políticas anteriores para evitar que una
-- política permisiva se combine por OR y exponga consultas de otros clientes.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'inquiries'
  loop
    execute format(
      'drop policy if exists %I on public.inquiries',
      existing_policy.policyname
    );
  end loop;
end;
$$;

revoke all on table public.inquiries from anon, authenticated;
grant select on table public.inquiries to authenticated;

create policy inquiries_read_own_or_admin
on public.inquiries
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1
    from public.property_owners
    where property_owners.property_id = inquiries.property_id
      and property_owners.user_id = (select auth.uid())
  )
);

commit;

-- Paso manual posterior (no reemplaza ADMIN_USER_ID):
-- 1. Verificar el UUID actual en Authentication > Users y que coincida con
--    ADMIN_USER_ID del deployment.
-- 2. Ejecutar, reemplazando el UUID:
--      update public.profiles
--      set role = 'admin', updated_at = now()
--      where user_id = '<ADMIN_USER_ID>'::uuid;
-- 3. Confirmar que ningún usuario adicional tenga role = 'admin':
--      select user_id, role from public.profiles order by created_at;
-- 4. Vincular propietarios solo después de validar identidad y titularidad:
--      insert into public.property_owners (user_id, property_id)
--      values ('<USER_ID>'::uuid, <PROPERTY_ID>)
--      on conflict do nothing;
