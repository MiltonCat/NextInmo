# Sesión 2026-08-10 — /precio-m2, Fases B y C

Contexto: `PLAN_PRECIO_M2.md`. La Fase A y casi toda la D salieron ayer
(`NOTAS_SESION_2026-08-09.md`). Acá van **B (que la página lleve al tasador)** y
**C (SEO)**.

**Solo código.** No toca archivos de imagen ni la base de datos.

## Fase B — la calculadora del hero

**`components/CalculadoraM2.jsx` — nuevo.** Client component. Input de metros +
selector de tipo → rango al instante.

El hero tenía la cuenta hecha en un párrafo: *"si el m² ronda los USD 2.085, una
casa de 100 m² ronda los USD 208.500"*. Es la misma cuenta, pero hecha con la
casa de otro. Quien llega buscando "precio m2 san martin" está tratando de saber
cuánto vale **la suya**; el dato agregado deja de ser una estadística sobre
terceros recién cuando pone sus propios metros.

### La decisión de fondo: qué NO calcula

El cruce **barrio × tipo no existe en el modelo**. El JSON trae la mediana por
barrio (casas y departamentos mezclados) y el valor por tipo (todos los barrios
mezclados), nunca los dos juntos. Es exactamente lo que ayer borramos de
`precioZonas.js`, donde 13 filas de ese cruce escritas a mano se habían
desincronizado hasta un 20 %.

Así que la calculadora:

- **Calcula** metros × el m² del tipo elegido, y devuelve el rango intercuartil
  (p25 × m² a p75 × m²), nunca un número al peso.
- **No calcula** "una casa de 120 m² en el Centro". El selector de barrio está
  separado del cálculo y lo dice en pantalla: *"no cambia el rango de arriba"*.
  Al elegir uno muestra su mediana con su `n` y explica por qué no la
  multiplica.

Se descartó la tercera opción —cruzar el m² del tipo con un factor
barrio/mediana global— porque da el número más específico pero es una
derivación que el modelo no respalda. Sería reinventar lo que sacamos ayer.

### Detalles

- **Casa es el tipo por defecto**, aunque `POR_TIPO` esté ordenado por precio y
  el departamento salga más caro el m². En esta ciudad el que averigua cuánto
  vale lo suyo la mayoría de las veces tiene una casa; arrancar en
  "Departamento" lo obliga a corregir el formulario antes de usarlo.
- El resultado **no empuja el contenido de abajo** al aparecer: el bloque tiene
  su texto de reposo y ocupa lugar desde el principio.
- El link **"Cómo calculamos estos valores"** va pegado al número, no en el pie
  (§4.2 del plan). Admitir el margen donde se ve sostiene la cifra.
- CTA a `/tasacion` dentro de la calculadora, además de los dos que ya estaban
  (sección "Un promedio no ve tu casa" y el cierre). Son tres, todos al mismo
  destino.
- Por arriba de USD 1.000.000 el rango se abrevia a "USD 1,2 M – 1,9 M": el
  número entero dos veces no entra en una línea a 375 px.

## Fase C — SEO

**FAQ visible + `FAQPage` JSON-LD.** Siete preguntas, de una sola fuente: el
array `FAQS` alimenta el acordeón y el JSON-LD. Es la regla que ya estaba
escrita en `/tasacion`, y por el mismo motivo — si el JSON-LD tuviera su propia
copia, Google podría mostrar una respuesta que el visitante no encuentra en la
página. Ya pasó: el JSON-LD de `/blog/score-de-inversion` decía "más de 1.700
propiedades" y ninguna otra página del sitio decía eso.

Las preguntas son las que se buscan de verdad: cuánto cuesta el m², cuánto sale
una casa de 100 m², cuál es el barrio más caro, por qué es tan caro, de dónde
salen los datos, si son propiedades vendidas o publicadas, cada cuánto se
actualizan.

**Ninguna respuesta tiene un número escrito a mano.** Todas salen de las
constantes, incluido "el barrio más caro" —que se calcula, no se elige— porque
esta página ya destacó una vez "máximo por zona: Chapelco Golf" cuando el
modelo decía que el más alto era el Centro. Hoy da **Las Pendientes, USD 3.537,
n=11**.

**`Dataset` JSON-LD.** La página es literalmente un conjunto de datos con
fuente, cobertura temporal y fecha. Lleva `temporalCoverage` 2021/2026,
`dateModified` = `MERCADO_GENERADO` (no la fecha del build), `spatialCoverage`,
`creator` y **23 `variableMeasured`**: casas, departamentos y los 21 barrios,
cada uno con su `n` en la descripción.

**Sin `license`.** Google la recomienda, pero declarar una licencia es decidir
que cualquiera puede republicar el relevamiento. Es una decisión comercial, no
técnica. Si se define alguna, va en esa línea (está marcada en el archivo).

El punto 12 (`sitemap.js` con `lastModified: MERCADO_GENERADO`) ya había salido
ayer.

## Verificación

- Parseo de los dos archivos con `@babel/parser` (JSX incluido). ✅
- Los dos JSON-LD se construyeron con las constantes reales del modelo y se
  recorrieron entero buscando `undefined` / `NaN` / strings con "undefined"
  adentro: **ninguno**. ✅
- **La calculadora y el FAQ dan el mismo número.** Casa de 100 m² → 159.800 –
  262.000 en los dos lados. Era lo más importante de chequear: dos cifras que se
  contradicen en la misma página es justo lo que veníamos arreglando.
- ⚠️ **Sigue sin correrse `npm run build`** — el sandbox no tiene el binario SWC
  (el `node_modules` es de Windows). **Correr el build en Traycer antes de
  deployar**, y de paso mirar la calculadora en un teléfono real.

---

# /inversiones — el simulador sube al hero

Segunda parte de la sesión, a partir de una observación de Milton: *"en
inversión no hay una idea como Airbnb"*. Tenía razón, y el diagnóstico es más
preciso que "falta una calculadora" — la calculadora **ya existía**.

## Bug encontrado primero (esto era lo urgente)

Tres campos quedaron con **`text-gray-200` sobre `bg-gray-50`** desde el pasaje
a blanco del 9-ago: los `<select>` del simulador y —peor— los dos inputs del
formulario de contacto, nombre y WhatsApp. **La persona no veía lo que
escribía.** Un formulario de captación de leads en el que no ves tu propio
nombre no se completa. Corregido a `text-gray-900`.

Es la clase de resto que deja una conversión de tema: el color no rompe nada, no
tira error y no se nota leyendo el diff.

## El diagnóstico

La idea de Airbnb no es *tener* una calculadora, es que **el número del
visitante sea lo primero**. `/inversiones` fallaba en las cuatro reglas del §4
del plan:

| Regla | Cómo estaba |
|---|---|
| El dato se convierte en el del visitante | El hero abría con 3 métricas sobre **nosotros**: propiedades relevadas, frecuencia de actualización, "Solo SMA" |
| Divulgación progresiva | La calculadora abría con **4 tarjetas de colores a la vez** (rosa, verde, violeta, naranja) + resumen + desglose + comparativa + supuestos |
| Metodología al lado del número | Los supuestos, al pie de todo |
| Todo termina en una acción | Cuatro CTAs distintos |

Y estaba en la **posición 7** de la página: después del quiz, la comparativa de
activos, dos gráficos y la matriz de riesgo. Había que recorrer media página de
datos sobre el mercado antes de ver un número sobre la propia plata.

## Qué se hizo (solo el hero, por decisión de Milton)

**`#simulador` nuevo, dentro del hero.** Monto + tipo + plazo, y **un** número
grande: con cuánto terminás. Una línea explica de dónde sale y el botón "Ver de
dónde sale ese número" baja al desglose.

**El monto ahora se escribe.** Antes era un `<select>` de montos fijos —25K,
50K, 75K…—, o sea que seguías eligiendo de una lista de montos ajenos. Ahora hay
un campo libre más un slider para moverlo rápido. Si tenés USD 137.000, ponés
137.000.

**El desglose de abajo perdió sus controles.** Ahora el bloque `#calculadora` se
llama "De dónde sale ese número", muestra el monto y el plazo vigentes en un
badge, y linkea de vuelta al simulador. Duplicar los controles habría sido la
trampa de siempre: dos copias del mismo control se desincronizan y el visitante
que cambia una no entiende por qué la otra dice otra cosa.

**El quiz y el hero van a lugares distintos**, y no da lo mismo: el quiz manda a
`#simulador` (acaba de preconfigurar el tipo, tiene que ver el control), el hero
manda a `#calculadora` (el desglose, que es lo que pidió).

### El detalle del campo de monto

El mínimo **no** se aplica mientras se tipea, solo al salir del campo. Acotarlo
en cada tecla hace imposible reescribir el monto: borrás, tecleás "1" y el campo
salta solo a 10.000 con el cursor movido. Durante el tipeo se acota únicamente
el máximo, que es el único que puede romper la cuenta. Por eso hay dos estados
(`calcMonto` y `montoTexto`): lo que se ve y lo que se calcula no son lo mismo
mientras el campo está a medio escribir.

Verificado a mano: campo vacío, "1", "13", "137000", "150.000", "-5000",
"99999999" y "abc" — todos terminan en un monto válido, ninguno en `NaN`.

## Lo que NO se tocó

El orden de las secciones de abajo, las 4 tarjetas de colores del desglose y los
4 CTAs siguen igual. Era la opción "solo el hero": el 80 % del efecto con el
20 % del riesgo, y se mira el resultado antes de seguir.

## Que se vea más humano: aparece Milton

Pedido de Milton: *"quiero que aparezcan personas, que se vea más humano"*.

### Lo que apareció al revisar `/public`

**No queda ninguna foto con personas sin usar.** Inventario real:

| Foto | Qué es | Dónde está |
|---|---|---|
| `tasacion-cuentas.jpg` | pareja revisando cuentas | `/tasacion` **y** `/precio-m2` |
| `tasacion-ventana.jpg` | mujer junto a la ventana | `/tasacion` **y** `/precio-m2` |
| `hipotecario.jpeg` | persona firmando | 4 artículos del blog + `/precio-m2` |
| `deco-living-fuego.jpg` | dos pares de pies frente al hogar, sin caras | `/tasacion` |
| `trayectoria.jpeg` | apretón de manos, solo manos | home |
| `patagonia-activo.jpg` | **figura 3D abstracta**, cero personas pese al nombre | blog |
| resto de `deco-living-*` | interiores vacíos | `/tasacion` |

Meter cualquiera de esas en `/inversiones` era usarla por tercera vez, contra la
regla escrita en la cabecera de `/precio-m2`: no repetir con `/tasacion`, porque
las páginas se empiezan a leer como la misma repetida.

⚠️ De paso: la nota del 9-ago describía `deco-living-fuego.jpg` como "gente
junto al hogar". Son **pies**, no hay caras. Y `patagonia-activo.jpg` no tiene
nada de Patagonia ni de personas.

### Lo que se hizo

Se usa **la foto de Milton**, que es la única de una persona que `/inversiones`
no estaba usando. Para una página donde alguien decide dónde pone USD 150.000,
una cara real gana contra cualquier pareja de stock: el que la mira puede buscar
el nombre, el LinkedIn y la matrícula, y que todo dé. Un modelo de banco de
imágenes no resiste esa comprobación.

Dos lugares:

1. **`components/AdvisoryProcess.jsx`** — "Así te acompañamos" eran cuatro
   iconos SVG grises: describía un acompañamiento personal sin mostrar a nadie.
   Ahora cierra con la foto, una frase suya y el rol.
2. **El formulario de captación** — antes decía "Milton te responde en menos de
   48 hs" **después** de enviar. O sea que la persona dejaba su teléfono sin ver
   a quién se lo dejaba. Ahora la foto y esa promesa están arriba del campo.

Todo lo afirmado (nombre, rol, "más de 10 años en San Martín") ya está publicado
en `/nosotros` y en la home. Si cambia, cambia en los tres lados.

---

# Las secciones de abajo de /inversiones, al lenguaje de /tasacion

Tercera parte, a pedido de Milton: *"quiero que veas las otras secciones como
tasaciones, quiero que se vea similar"*. La sesión se había cortado a mitad de
esto por errores de API; acá va lo que faltaba.

`InversionesClient.js` ya estaba convertido — los `rounded-xl` que quedan son
de inputs y botones, que es lo que el lenguaje pide. Faltaban los componentes.

## `InvestorQuiz.jsx` — y un bug del mismo tipo que el de la mañana

Escala en píxeles, borders en vez de `shadow-sm`, botones `bg-gray-900` /
`text-white`. Las tarjetas de resultado pasaron al patrón de fila con
`divide-x divide-gray-100 border-y`, el mismo del desglose de la página.

**El bug:** tres botones tenían `text-gray-900` sobre `colores.btn`, o sea
negro sobre verde, naranja o rojo saturado. Es exactamente el resto que dejó
invisibles los campos del formulario de contacto —la conversión a tema claro
reemplazó `text-white` por `text-gray-900` sin mirar qué había debajo—, solo
que acá se leía mal en vez de no leerse.

**Qué se sacó del `colorMap`:** los fondos tintados (`bg-primary-500/10` y
compañía) y los botones de color. El fondo no distinguía nada que el título del
perfil no dijera ya. El acento sobrevive en el retorno y el nivel de riesgo,
que es lo único que cambia de verdad entre un perfil y otro, más un punto de
color en el antetítulo.

**El acento subió de 600 a 700.** Sobre blanco, `primary-600` (#E8325A) da
4,17:1 y `orange-600` menos todavía: por debajo del 4,5:1 de WCAG AA para texto
normal. En 700 queda en 5,4:1. Los puntos siguen en 500 porque no llevan texto.

## `AdvisoryProcess.jsx`

Badge neutro con punto esmeralda (el de `/tasacion`), títulos a 26/34 px, CTA a
`bg-gray-900`. La foto pasó de `ring-4 ring-white shadow-md` a un borde de 1 px:
el anillo blanco sobre fondo blanco solo aportaba la sombra.

## `InversionesMatrizChart.jsx`

Solo el tooltip. **Conserva sombra**, ahora `shadow-sm`: flota sobre el
gráfico y es el único lugar de la página donde el borde solo no lo despega del
fondo. El retorno del tooltip dejó de ir en `text-primary-600` — dentro de una
caja de 3 px de padding el color no agregaba nada y era el mismo tono flojo.

## Lo que NO se tocó, a propósito

**`InvestmentMap.jsx` vive en la home, no en `/inversiones`** (`app/page.js`
línea 448). Restilarlo cambia la portada, que es otra decisión. Sigue con 5
sombras, `text-3xl/4xl` y el `#FF5A5F` escrito a mano —un rojo que no es el
`primary` del sitio y que también está en `ChatBot.jsx` y `Toast.jsx`.

De paso, algo para mirar cuando se lo toque: los `score` de las zonas (92, 88,
95, 90, 84) están escritos a mano en el componente y no salen de `lib/mercado`.
Es el mismo patrón de las 13 filas de `precioZonas.js` que se borraron ayer.

## Verificación

- Parseo de los cuatro archivos con `@babel/parser` (JSX incluido). ✅
- Sin referencias huérfanas a `colores.bg` / `.border` / `.btn`. ✅
- Barrido de combinaciones texto/fondo: ni texto oscuro sobre fondo saturado ni
  texto claro sobre fondo claro en los tres archivos. ✅
- `text-2xl/3xl/4xl` restantes en la superficie de `/inversiones`: **3, y los
  tres están dentro de un comentario** que explica por qué no se usa esa escala.
- ⚠️ **Sigue sin correrse `npm run build`**, por lo mismo de arriba.

---

# Las dos fotos de gráficos, en las secciones de datos

Milton subió cuatro fotos a `/public`: `graficos.jpg`, `grafico1.jpg`,
`grafico3.jpg` y `casa1.jpg`. **Toca archivos**: se crearon dos `.webp` nuevos.
No se borró ni se renombró nada.

## Lo que son, mirándolas

Ninguna de las cuatro tiene una cara. Es el mismo patrón de `trayectoria.jpeg`
(solo manos) y `deco-living-fuego.jpg` (solo pies): sirven de textura, no
contestan el pedido de "que se vea más humano".

| Archivo | Qué es | Decisión |
|---|---|---|
| `grafico1.jpg` | mujer de espaldas con informes y calculadora | **se usa** |
| `grafico3.jpg` | dos personas señalando un portapapeles con gráficos | **se usa** |
| `graficos.jpg` | brazo señalando velas bursátiles, cartel "FINANCE REVIEW" | sin usar |
| `casa1.jpg` | casitas de plástico, llaves y billetes de **euro** | sin usar |

`casa1.jpg` quedó afuera por los euros: el sitio entero trabaja en dólares.
`graficos.jpg` muestra el índice Wilshire 5000 —bolsa de EE.UU.—, que no es de
lo que habla la página.

## Optimización

Los originales venían en 6284×4189 y 4000×6000, 1,8 MB y 2,2 MB. Van a webp:

- `grafico1.webp` — 1600×1067, **79 KB** (de 1,8 MB)
- `grafico3.webp` — 1600×900, **78 KB** (de 2,2 MB)

`grafico3` era vertical y se **recortó a apaisada** antes de convertir, centrada
al 45 % de la altura: ahí está el portapapeles con los gráficos y las dos manos,
que es lo único aprovechable. Recortar en el archivo y no con CSS evita servir
6000 px de alto para mostrar 900.

## Dónde quedaron

Una banda apaisada entre el encabezado de la sección y sus datos, en las dos
secciones de análisis: `#activos` (comparativa) y `#datos` (evolución del m²).

`aspect-[4/3]` en móvil y `16/7` en desktop, a propósito: la banda es una pausa
para el ojo entre dos tablas, y una foto alta que empuja los datos fuera de
pantalla deja de ser una pausa. `objectPosition` va por foto —`center 35 %` en
`grafico1`— porque un `center` parejo le corta la cabeza a la mujer, que está
arriba a la derecha.

## Segunda vuelta: al costado, no en banda (patrón Airbnb)

Milton: *"me gusta más la idea que las imágenes se coloquen como lo hace
Airbnb"*, y después *"pero usá algunas de public"*.

La banda apaisada de ancho completo se reemplazó por **`SeccionConFoto`**: la
foto al costado del encabezado, alternando el lado en cada sección. Es el
patrón de las páginas de "cómo funciona" de Airbnb.

Por qué es mejor acá: la banda partía la página en tres —título, foto, datos— y
metía 400 px de stock entre lo que la persona acababa de leer y el número que
venía a buscar. Al costado, la foto ocupa un lugar que en desktop estaba vacío
(el texto de encabezado nunca pasa de media caja) y no empuja nada.

En móvil la foto va **debajo** del texto, con `order`. Lo primero de una
sección tiene que decir de qué trata, no ser una foto de archivo.

De los otros tres patrones de Airbnb que se evaluaron —mosaico de galería,
foto dentro de cada tarjeta, full-bleed con texto encima— **ninguno da con las
fotos que hay**: el mosaico pide 5 y las tarjetas 4.

### Revisando `/public` apareció algo mejor

`hero-lago.webp` estaba en la carpeta **sin usar en ninguna página**: un lago
entre montañas boscosas con cumbres nevadas. Reemplaza a `grafico1.webp` en la
sección de datos del mercado, porque toda la página habla de San Martín de los
Andes y no tenía una sola imagen de San Martín de los Andes. Una mujer con una
calculadora podría estar en cualquier ciudad; el lago dice de dónde salen los
números.

⚠️ **`hero-montana.webp` y `hero-pradera.webp` son el Fitz Roy, en El Chaltén,
Santa Cruz — a unos 1.800 km.** También están sin usar, y el nombre no lo
delata. No van en ninguna página que hable de San Martín de los Andes. Es el
mismo problema de `patagonia-activo.jpg`, que no tiene ni Patagonia ni
personas: **el nombre del archivo no es la foto.**

`volcan-lanin-card.jpg` sí es el Lanín —el símbolo de la ciudad— pero el
archivo es una foto vertical metida en un lienzo apaisado con barras borrosas a
los costados: el contenido real es una franja angosta. Sirve si se recorta y se
consigue el original.

`grafico1.webp` queda disponible, sin usar.

## Tercera vuelta: la sección de evolución era muy alta

Milton: *"Evolución del precio del m², en dólares. Esta sección me parece muy
grande"*.

- **El gráfico bajó de 288 a 224 px** en `/inversiones`. Se hizo con un prop
  `alto` nuevo, no cambiando el componente: `InversionesEvolucionChart` lo
  comparte `/precio-m2` vía `PrecioM2Chart`, donde la curva es el contenido
  central de la página y tiene que seguir grande. El default deja `/precio-m2`
  **exactamente como estaba** — verificado: no pasa `alto`.
- Espacios de `mt-8`/`mt-6`/`mt-4` a `mt-7`/`mt-5`/`mt-3`.
- **La nota al pie pasó de seis líneas a dos.** Se sacó lo que el gráfico ya
  muestra —que la suba se aplana hacia el final se ve en la curva; escribirlo
  era narrar el dibujo— y quedó lo que no se ve: que es la misma serie del
  tasador y de `/precio-m2`, y que el modelo le verifica el último año.
- La foto lateral pasa a `3/2` en desktop (de `4/3`): 373 px en vez de 420.

### Y después: era el título, no el bloque

Segunda lectura de Milton: *"Evolución del precio del m², en dólares, eso
quiero que cambie de tamaño"*. No era la altura de la sección, era el tamaño
de ese `<h3>`.

**De 22 px a 17 px.** Y se cambiaron **los cuatro** subtítulos de la página con
ese rol, no solo el que señaló:

- "Evolución del precio del m², en dólares"
- "Estimación de rentabilidad por alquiler"
- "De dónde sale la ganancia"
- "Contra un plazo fijo en dólares"

Dejar tres en 22 px y uno en 17 px es exactamente lo que describe el comentario
de tipografía del archivo: *"esta página tenía `text-2xl` en un título,
`text-lg` en otro y `text-base sm:text-lg` en un tercero, todos con el mismo
rol"*. Se arregla el rol, no la instancia.

A 22 px el subtítulo competía con el título de sección, que está en 26/34. En
17 px queda claramente por debajo. **El 22 px desapareció de la página**: la
escala ahora es 10, 11, 15, 17, 26/34, y 44/52 para las dos cifras grandes.

### Cuarta vuelta: gráficos grandes, espacios chicos

Milton: *"quiero que se vean estos gráficos que ocupan todo el espacio con
espacios más pequeños como en Airbnb"*.

Esto **revierte** el achique del gráfico de dos vueltas atrás, y está bien que
lo revierta: lo que molestaba no era el gráfico, era el título (22 px) y el
aire alrededor. Achicar el dato para ganar espacio era la solución equivocada
al problema correcto.

**Los gráficos crecen:**

| | Antes | Ahora |
|---|---|---|
| Evolución del m² | 192 / 288 px | **224 / 320 px** |
| Matriz riesgo-retorno | 320 px | **320 / 416 px** |

Los márgenes internos del scatter bajaron de `top 24, right 24, left 8` a
`14 / 12 / 4`, para que la nube de puntos use el alto que se le dio en vez de
dejarlo en aire. `bottom` se queda en 28: ahí vive el rótulo "Riesgo →", que
está posicionado con `offset -12` y se corta si se achica.

**Los espacios se aprietan:**

- Entre secciones: `mb-16` + `pt-14` → `mb-12` + `pt-10`. Las cuatro secciones,
  no una.
- Contenedor de la página: `py-12 md:py-16` → `py-10 md:py-12`.
- Sobre los subtítulos: `mt-12` → `mt-9`.
- Antes de cada gráfico: `mt-8`/`mt-5` → `mt-5`/`mt-4`. Debajo de la matriz,
  `mt-6` → `mt-4`.

**Los placeholders de carga se actualizaron con las alturas nuevas** (`h-56
sm:h-80` y `h-80 sm:h-[26rem]`). Son los dos `dynamic(...)` del tope del
archivo, y si quedan con la altura vieja la página salta cuando el gráfico
termina de cargar. Es el tipo de detalle que no se ve leyendo el diff y se ve
en cuanto entrás con la red lenta.

### Quinta vuelta: "¿cómo haría Airbnb en este caso?"

Milton, después de la cuarta: *"me siguen pareciendo grandes. ¿Cómo haría
Airbnb en este caso?"*.

**Airbnb no pondría el gráfico.** Cuando muestra datos de mercado —la página de
cuánto podés ganar como anfitrión— muestra un número grande, un control para
tocarlo, y nada más; la serie histórica vive detrás de un link. Un gráfico le
pide a la persona que saque su propia conclusión; un número se la da. En una
página donde alguien decide dónde pone USD 150.000, la conclusión ya está
calculada.

Por eso seguía pareciendo grande aunque se achicó dos veces. El problema no era
la altura:

1. **La proporción.** 1.100 × 320 px es una caja de 3,4:1 — se lee como una
   lámina. Las tiras de datos son de 7:1 u 8:1: se leen como una línea.
2. **La jerarquía, invertida.** El `+57,7 %` estaba **abajo** del gráfico, en
   gris, a 12 px, entre los dos extremos de la serie. Lo más importante de la
   sección escrito como nota al pie, con 320 px de curva ilustrándolo.

**Lo que se hizo:**

- **El número arriba, en 34/44 px.** Con bajada: de cuánto a cuánto y entre qué
  años.
- **La curva pasa a tira de 112/128 px** (`variante="tira"`): sin ejes, sin
  grilla, sin tooltip. Ya no es un gráfico para leer, es la forma de ese
  número. Va con `aria-hidden`, porque todo lo que dice está en el texto que la
  rodea.
- **La serie completa, dentro de un `<details>`** con ejes, tooltip, contexto
  por año y fuente. "Ver año por año". Quien quiera auditarla la abre.

La sección pasa de unos 450 px a unos 200.

**Tres detalles que no se ven leyendo el diff:**

- **El `<details>` monta el gráfico recién al abrirse** (`serieAbierta`). Si
  estuviera siempre en el DOM, el `ResponsiveContainer` de recharts lo mediría
  con 0 px de ancho mientras está oculto y podía quedar dibujado en cero al
  desplegarlo. De paso, el bundle del gráfico no se descarga hasta que alguien
  lo pide.
- **El id del degradado ahora incluye la variante.** En esta página conviven
  dos instancias del componente, y dos `<linearGradient>` con el mismo id hacen
  que el segundo se ignore.
- **En modo tira el eje Y sigue existiendo pero con `hide`.** Sin él recharts
  encuadra la curva contra el borde y se pierde la forma, que es lo único que
  la tira tiene para mostrar.

**Un dato que se perdió al reescribir y se recuperó:** la primera versión de la
bajada decía "en 5 años" sin nombrar cuáles. Los años estaban antes en la línea
de extremos y en el subtítulo, y los dos desaparecieron en el rediseño. En una
página cuyo argumento entero es que los datos están al día, no decir de qué
años habla la serie es justo lo que no se puede perder.

## Verificación

- Parseo con `@babel/parser` de los archivos tocados. ✅
- Placeholder de carga = alto de la tira, que es la instancia que carga con la
  página. ✅
- `mb-16` restantes en la página: **0**. El espaciado quedó parejo. ✅
- **`/precio-m2` no pasa `alto` ni `variante`**: sigue recibiendo el gráfico
  completo de 192/288 px, exactamente como estaba. ✅
- Ningún dato de la serie quedó fuera: extremos, años, porcentaje, badge y
  nota siguen en la página, y el gráfico auditable está a un clic. ✅
- `<section>` abiertas = cerradas (5 y 5). ✅
- Los tres `src` de la página existen en `/public`. ✅
- Alt text escrito **mirando la foto**, no el nombre del archivo — que es
  justamente lo que falló con `patagonia-activo.jpg`. ✅
- El bloque de evolución sigue renderizando las mismas seis referencias a datos
  (gráfico, primer y último punto, badge): se acortó el envoltorio, no el
  contenido. ✅

Dos errores propios en el camino, los dos de sintaxis y los dos atajados por el
parseo antes de que llegaran a ningún lado: un `</section>` de más, y un
comentario de bloque que se cerraba solo porque el texto adentro incluía los
caracteres de cierre.

---

# Auditoría de datos antes de subir, y Terreno afuera

Milton pidió chequear que los datos coincidan con el resto del sitio antes de
deployar. **La sección de evolución que se rehízo hoy coincide**: `+57,7 %`,
2021 USD 1.680 → 2026 USD 2.650, todo desde `EVOLUCION_SERIE`, la misma fuente
que consumen el tasador y `/precio-m2`. El JSON trae `variacion_total_pct: 57.7`
y el cálculo de la página da 57,7 exacto.

Lo que **no** coincidía eran seis números viejos, ninguno de esta sesión.

## Terreno sale de la comparativa

El hallazgo de fondo: **el sitio ya había decidido esto en otra página y
`/inversiones` no se había enterado.** `/precio-m2` no publica Terreno, y lo
dice por escrito — para Cabaña, Local Comercial, Terreno y Oficina el modelo no
exporta el `n`, así que no se sabe sobre cuántas propiedades salió cada mediana,
y *"quedan fuera"*. El modelo se entrena solo con Casa y Departamento.

`/inversiones`, en cambio, le daba a Terreno una tarjeta con puntaje sobre
cuatro factores. Y el dato que sostenía el primero decía **"913 terrenos en
venta relevados" cuando el relevamiento tiene 116**: no era un número viejo,
era uno que el propio sitio contradice — y encima el que justificaba el puntaje
de demanda ("alta oferta = absorción lenta").

Se sacó de tres lugares:

1. **`SCORE_DATA`** — la comparativa queda en 3 tipos. La grilla pasó de
   `lg:grid-cols-4` a `3`, si no quedaba un hueco a la derecha.
2. **`MATRIX_DATA`** — el gráfico riesgo-retorno lo dibujaba con riesgo 1,8 y
   retorno 5 % escritos a mano. Sacarlo de la tabla y dejarlo en el gráfico de
   al lado es la misma afirmación publicada en dos formatos.
3. **`PERFIL_MAP.conservador.card`** → `null`. Si quedaba en `"Terreno"`, el
   resaltado del quiz buscaba una tarjeta inexistente y **no pasaba nada, sin
   error**: el visitante conservador terminaba el test y la página no
   reaccionaba.

## Valores actuales: del modelo. Históricos: como estaban

Regla de Milton. Cinco de los doce `fuente` de la comparativa pasaron de string
fijo a plantilla contra `lib/mercado`:

| Decía | Ahora |
|---|---|
| "66 locales relevados" | **61**, de `relevadas.por_tipo` |
| "USD 2.640/m² (ene 2026)" | **USD 2.900/m²**, de `valor_m2_usd.por_tipo` |
| "+21.8 % vs ene 2025" | **sacado** — no existe en el export |
| "Solo 49 propiedades en alquiler relevadas" | **512 casas relevadas en venta** |
| "entre los m² más caros del país" (casas) | **USD 2.085/m²**, del modelo |
| "Precios entre los más altos del país" (deptos) | **USD 3.292/m²**, del modelo |

Las "49 propiedades en alquiler" no se reemplazaron por otro número: **ese dato
no puede existir**, el relevamiento cubre avisos de venta, no de alquiler. Se
cambió por lo que el modelo sí mide y se dice qué mide.

También cayó una frase que dependía de un número borrado: *"es lo que más subió
de precio en el último año"* para locales se apoyaba en el "+21,8 %". Sin ese
número queda sola, y el modelo no trae variación interanual por tipo.

La serie histórica no se tocó, según la instrucción.

## Verificación

- Parseo de los cinco archivos. ✅
- Terreno en el código publicado: **0 tarjetas, 0 puntos**. Solo queda en los
  comentarios que explican por qué se fue. ✅
- Ningún valor de m² escrito a mano en `/inversiones`: los dos que aparecen en
  un grep están **dentro del comentario** que documenta el cambio. ✅
- Los cinco `fuente` nuevos imprimen 3.292 / 512 / 2.085 / 61 / 2.900 —
  verificado contra el JSON. ✅

## Lo que queda decidido a medias

**El quiz le sigue recomendando terrenos al perfil conservador**
(`InvestorQuiz.jsx` → `PERFILES.conservador.recomendacion`). No se tocó a
propósito: eso es un consejo de vendedor, no un dato del modelo, y no me
corresponde cambiarle la recomendación comercial. Pero hoy un conservador lee
"te conviene un terreno" y baja a una comparativa donde los terrenos no
existen. Hay que resolver una de las dos.

---

## Pendiente

1. ~~El TXT descargable de `/inversiones` con `z.tipo` → `undefined`~~ — **ya
   estaba arreglado**: hoy usa `barriosConMediana()`. Se puede tachar del plan.
2. Verificar "el m² más caro de Argentina" con fuente 2025/2026, o dejarlo en
   pasado (hoy está en pasado, con año).
3. Las dos fotos de `/precio-m2` que todavía comparten archivo con `/tasacion`
   — ver `docs/PROMPTS_IMAGENES_PRECIO_M2.md`.
4. `lib/mercado.js`: el comentario de cabecera todavía dice "1.753", de un
   export viejo. No afecta a nada publicado.
5. Si el hero de `/inversiones` funciona: limpiar las 4 tarjetas de colores del
   desglose y unificar los CTAs.
6. **Decidir si la home pasa al mismo lenguaje.** `InvestmentMap.jsx` es la
   sección que quedó afuera hoy; si se hace, revisar de paso los `score`
   escritos a mano y el `#FF5A5F` suelto en tres componentes.
7. **5,5 MB de originales sin usar en `/public`.** `grafico1.jpg`,
   `grafico3.jpg`, `graficos.jpg` y `casa1.jpg` siguen ahí: no se borraron
   porque no estaba autorizado. Los dos primeros ya no hacen falta —se sirve el
   `.webp`—. Decidir si se borran o se mueven fuera del repo antes de commitear;
   es el mismo problema del commit `e593689`.
8. **Sigue sin haber una cara arriba en `/inversiones`.** Las dos bandas nuevas
   son textura, no personas. La opción de costo cero es subir la foto de Milton
   al hero, al lado del simulador.
9. **Fotos con personas: el sitio se quedó sin stock.** Si se quieren caras
   nuevas en `/inversiones`, `/precio-m2` o el blog, hay que licenciar —el
   criterio de qué pedir está en `docs/PROMPTS_IMAGENES_PRECIO_M2.md`. Hoy las
   tres fotos con gente están cada una en dos o más páginas.

---

# Una sola fuente de números en todo el sitio

Pedido de Milton: *"quiero que tengas los mismos valores en toda la web, los de
tasar mi propiedad están bien"*.

## El hallazgo que dio vuelta la decisión

Milton eligió primero que las tres páginas usaran la API en vivo del modelo. Se
consultó la API antes de tocar nada, y devuelve esto:

| | JSON estático | API en vivo |
|---|---|---|
| Fecha | **2026-08-06** | 2026-07-17 |
| Propiedades | **1.597** | 956 |
| m² Casa | **2.085** | **1.797** |
| m² Depto | 3.292 | 3.286 |
| m² general | 2.684 | 2.636 |

**La API está tres semanas más vieja y cubre 40 % menos propiedades.** Conectarle
`/tasacion` habría bajado el m² de casas un 16 %, o sea habría roto justo el
número que Milton acababa de dar por bueno. Se hizo lo contrario: congelar todo
al JSON.

Y no era hipotético. Como `/inversiones` sí consultaba la API, en producción
convivían **+56,9 %** ahí y **+57,7 %** en `/tasacion` y `/precio-m2`, sobre la
misma serie. El reporte TXT descargable salía fechado tres semanas antes que la
página desde la que se bajaba.

## Lo que se cambió

**`/inversiones` deja de consultar la API.** Se sacó el `getMercado()` de
`page.js` y el prop `mercado` del cliente. Con él se iban tres cosas que pisaba:
el último punto de la serie, el m² de referencia y la fecha. El hero decía
"Semanal" cuando la API contestaba — una promesa de frecuencia, no un dato, y
falsa: la API llevaba tres semanas devolviendo el mismo relevamiento.

**El USD 2.689 del simulador no existía en ninguna otra página.** Era
`(VALOR_M2_CASA + VALOR_M2_DEPTO) / 2`, rotulado en pantalla como *"valor mediano
actual"* — no es la mediana de nada. Con USD 150.000 decía "≈ 56 m²" mientras
`/tasacion` publicaba 2.085 (72 m²) y 3.292 (46 m²). Ahora cada tipo usa el m² de
lo que simula: casas para alquiler y reventa, departamentos para turístico.

**El FAQ JSON-LD de `/inversiones`** afirmaba que el m² va "entre USD 1.200 y
USD 3.500". El p75 de departamentos es 3.923. Ahora sale del modelo.

**Los precios de barrio estaban escritos a mano en DOS lugares** — el post
"Dónde vivir" y `lib/barriosPerfil.js`, que alimenta `/barrios/[slug]`. Las
mismas seis filas, la misma cifra vieja duplicada. Cuatro de seis contradecían al
modelo y en tres el rango publicado ni contenía la mediana real:

| | Decía | Modelo |
|---|---|---|
| Centro | 2.500–3.200 | **3.400** (n=281) |
| La Cascada | 1.800–2.400 | **2.452** (n=11) |
| Vega Maipú | 1.400–1.900 | **2.508** (n=18) |

Los dos archivos derivan ahora de `medianaDeBarrio()`. Se publica la mediana con
su `n`, no un rango inventado.

**Peñón de Lolog sale sin número.** Tiene 3 propiedades relevadas y el modelo lo
marca `en_observacion`. Antes la ficha caía al rango editorial del perfil —que
era justamente el desactualizado—; ahora dice que no hay dato. Mismo criterio que
`/precio-m2` con Cabaña, Terreno y Oficina.

**Dos textos que el dato dejó falsos.** Vega Maipú se describía como "los precios
más accesibles de zonas residenciales": con 2.508 es el sexto de 21 barrios, por
encima de La Cascada. Y la tabla "¿cuál te conviene?" lo recomendaba para
"primera vivienda con presupuesto limitado". Los dos corregidos — el atractivo
que el texto describe (zona de expansión) es lo que le movió el precio.

## Un error propio, atajado

Al sacar Vega Maipú de la tabla de recomendaciones se escribió el comentario como
`{/* ... */}` **dentro de un array de objetos**, no en JSX. Eso parsea sin error:
es un objeto vacío `{}` más una fila fantasma en la lista, con `key` undefined.
El parseo daba OK; lo agarró un grep de objetos vacíos en arrays. Vale como
recordatorio de que "parsea" no es "está bien".

## Verificación

- Parseo con `@babel/parser` de los 9 archivos tocados. ✅
- **Cero m² escritos a mano publicados en todo el sitio.** Los `/m²` que quedan
  en un grep son unidades (`unitText`) o interpolaciones del modelo. ✅
- `M2_REFERENCIA`, el prop `mercado` y el fetch: 0 referencias. ✅
- Sin objetos vacíos en arrays. ✅
- Sin import circular: `barriosPerfil → precioZonas → mercado` no vuelve. ✅
- Valores que publica el sitio ahora, todos de la misma fuente: casas 2.085,
  deptos 3.292, serie 1.680 → 2.650 (+57,7 %), "más de 1.500 propiedades",
  datos al 6-ago-2026. ✅
- ⚠️ **`npm run build` sigue sin correrse.**

## Pendiente que abre esto

1. **Regenerar y redeployar la API del modelo.** Hoy sirve datos del 17-jul. Va
   junto con el re-tuneo del SMA que ya estaba pendiente en
   `modelo-predictivo-m2`. Cuando esté, el enchufe va en `lib/mercado.js` —del
   que cuelgan las tres páginas—, nunca en una página sola: así se llegó a esto.
2. **La API trae el cruce barrio × tipo** (Centro casa 1.757 / Centro depto
   3.455). Es exactamente lo que la calculadora de `/precio-m2` dice que no puede
   calcular. Si el próximo export lo incluye, esa limitación se cae.
3. **El post "Dónde vivir" todavía tiene su propia copia de los perfiles de
   barrio**, en paralelo a `lib/barriosPerfil.js`. Los precios ya salen de la
   misma fuente en los dos, pero el texto editorial está duplicado — y se notó:
   hubo que arreglar la descripción de Vega Maipú dos veces.
