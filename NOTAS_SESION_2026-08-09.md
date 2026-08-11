# Sesión 2026-08-09 — /precio-m2 pasa a leer del modelo

Contexto: `PLAN_PRECIO_M2.md`, Fase A ("que los números dejen de contradecirse").
**Nada de esto toca archivos de imagen ni la base de datos. Solo código.**

## Qué se rompió y se arregló

`/precio-m2` tenía todos sus números escritos a mano en el archivo. El resto del
sitio los lee de `lib/mercado.js` (→ `app/data/mercado_sma.json`, export del
modelo). Las dos versiones ya se habían separado:

| Dato | Publicaba `/precio-m2` | Publica el modelo |
|---|---|---|
| Suba del m² desde 2021 | +10 % | **+57,7 %** |
| Promedio del m² | USD 2.500–2.650 ("verificado") | Casa **2.085** · Depto **3.292** |
| Centro | 2.735 (depto) | mediana **3.400** (n=281) |
| Vega Maipú (ficha de barrio) | rango 1.400–1.900 | mediana **2.508** (n=18) |
| Fecha | "Julio 2026", hardcodeada | datos al **2026-08-06** |

`/tasacion` y `/precio-m2` decían al mismo tiempo que San Martín había subido
57,7 % y 10 %.

## Archivos tocados

**`lib/precioZonas.js` — reescrito.** Ya no tiene números. Antes eran 13 filas
`barrio × tipo` cargadas a mano; ese cruce no existe en el modelo (hay mediana
por barrio y valor por tipo, pero no "los departamentos del Centro"). Ahora
expone dos funciones que derivan del modelo:

- `medianaDeBarrio(slug)` → mediana + `n`, o `null` si el barrio no llega a 4
  propiedades relevadas.
- `barriosConMediana()` → los 21 barrios publicables, ordenados por volumen de
  datos, con nombre canónico del sitio y `slug` cuando tienen ficha.

El puente entre los nombres del scraping y los del sitio es explícito
(`Chapelco Golf` ↔ `Chapelco Golf & Resort`, `Las Marías` ↔ `Las Marias del
Valle Club de Campo`). Un slug fuera del mapa no tiene dato: no se inventa.

**`app/precio-m2/page.js` — reescrito.** Sin constantes de precio. Cambios:

- Serie de evolución = la del modelo (la misma que usa el tasador).
- Stats: casa y departamento por separado, cada uno con su rango intercuartil y
  su `n`. Se sacó el promedio mezclado — `lib/mercado.js` ya explicaba por qué
  no había que publicarlo.
- Tabla por barrio: 10 filas + `<details>` con las otras 11. El HTML lleva las
  21 aunque estén colapsadas, así que Google las indexa igual.
- Tabla por tipo (6 tipos, del modelo).
- Badges: de tres categorías a dos, iguales a `_leyenda_origen` del JSON. El
  promedio marcado "Verificado" en verde era el peor error de la página: un
  sello de confianza sobre un número que no coincidía con nada.
- Fecha calculada desde `MERCADO_GENERADO`.
- CTA a `/tasacion` arriba y en el cierre. Antes la página no lo mencionaba
  nunca, aunque es lo que la mayoría de sus visitantes está buscando.
- "El m² más caro de Argentina" pasó a pasado y con año: el dato es de 2022.
  **Si conseguís una fuente 2025/2026 se puede volver a poner en presente.**

**`app/barrios/[slug]/page.js`.** La tabla por tipo dentro del barrio se
reemplazó por la mediana real + `n`. Cuando el modelo tiene datos, ese es el
número y el rango editorial del perfil no se muestra: juntos se contradecían a
la vista. Los barrios sin datos suficientes (Peñón de Lolog, n=3) siguen
mostrando el rango del perfil, ahora diciendo por qué.

**`app/sitemap.js`.** `/precio-m2` y `/tasacion` usan `MERCADO_GENERADO` como
`lastModified` en vez de `now`. Decirle a Google que la página cambió hoy cuando
los datos son de hace un mes es una señal falsa.

## Bug encontrado de paso: "General" se publicaba como barrio

`mercado.valor_m2_usd.por_barrio` trae `"General"` (n=173) — el cajón de las
publicaciones sin barrio declarado. Es el segundo por volumen, así que aparecía
alto en todo ranking. **Tres páginas lo mostraban como si fuera un barrio de San
Martín, con USD 3.000/m²:**

- `/tasacion`, sección "El barrio manda" (puesto 2 de 4)
- `/blog/score-de-inversion-san-martin-de-los-andes` (puesto 2 de 6)
- El TXT descargable de `/inversiones` — **este sigue sin arreglar**, ver abajo

Las dos primeras ahora leen `barriosConMediana()`, que lo filtra.

## Rediseño (Fase D, misma sesión)

`/precio-m2` pasó al lenguaje visual de `/tasacion` — que es, en el fondo, el de
Airbnb: fondo blanco, tipografía grande semibold con el tracking cerrado en vez
de `font-black`, métricas en hairline en vez de tarjetas con sombra, mucho aire,
y bloques alternados de foto y texto. Se fueron el hero gris, el emoji 💡 y las
tablas encajonadas.

**Tres fotos, todas de Adobe Stock ya licenciadas y compartidas con `/tasacion`:**

| Sección | Foto |
|---|---|
| El barrio manda | `tasacion-cuentas.jpg` — pareja revisando cuentas |
| Un promedio no ve tu casa | `tasacion-ventana.jpg` — mujer mirando por la ventana |
| Por qué el m² es tan caro acá | `deco-living-fuego.jpg` — gente junto al hogar |

Son personas genéricas, **no clientes**, y los `alt` describen lo que se ve sin
inventarles una historia — misma regla que ya estaba escrita en `/tasacion`.
Todas van con `aspect-[4/3]` fijo y `sizes`, para que la foto no empuje el texto
hacia abajo al cargar.

Las tablas HTML se volvieron listas `<dl>` en hairline (se leen bien en mobile,
que era el otro problema: 13 filas × 4 columnas a 375 px). La lista de barrios
muestra 8 y las otras 13 quedan en un `<details>` — el HTML las lleva igual, así
que Google las sigue indexando.

Ningún dato cambió en este paso: las métricas siguen siendo 2.085 / 3.292 /
+57,7 % y los 21 barrios del modelo.

## Solo se publica el m² de casas y departamentos

La tabla por tipo publicaba los 6 tipos, incluida **Oficina, cuya mediana sale de
2 avisos**, con el mismo peso visual que Casa. Al revisarlo apareció algo peor:
hay **dos `n` distintos en el JSON y no significan lo mismo**.

| | Qué cuenta | Casa | Departamento |
|---|---|---|---|
| `relevadas.por_tipo` | avisos de ese tipo | 512 | 505 |
| `rango_por_tipo[].n` | propiedades sobre las que se calculó la mediana | **188** | **472** |

La diferencia son los descartes del modelo: 247 casas venían con el lote cargado
como superficie cubierta (`_nota_casas` del JSON). Publicar "USD 2.085/m² · 512
relevadas" era atribuirle al número un respaldo casi tres veces mayor del real.

Ahora la página publica **solo los tipos para los que el modelo exporta el `n` de
su mediana** — hoy Casa y Departamento — y con el `n` correcto. Cabaña, Local
Comercial, Terreno y Oficina salen de la página: el export no dice sobre cuántas
propiedades salió cada mediana, y un precio sin saber de dónde viene no es mejor
que no publicarlo.

La sección "Una casa y un terreno no se comparan" desapareció por consecuencia:
con dos filas era una copia peor de "Dónde cae la mayoría", que muestra los
mismos dos números con su rango intercuartil. Quedó una sola.

**Para recuperar los otros cuatro tipos** hay que hacer que
`modelo-predictivo-m2 → exportar_mercado.py` incluya el `n` de cada tipo en
`valor_m2_usd`, no solo en `rango_por_tipo`. Ahí vuelven solos.

### Verificación del total

- `relevadas.total` = **1.597** y la suma de `por_tipo` da 1.597 exacto. ✅
- `usables_modelo` = **1.017** = Casa (512) + Departamento (505). ✅
- La suma de `n` por barrio da 660, bastante menos que 1.597 — es esperable:
  solo cuenta las que tienen barrio identificable y superficie usable.
- ⚠️ El comentario de cabecera de `lib/mercado.js` todavía dice "1.753", de un
  export anterior. El código lee del JSON así que no afecta a nada publicado,
  pero conviene corregirlo para que no confunda al próximo que lo lea.

## Un solo número público en todo el sitio

`lib/mercado.js` ahora exporta **`RELEVADAS_PUBLICO`**, que es la única cifra de
propiedades que va a la web: **"más de 1.500"**. Se calcula redondeando el total
real hacia abajo al medio millar, así que no hay que tocarla nunca: cuando el
relevamiento pase de 2.000, la frase cambia sola.

`RELEVADAS_TOTAL_FMT` (1.597) y `RELEVADAS_MODELO_FMT` (1.017) quedan para uso
interno y para `/admin`. **Ninguna de las dos se publica ya.**

Por qué una sola cifra redondeada:

1. Un visitante que ve "1.597" en una página y "1.017" en otra no piensa "son
   métricas distintas": piensa que alguien se equivocó. Dos números exactos
   conviven mal aunque los dos sean correctos.
2. El total cambia en cada re-scrape, así que la cifra exacta queda vieja apenas
   se regenera el JSON — y hay 10 páginas que la usan.
3. "Más de 1.500" es verdad hoy y va a seguir siéndolo después del próximo
   relevamiento. No se puede refutar, no promete cobertura del mercado y no
   expone cómo se arma el dataset.

**Se descartó publicar un porcentaje de cobertura** ("cubrimos el X% del
mercado"): no existe denominador confiable. Los portales dan 2.279 (Zonaprop),
627 (Mitula) y 432 (Properati) para la misma ciudad, la misma propiedad aparece
en varios a la vez, y las ventas fuera de portal no se cuentan en ningún lado.
Cualquier porcentaje sería inventado, y una cifra que no se puede respaldar hace
más daño que no poner ninguna.

### Páginas tocadas (10)

`/` · `/precio-m2` · `/tasacion` · `/contacto` · `/nosotros` · `/vender` ·
`/inversiones` · y 3 artículos del blog.

Frases que hubo que reescribir, no solo cambiarles el número:

- `/tasacion` decía "el modelo se **entrenó con** 1.017 casas y departamentos".
  Con la cifra única eso sería falso, así que ahora dice que **se apoya en** un
  relevamiento de más de 1.500 propiedades — que sí es cierto.
- Lo mismo en el blog "cómo tasamos tu propiedad con datos".

### Dos cifras sueltas que aparecieron al barrer

- **`/blog/score-de-inversion`** tenía **"más de 1.700 propiedades"** escrito a
  mano dentro del **JSON-LD de FAQ** — un número de un export viejo que no
  coincidía con ninguno de los publicados. Y es justo el texto que Google levanta
  como respuesta destacada. Ahora sale de la constante.
- **`/inversiones`** mostraba `mercado.n_propiedades` exacto cuando la API en
  vivo respondía. Ahora usa siempre la cifra pública: si esa página dijera
  "1.712" mientras el resto dice "más de 1.500", el visitante no ve dos fuentes,
  ve una contradicción.

### Metodología sacada de /precio-m2

Se quitaron el desglose de casas/departamentos, la explicación de los descartes
por superficie mal cargada y los `n` al lado de cada precio. La página sigue
publicando solo casas y departamentos, pero ya no explica por qué — eso es
método propio y no le suma nada a quien está averiguando cuánto vale su casa.

## Fuera los portales de terceros

Ya no se nombra a **Argenprop, Zonaprop, Properati, Mercado Libre ni Realigro**
en ninguna parte del sitio. Eran 23 menciones en 5 archivos.

La fórmula de reemplazo es siempre la misma: **decir qué se miró, no dónde.**
"Relevamiento propio de la oferta publicada" en lugar de la lista de portales.
Sigue siendo cierto —la oferta publicada es lo que se releva— y deja de mandarle
el nombre de la competencia a un visitante que está en la página propia.

Archivos tocados:

- `lib/barriosPerfil.js` — 4 `precioFuente`
- `app/blog/donde-vivir-san-martin-de-los-andes` — 4 `precioFuente`, el pie de la
  tabla y un **link saliente a Properati** en "Fuentes consultadas"
- `components/InvestmentMap.jsx` — 2 descripciones de zona
- `app/inversiones/InversionesClient.js` — 12 menciones: el bloque `fuentes`, la
  serie histórica, 7 justificaciones del score, el pie del gráfico y el TXT
  descargable

Quedan a la vista **Diario 7 Lagos, LM Neuquén y DiarioAndino**: son prensa, no
competencia, y sostienen el dato de 2022. También queda **Airbnb** en una
justificación del score de `/inversiones` — no es competencia inmobiliaria, pero
si lo querés afuera es una línea.

## /inversiones: a blanco y alineada con el modelo

Era la última página con tema oscuro y la última con datos propios. Ahora todo
el sitio habla el mismo idioma visual y publica los mismos números.

### Datos (lo que más importaba)

`ZONA_DATA` **ya no existe**. Era un objeto con toda la página escrita a mano:

| Qué tenía | Decía | Ahora |
|---|---|---|
| `evolucionHistorica` | 2021→2026 con **+10,6 %** | `EVOLUCION_SERIE` del modelo: **+57,7 %** |
| `promedioGeneral` | 2.600 fijo | promedio de casa y depto del modelo |
| `zonas` | 13 filas barrio×tipo desfasadas | `barriosConMediana()` |
| `rentals` | 5 segmentos a mano | `%` desde `rentabilidad_alquiler` del modelo |
| `update` | "20 Abril 2026" | `MERCADO_GENERADO` |

El comentario de la constante vieja pedía "mantenerla alineada con la de
app/precio-m2/page.js". Es exactamente lo que nunca pasa cuando hay dos copias.

**El reporte TXT descargable** armaba cada fila con `z.tipo`, un campo que
`por_barrio` no tiene, así que todas salían con un `undefined` en el medio — y
sin filtrar "General". Ahora sale de `barriosConMediana()`.

**La nota al pie del gráfico** describía la serie vieja: "mercado maduro,
precios estables, sin grandes saltos" para una curva que ahora sube 57,7 %.
Reescrita para que describa el gráfico que está arriba.

**El badge verde "Verificado"** se eliminó. Los dos bloques que lo usaban están
marcados `referencia_curada` en el JSON: se cargan a mano, no salen del
relevamiento. Es el mismo error que se corrigió en `/precio-m2`.

### Diseño

Fondo blanco, tipografía semibold con tracking cerrado, `max-w-6xl`, y las
métricas del hero en hairline en lugar de tres tarjetas — el tratamiento de
Airbnb que ya usan `/tasacion` y `/precio-m2`. Se fueron la grilla de fondo del
hero, el degradado y los `font-black`.

Los cuatro componentes hijos también: `InvestorQuiz`, `AdvisoryProcess`,
`InversionesMatrizChart` y `InversionesEvolucionChart`.

**Ojo con los gráficos:** venían calibrados para fondo oscuro. La grilla estaba
en gris 800 y las líneas de referencia en blanco translúcido — sobre blanco
habrían quedado invisibles. Los tooltips también pasaron a claro.
`InversionesEvolucionChart` lo comparte `/precio-m2`, así que el cambio le sirve
a las dos.

## Pendiente

1. **`app/inversiones/InversionesClient.js:318`** — el reporte TXT que se
   descarga arma sus filas con `mercado.por_barrio.map(z => ...)` usando
   `z.tipo`, que en `por_barrio` no existe (sale `undefined`), y sin filtrar
   "General". No lo toqué porque es un client component y `mercado` le llega
   como prop: quiero mirar cómo se arma antes de cambiarlo.
2. **Verificar el dato de "el m² más caro de Argentina"** con una fuente
   2025/2026, o dejarlo en pasado.
3. **No pude correr `npm run build`** en el entorno de esta sesión: el sandbox
   Linux no tiene el binario SWC (el `node_modules` es de Windows) y no hay
   salida a npm. Verifiqué en su lugar: parseo de los 6 archivos, ejecución real
   de `precioZonas.js` contra el JSON del modelo (los 13 slugs y las 21 filas), y
   que no quedaran identificadores viejos colgados. **Correr el build en
   Traycer antes de deployar.**
4. Fases B, C y D del plan (calculadora en el hero, JSON-LD + FAQ, y alinear el
   diseño con `/tasacion`).
