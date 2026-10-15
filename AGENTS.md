<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cómo trabajar en este repo

Sitio de Catalán Propiedades (catalanpropiedades.com.ar), inmobiliaria de San Martín
de los Andes. Lo mantiene Milton, que es el dueño y también programa. Respondele
siempre en español rioplatense, directo y sin relleno.

## Stack

- Next.js 16 con App Router, React 19, **JavaScript (no TypeScript)**, Tailwind 4.
- Datos en Supabase (`@supabase/ssr`, `@supabase/supabase-js`). Mapas con Leaflet.
- Deploy en Vercel; los crons están en `vercel.json`.
- Alias de imports en `jsconfig.json`. Seguí el estilo de los archivos vecinos.

## Comandos

```bash
npm run dev          # servidor local en http://localhost:3000
npm run lint         # ESLint
npm run build        # build de producción (lo mismo que corre CI y Vercel)
node --test tests/properties.test.mjs   # tests unitarios de CI
npx playwright test                    # e2e de los flujos críticos (ver e2e/README.md)
npx playwright test e2e/<archivo>.spec.js   # un solo flujo
```

## Antes de dar algo por terminado

1. `npm run lint` sin errores.
2. Los tests unitarios de arriba en verde.
3. Si tocaste una página, un formulario o un flujo de `e2e/`, correr ese spec.
4. Si el cambio es grande o toca configuración, `npm run build`.
5. Contarle a Milton qué verificaste y qué no pudiste verificar.

## Git y deploy: cuidado

- **Todo push a `main` sale a producción en Vercel.** No hagas `git push` ni merges a
  `main` sin que Milton lo pida. Commitear localmente está bien si lo pide.
- CI (`.github/workflows/ci.yml`) corre lint, tests unitarios y build en cada push/PR.

## Secretos

- `.env.local` tiene claves reales: no lo leas en voz alta, no copies valores a la
  respuesta, a logs ni a archivos versionados.
- Solo lo que empieza con `NEXT_PUBLIC_` llega al navegador. Nunca le pongas ese
  prefijo a una clave secreta (por ejemplo `OPENAI_API_KEY`).
- Los tests nunca mandan datos reales (ver `e2e/README.md`).

## Entorno

- Windows 11 con PowerShell 7. Usá comandos compatibles con PowerShell
  (`Remove-Item`, `Get-ChildItem`, rutas con `\`), no bash.
- No crees archivos `.md` sueltos en la raíz (notas, planes, análisis) salvo que
  Milton lo pida; ya hay demasiados.

# Fotos del catálogo: leer antes de tocar cualquier galería

## Qué pasó una vez

En un sitio anterior de Milton, una migración de imágenes **renombró los archivos**.
La atadura entre cada propiedad y sus fotos era el nombre del archivo, así que al
renombrarlos las fotos quedaron **cruzadas entre propiedades**: la ficha de una casa
mostraba las fotos de otra. Hubo que rehacer el catálogo entero a mano.

Para una inmobiliaria eso no es un bug cosmético. Alguien puede viajar a ver una casa
que no es la que vio en pantalla, y la confianza que el resto del sitio construye se
cae de una.

## Las reglas que salen de ahí

1. **Nunca renombrar, mover ni reorganizar archivos de imagen** sin que Milton lo pida
   explícitamente y sepa lo que implica. Si hace falta, es una tarea propia, no un
   efecto secundario de otro cambio.
2. **La fuente de verdad de qué foto es de qué propiedad es la base**, no el nombre del
   archivo: los campos `image`, `image1`…`image4` de la tabla `properties` guardan la
   URL completa. El código solo pasa lo que dice la base.
3. **Antes y después de tocar cualquier galería, correr `scripts/verificar-fotos.mjs`**
   y comparar los dos snapshots. El script abre cada ficha real y comprueba que las
   fotos que muestra sean las que la base le asigna a esa propiedad. Si el diff no sale
   vacío, revertir.
4. Al proponerle un cambio a Milton, **decirle siempre si toca archivos, base de datos o
   solo código.** Es la distinción que le importa y la que evita este accidente.

Componentes que muestran fotos del catálogo: `PropertyCard`, `PropertyDetailClient`
(portada, grilla desktop y carrusel mobile), `Lightbox`, `PhotoTour`, `PropertyMap`.

## Íconos del sitio

El favicon de la marca es `app/favicon.svg` (la "C" con el copo de nieve). Hay tres
archivos más que tienen que mostrar exactamente lo mismo, y que se olvidaron en un
rebrand anterior — quedó una pelota de fútbol del Mundial saliendo en Google durante
meses:

- `public/favicon.ico` — es el que lee Google y el que más tarda en actualizarse
- `app/icon.png` — Next lo detecta solo y lo publica como ícono de la app
- `public/icon.png`

Se regeneran del SVG con `cairosvg`. Si se cambia la marca, se cambian los cuatro.

# Los diagramas de `docs/`: internos, no van a `public/`

`docs/tasador-flujo.*` y `docs/web-arquitectura.*` son mapas del sistema generados con
Archify. **No se mueven, copian ni embeben desde `public/`.** Un archivo en `public/`
queda servido en una URL abierta apenas se pushea a main, y estos diagramas nombran el
panel de admin, las tablas de Supabase, los endpoints, la sonda de salud y el límite de
tasa del tasador con su número exacto. Publicar ese número es publicar a qué velocidad
hay que ir para no activarlo.

Son material de venta cara a cara, no contenido del sitio. Si hace falta una sección
pública de "cómo funciona", se escribe una versión aparte para eso; no se recorta esta.

La fuente de cada diagrama es el `.json` (~7 KB, se diffea). El `.html` es la salida
compilada de ~840 KB: se regenera, no se edita a mano.

## Mantenerlos al día

**Al terminar un cambio estructural** —una ruta de `app/api`, una pantalla de
`app/admin`, algo de `lib/`, el flujo del tasador— correr:

```bash
node scripts/verificar-diagramas.mjs
```

Compara el último commit de cada `.json` contra el de los archivos que describe y dice
cuál quedó atrás. Si marca alguno viejo, avisarle a Milton para regenerarlo: un diagrama
desactualizado que se muestra en una reunión es peor que no tenerlo. Si el cambio suma
un archivo estructural nuevo, agregarlo a la lista `DIAGRAMAS` del script.

Detalle completo en `docs/README.md`.
