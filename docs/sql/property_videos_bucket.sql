-- Storage — el bucket de propiedades acepta video.
--
-- Correr una sola vez en el SQL Editor de Supabase. Ya se corrió en producción
-- el 20/08/2026; esto queda como registro y para poder rehacerlo si alguna vez
-- se recrea el proyecto.
--
-- POR QUÉ: la galería de una propiedad ahora puede incluir un recorrido en
-- video además de las fotos (ver lib/photoImages.js). El bucket estaba cerrado
-- a imágenes y lo rechazaba de dos maneras distintas:
--
--   1. `allowed_mime_types` solo tenía los cuatro formatos de imagen, así que
--      un `video/mp4` daba error de Storage al subirlo.
--   2. `file_size_limit` estaba en 10 MB. Un recorrido de un minuto en 720p
--      ronda los 8-10 MB y entraba raspando; cualquier cosa más larga, no.
--
-- El tope nuevo es 50 MB. No es más alto a propósito: el plan Free de Supabase
-- incluye 5 GB de egress por mes, y cada reproducción completa descuenta el
-- peso entero del archivo (no hay calidad adaptativa como en YouTube). Con
-- videos de ~10 MB eso da varios cientos de reproducciones mensuales de
-- margen; con videos de 50 MB, cinco veces menos. Conviene comprimir antes de
-- subir.
--
-- `video/quicktime` es el .mov del iPhone, que es como va a venir la mayoría.

update storage.buckets
   set file_size_limit = 52428800,  -- 50 MB
       allowed_mime_types = array[
         'image/jpeg',
         'image/png',
         'image/webp',
         'image/avif',
         'video/mp4',
         'video/quicktime',
         'video/webm'
       ]
 where id = 'property-images';

-- Verificación:
--
--   select id, file_size_limit, allowed_mime_types from storage.buckets;
--
-- Para volver atrás (deja de aceptar video; los ya subidos siguen sirviéndose):
--
--   update storage.buckets
--      set file_size_limit = 10485760,
--          allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
--    where id = 'property-images';
