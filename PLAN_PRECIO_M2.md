# Plan de revisión — /precio-m2

Fecha: 2026-08-09 · Estado: **las cuatro fases implementadas.**
Fases A y D → `NOTAS_SESION_2026-08-09.md`. Fases B y C → `NOTAS_SESION_2026-08-10.md`.

Queda sin hacer, y sigue anotado al pie de las notas del 10: el TXT descargable
de `/inversiones`, verificar el dato de 2022 con una fuente nueva, y reemplazar
las dos fotos que `/precio-m2` todavía comparte con `/tasacion`.
**Ninguna de las dos sesiones pudo correr `npm run build`.**
Alcance: `app/precio-m2/page.js`, `lib/precioZonas.js`, `components/PrecioM2Chart.jsx`.

**Qué toca cada cambio:** todo lo de este plan es **solo código**. Nada toca archivos de
imagen ni la base de datos. El único dato que se mueve son constantes en `.js`.

---

## 0. El problema de fondo

`/precio-m2` es una de las páginas más enlazadas del sitio: está en el Navbar, en el
Footer, en la home, en el sitemap con prioridad 0.8, en cinco artículos del blog y en el
email de bienvenida. Y es la única de ese grupo que **no lee los datos del modelo**.

Tiene su propia copia de todo, escrita a mano en el archivo. Eso es exactamente lo que el
comentario de `lib/precioZonas.js` advierte que ya pasó una vez con el sitemap y con las
tres listas de barrios: dos copias se desincronizan siempre.

Ya se desincronizaron.

---

## 1. Contradicciones entre páginas (lo más urgente)

### 1.1 El sitio publica dos evoluciones distintas del m²

| | `/tasacion` (lee `lib/mercado.js`) | `/precio-m2` (constante local) |
|---|---|---|
| 2021 | USD 1.680 | USD 2.350 |
| 2026 | USD 2.650 | USD 2.600 |
| Suba total | **+57,7 %** | **+10 % aprox.** |

Las dos frases están publicadas hoy, a un clic de distancia. Un inversor que compare las
dos páginas ve que el mismo sitio le dice que San Martín subió 57 % y que subió 10 %.
Para una página cuyo argumento central es "estos son datos verificables", esto es lo peor
que puede pasar: no es un número mal puesto, es la credibilidad de las dos páginas.

**Hay que decidir cuál es la serie buena.** Mi lectura: la de `mercado.js` está marcada
`referencia_curada` y el modelo le verifica el último año contra la mediana actual, así
que tiene un control que la otra no tiene. Pero +57,7 % en 5 años en dólares es una suba
fuerte y conviene que la mires vos antes de publicarla en la página que Google lee para
"precio m2 san martin de los andes".

### 1.2 El promedio de la página contradice al modelo

La página muestra "**USD 2.500 – 2.650** precio promedio del m²" con etiqueta *Verificado*.

El modelo (1.597 propiedades relevadas al 2026-08-06) dice:

- **Casa: USD 2.085/m²** (rango intercuartil 1.598 – 2.620, n=188)
- **Departamento: USD 3.292/m²** (rango 2.662 – 3.923, n=472)

Y `lib/mercado.js` deja escrito, en un comentario, por qué no hay que publicar un número
único: *"casas y departamentos difieren ~58 %, así que el promedio mezclado no le sirve a
nadie — ni al que vende una casa ni al que vende un departamento."*

`/precio-m2` publica justo ese promedio mezclado, y encima marcado como verificado cuando
en realidad no coincide con ninguna de las dos cifras reales.

### 1.3 Los precios por zona no coinciden con las medianas reales

| Zona | En `precioZonas.js` | Mediana del modelo | Δ |
|---|---|---|---|
| Centro · Depto | 2.735 | 3.400 (n=281) | −20 % |
| Chapelco Golf · Depto | 3.400 | 3.025 (n=23) | +12 % |
| Las Pendientes · Casa | 2.950 | 3.537 (n=11) | −17 % |

El "máximo por zona: USD 3.400 · Chapelco Golf" que la página destaca como stat es en
realidad, según el modelo, la mediana del **Centro**.

### 1.4 Fechas

Dice "Actualizado — Julio 2026" en el badge verde y "Actualizado julio 2026" en la tabla.
Los datos del modelo son del **6 de agosto**. Hoy es 9 de agosto. Además está hardcodeado:
va a decir "julio 2026" para siempre hasta que alguien lo edite a mano.

### 1.5 "El m² más caro de Argentina"

El dato es de 2022 (USD 2.520, Diario 7 Lagos) y se presenta en presente — "es la ciudad
con el metro cuadrado más caro". Son cuatro años. Si sigue siendo cierto, hay que
verificarlo con una fuente 2025/2026; si no, hay que pasarlo a pasado ("fue, en 2022…").
Es el dato más fuerte de la página y el más fácil de refutar.

---

## 2. SEO técnico: lo que la página está dejando pasar

- **No tiene JSON-LD.** Es la única página importante del sitio sin datos estructurados —
  los tienen `/tasacion`, `/inversiones`, `/barrios`, `/alquileres`, `/centro-ayuda` y los
  15 artículos del blog. Acá corresponden dos: `Dataset` (para la serie de precios, que es
  literalmente un conjunto de datos con fuente y fecha) y `FAQPage`.
- **No tiene FAQ.** "¿Cuánto cuesta el m² en San Martín?", "¿por qué es tan caro?",
  "¿cuánto sale una casa de 100 m²?" son búsquedas reales y hoy la página las responde en
  prosa suelta, sin estructura que Google pueda levantar como respuesta destacada.
- **`lastModified` del sitemap** usa `now`, o sea que le dice a Google que la página cambió
  hoy aunque los datos sean de hace un mes. Debería usar `MERCADO_GENERADO`.
- **Enlaces internos flojos:** la tabla linkea a `/barrios/[slug]` solo en 5 zonas, y no hay
  ningún enlace a `/tasacion` en todo el cuerpo (solo `/inversiones` y `/contacto` al final).

---

## 3. Conversión: la página no lleva a ningún lado

El CTA final manda a `/inversiones` y a `/contacto`. Falta lo obvio: alguien que busca
"precio del m²" está tratando de saber cuánto vale **su** propiedad o si **la que está
mirando** está cara. Las dos preguntas las contesta el tasador, que ya está construido,
funciona en un minuto y no pide datos la primera vez.

Hoy `/precio-m2` no lo menciona ni una vez.

---

## 4. Lo que hace Airbnb, y qué se puede robar

Miré cómo Airbnb resuelve el mismo problema en `airbnb.com/host/homes`: publicar un dato
de mercado agregado sin que sea un folleto ni una mentira. Cuatro cosas que aplican acá.

### 4.1 El dato agregado no se publica: se convierte en el dato del visitante

Airbnb no dice "el promedio en tu ciudad es X". Dice **"Tu casa podría ganar $X"** y al
lado pone un **slider** ("¿cuántas noches?") que recalcula el número en vivo. El promedio
sigue siendo el mismo dato de siempre, pero deja de ser una estadística sobre otros y pasa
a ser una estimación sobre vos.

**Acá:** la página ya tiene el ejemplo bueno enterrado en el hero — *"si el m² vale USD
2.500, una casa de 100 m² ronda los USD 250.000"*. Eso, que hoy es un párrafo con un
emoji, debería ser un control: un input de metros + un selector de barrio y tipo, que
devuelva el rango al instante. Es la misma cuenta, pero la persona la hace con **su** casa.

### 4.2 "Learn how we estimate earnings" está al lado del número, no en el pie

Airbnb pone el link a la metodología pegado a la cifra grande, no escondido abajo. Admitir
el margen de error donde se ve **aumenta** la credibilidad del número en vez de bajarla.

**Acá:** el sistema de badges (Verificado / Estimación propia / Referencia histórica) ya es
mejor que lo que hace la mayoría de los portales — Zillow y Redfin publican índices sin
marcar fila por fila de dónde sale cada uno. El problema no es el sistema, es que hay
badges **mal puestos**: el promedio marcado "Verificado" no coincide con el modelo (1.2).
Un badge verde equivocado hace más daño que no tener badges.

### 4.3 Divulgación progresiva: primero el número, después el detalle

Airbnb muestra una cifra grande y limpia; lo demás aparece si lo pedís. La página de hoy
abre con leyenda de badges + tres tarjetas + caja verde + gráfico + tabla de 13 filas,
todo con el mismo peso visual. No hay una jerarquía que diga qué mirar primero.

**Acá:** una sola cifra arriba (o dos: casa y depto, que es la división que importa), y
todo lo demás abajo. Es, además, exactamente lo que ya hace `/tasacion` con sus métricas
en hairline: se ven como respaldo, no como tres botones.

### 4.4 Todo termina en una acción, siempre la misma

Cada bloque de Airbnb cierra en "Get started". No hay bloques informativos que mueran solos.

**Acá:** el destino natural es `/tasacion`, y debería aparecer al menos dos veces: una
después de la calculadora del hero y otra al cierre.

---

## 5. Alineación con el patrón de `/tasacion`

Lo que armamos en `/tasacion` ya define un lenguaje. `/precio-m2` es de antes y no lo
sigue. Diferencias concretas:

| | `/tasacion` | `/precio-m2` hoy |
|---|---|---|
| Hero | blanco, `font-semibold`, `tracking-[-0.025em]` | `bg-gray-50`, `font-black` |
| Métricas | hairline, `divide-x`, `border-y` | 3 tarjetas `rounded-2xl shadow-sm` |
| Títulos | `text-[26px] md:text-[34px] font-semibold` | `text-2xl font-black` |
| FAQ | `<details>` + JSON-LD de una sola fuente | no hay |
| Ancho | `max-w-3xl` / `max-w-6xl` | `max-w-4xl` |
| Datos | lee `lib/mercado.js` | constantes locales |
| Fotos | 3 bloques con foto propia | ninguna |
| Tono | "Esto el modelo no lo puede tasar" | "💡 Ejemplo sencillo:" |

El emoji 💡 y los `font-black` son de la etapa anterior del sitio. Pasarla al lenguaje del
tasador no es cosmética: hace que las dos páginas se lean como escritas por la misma
persona, que es de lo que depende que a los números se les crea.

---

## 6. Plan propuesto, por fases

### Fase A — Que los números dejen de contradecirse (lo primero, sí o sí)

1. Decidir cuál serie de evolución es la buena (§1.1). **Necesito tu decisión.**
2. Borrar la constante `EVOLUCION` de `page.js` y leer `EVOLUCION_SERIE` de `lib/mercado.js`.
3. Reemplazar el stat "promedio USD 2.500–2.650" por **dos** cifras: casa y depto, con su
   rango intercuartil y su `n`, tal como las publica `/tasacion`.
4. Revisar `lib/precioZonas.js` contra las medianas del modelo (§1.3). Donde el modelo
   tiene `n` suficiente, usar el modelo; donde no, dejar la estimación y marcarla ámbar.
5. Fecha automática desde `MERCADO_GENERADO`, no hardcodeada.
6. Verificar o poner en pasado el "m² más caro de Argentina" (§1.5).

*Solo código. Riesgo bajo. Es lo que más pesa.*

### Fase B — Que la página lleve al tasador

7. **Calculadora en el hero:** metros + barrio + tipo → rango al instante, con el número
   grande y "cómo lo calculamos" al lado (§4.1, §4.2).
8. CTA a `/tasacion` debajo de la calculadora y en el cierre, sin sacar `/inversiones`.
9. Enlazar las filas de la tabla a las fichas de barrio que existan (ya lo hace) y agregar
   un enlace a `/tasacion` desde cada zona.

### Fase C — SEO

10. FAQ visible con `<details>` + `FAQPage` JSON-LD, de una sola fuente, igual que
    `/tasacion` (ese comentario del archivo explica por qué de una sola fuente).
11. `Dataset` JSON-LD para la serie de precios: `name`, `temporalCoverage`,
    `dateModified`, `creator`, `variableMeasured`.
12. `sitemap.js`: `lastModified: MERCADO_GENERADO` para esta URL.

### Fase D — Diseño

13. Pasar tipografía, anchos y espaciados al lenguaje de `/tasacion` (§5).
14. Tabla en mobile: 13 filas × 4 columnas a 375 px hoy se aprieta. Pasar a tarjetas
    apiladas o a scroll horizontal con la primera columna fija.
15. Sacar el emoji 💡 y los `font-black`.
16. Evaluar una foto propia (como hizo `/tasacion` con la aérea del pueblo). Opcional.

---

## 7. Lo que necesito que decidas antes de arrancar

1. **¿Qué serie de evolución publicamos?** (§1.1) — es la decisión que bloquea la Fase A.
2. **¿Verificamos el dato de "el m² más caro de Argentina" o lo pasamos a pasado?** (§1.5)
3. **¿La calculadora del hero entra ahora o la dejamos para después?** (§4.1) — es lo que
   más mueve la aguja en conversión y también lo que más trabajo lleva.
4. **¿Hago las cuatro fases seguidas o vamos de a una, con revisión en el medio?**
