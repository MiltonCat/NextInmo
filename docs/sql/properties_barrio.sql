-- Propiedades — campo `barrio` explícito.
--
-- Correr una sola vez en el SQL Editor de Supabase.
--
-- POR QUÉ (2026-08-14): hasta hoy el barrio de una propiedad se deducía del
-- campo `location`, que es texto libre. Al medirlo contra el catálogo real, 6
-- de las 8 propiedades en venta no matcheaban ningún barrio, porque `location`
-- casi siempre trae la dirección sola:
--
--     "Rivadavia 155, San Martín de los Andes"        -> sin barrio
--     "Coronel Perez 234, San Martín de los Andes"    -> sin barrio
--     "Santafe 701, San Martín de los Andes"          -> sin barrio
--
-- Consecuencia: /barrios/<slug> lista sus propiedades con esa misma deducción,
-- así que las 21 fichas de barrio quedaban prácticamente vacías. Centro —el
-- barrio con más propiedades relevadas y el más buscado del sitio— no mostraba
-- ninguna, teniendo varias a metros.
--
-- El campo es OPCIONAL a propósito: `barrioDePropiedad()` en lib/barrios.js usa
-- este valor y, si está vacío, sigue deduciendo de `location` como antes. Nada
-- se rompe si una fila queda sin cargar, y el sitio funciona igual aunque esta
-- migración todavía no se haya corrido.

alter table public.properties
  add column if not exists barrio text;

comment on column public.properties.barrio is
  'Slug canónico del barrio, de BARRIOS en lib/barrios.js (centro, chapelco-golf, la-cascada, vega-maipu, penon-de-lolog, caleuche, costanera, las-marias, las-pendientes, via-blanca, arrayan, lacar, patagonia-norte). NULL = deducir de location.';

-- Los barrios válidos son los de lib/barrios.js. Se valida acá también para que
-- una carga por SQL no meta un slug que el sitio no conoce y que quedaría
-- invisible sin dar error.
alter table public.properties
  drop constraint if exists properties_barrio_valido;

alter table public.properties
  add constraint properties_barrio_valido check (
    barrio is null or barrio in (
      'centro', 'chapelco-golf', 'la-cascada', 'vega-maipu', 'penon-de-lolog',
      'caleuche', 'costanera', 'las-marias', 'las-pendientes', 'via-blanca',
      'arrayan', 'lacar', 'patagonia-norte'
    )
  );

-- Las fichas de barrio filtran por este campo en cada build.
create index if not exists properties_barrio_idx
  on public.properties (barrio)
  where barrio is not null;


-- ── Carga inicial ───────────────────────────────────────────────────────────
--
-- Las dos que hoy sí se deducen bien del texto, para dejarlas explícitas y que
-- no dependan más de cómo esté escrita la dirección:

update public.properties set barrio = 'vega-maipu'
  where barrio is null and location ilike '%vega maip%';

update public.properties set barrio = 'penon-de-lolog'
  where barrio is null and location ilike '%lolog%';

-- El resto NO se completa por SQL a propósito: "Rivadavia 155" y "Coronel Perez
-- 234" están casi con certeza en Centro, pero casi no es lo mismo que sí, y una
-- propiedad publicada en el barrio equivocado es peor que una sin barrio. Se
-- cargan desde el panel (/admin/propiedades), que ya tiene el selector.
--
-- Para ver cuáles faltan:
--
--   select id, title, location, barrio
--     from public.properties
--    where barrio is null
--      and coalesce(vendida, false) = false
--    order by id;
