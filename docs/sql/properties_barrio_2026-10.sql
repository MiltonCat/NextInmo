-- Propiedades — amplía los barrios válidos de properties.barrio.
--
-- Correr una sola vez en el SQL Editor de Supabase (2026-10-15).
--
-- POR QUÉ: lib/barrios.js sumó 19 barrios que el modelo ya mide con 4 o más
-- propiedades (Altos del Sol, Camino Lolog, Altos del Chapelco…). Sin esto, el
-- selector del panel los muestra pero al guardar una propiedad en uno de ellos
-- la base la rechaza por el CHECK properties_barrio_valido.
--
-- La lista tiene que ser IGUAL a los slugs de lib/barrios.js.

alter table public.properties
  drop constraint if exists properties_barrio_valido;

alter table public.properties
  add constraint properties_barrio_valido check (
    barrio is null or barrio in (
      'centro',
      'chapelco-golf',
      'la-cascada',
      'vega-maipu',
      'penon-de-lolog',
      'caleuche',
      'costanera',
      'las-marias',
      'las-pendientes',
      'via-blanca',
      'arrayan',
      'lacar',
      'patagonia-norte',
      'vega-san-martin',
      'orillas-del-quilquihue',
      'san-fernando',
      'las-nalcas',
      'ruca-hue',
      'altos-del-sol',
      'altos-del-chapelco',
      'camino-lolog',
      'alihuen',
      'meliquina',
      'el-arenal',
      'valle-de-chapelco',
      'chacra-28',
      'la-balconada',
      'los-coirones',
      'faldeos-de-chapelco',
      'los-robles',
      'tierra-de-sol',
      'tiro-federal',
      'callejon-de-gingins',
      'el-desafio',
      'el-oasis',
      'lago-lolog',
      'rio-hermoso'
    )
  );

-- REVISAR A MANO: la carga inicial de properties_barrio.sql marcó como
-- 'penon-de-lolog' todo lo que tuviera "lolog" en la dirección. Con Camino Lolog
-- y Lago Lolog como barrios propios, alguna puede estar en el barrio equivocado:
--
--   select id, title, location, barrio
--     from public.properties
--    where barrio = 'penon-de-lolog'
--    order by id;
