-- Propiedades — galería completa en una columna `images`.
--
-- Correr una sola vez en el SQL Editor de Supabase.
--
-- POR QUÉ (2026-08-20): hoy cada propiedad tiene exactamente cinco casilleros
-- de foto (`image`, `image1`..`image4`). Eso impone dos límites que se notan:
--
--   1. Cinco fotos no alcanzan para una casa. La competencia publica quince o
--      veinte, y la ficha se ve pobre al lado.
--   2. No hay forma de decir QUÉ muestra cada foto, así que no se pueden
--      agrupar por ambiente. El "Recorrido fotográfico" estilo Airbnb
--      (components/PhotoTour.jsx) existe desde el 23/07/2026 pero quedó
--      desconectado el 04/08/2026 justamente por esto.
--
-- Esta columna guarda la galería entera, ordenada, con la categoría de cada
-- foto:
--
--     [{"url": "https://…/cocina.jpg",  "category": "cocina"},
--      {"url": "https://…/patio.jpg",   "category": "exterior"},
--      {"url": "https://…/frente.jpg",  "category": null}]
--
-- `images[0]` es siempre la portada.
--
-- NADA SE ROMPE SI ESTA MIGRACIÓN NO SE CORRE. `normalizeImages()` en
-- lib/photoImages.js arma la galería desde los cinco campos viejos cuando la
-- columna está vacía, y el panel sigue escribiendo `image`/`image1..4` como
-- espejo de las primeras cinco. Las tarjetas, el SEO, el mapa y los correos
-- leen esos campos y no se enteran del cambio.
--
-- Las categorías válidas son las de PHOTO_CATEGORIES en lib/photoImages.js.
-- `category: null` es legítimo y frecuente: esas fotos caen en el grupo
-- "Fotos adicionales" al final del recorrido.

alter table public.properties
  add column if not exists images jsonb;

comment on column public.properties.images is
  'Galería ordenada: [{url, category}]. category ∈ (cocina, dormitorio, bano, exterior, otros) o null. images[0] es la portada. NULL o [] = usar los campos image/image1..image4.';


-- ── Carga inicial ───────────────────────────────────────────────────────────
--
-- Las fotos que ya existen pasan a la columna nueva SIN categoría: nadie sabe
-- cuál es la cocina y cuál el living, y adivinar sería inventar. Quedan todas
-- en "Fotos adicionales" hasta que se les asigne el ambiente desde el panel,
-- foto por foto.
--
-- Se preserva el orden histórico (image → image1 → image2 → image3 → image4)
-- para que ninguna ficha cambie de portada al correr esto.

update public.properties
   set images = (
     select coalesce(jsonb_agg(jsonb_build_object('url', u, 'category', null)), '[]'::jsonb)
       from unnest(array[image, image1, image2, image3, image4]) as u
      where u is not null and u <> ''
   )
 where images is null;

-- Verificación: cuántas fotos quedó con cada propiedad, y cuántas sin ambiente.
--
--   select id, title,
--          jsonb_array_length(coalesce(images, '[]'::jsonb)) as fotos,
--          (select count(*) from jsonb_array_elements(coalesce(images, '[]'::jsonb)) f
--            where f->>'category' is null) as sin_ambiente
--     from public.properties
--    order by id;
--
-- Para volver atrás (la columna es aditiva, así que alcanza con ignorarla):
--
--   alter table public.properties drop column if exists images;
