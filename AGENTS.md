<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
