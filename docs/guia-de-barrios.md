# Guía de Barrios — diseño del sistema

> **Qué es:** un instrumento para acumular, de forma estructurada y permanente, lo que
> piensa la gente que vive en cada barrio de San Martín de los Andes. El activo no es la
> página: es la base que se acumula debajo.

---

## 1. Por qué esto es defendible

Los precios se scrapean: Zonaprop, Argenprop y Properati los tienen todos. La opinión
agregada de los vecinos no existe en ningún lado y **no se puede comprar** — solo se
acumula, respuesta por respuesta.

Eso tiene tres consecuencias estratégicas:

1. **Compone.** Cada respuesta hace la página siguiente un poco mejor, que trae un poco
   más de tráfico, que trae más respuestas. El que arranca dos años tarde arranca en cero.
2. **Cambia la conversación de venta.** De "yo te recomiendo Chapelco" a "de los vecinos
   de Chapelco que respondieron, 7 de 9 lo recomiendan para invertir y 6 marcan el acceso
   en invierno como el punto flojo". Deja de ser opinión de un corredor vendiendo.
3. **Es citable.** Datos propios sobre un tema que nadie midió es lo que hace que un
   medio local te mencione y que otros sitios te linkeen.

---

## 2. El instrumento (lo más importante del sistema)

El diseño de las preguntas determina para siempre qué vas a poder afirmar. Es la decisión
menos reversible de todo el proyecto: podés rediseñar la página cuando quieras, pero no
podés volver a preguntarle a los que ya respondieron.

### Regla de diseño

**Todo lo que quieras poder agregar tiene que ser cerrado. Todo lo que quieras poder citar
tiene que ser abierto. Nada en el medio.**

El formulario actual falla acá: casi todo es texto libre. "¿Qué es lo mejor del barrio?"
en un `<textarea>` da una frase linda para un testimonio, pero nunca vas a poder decir
"el acceso en invierno es la queja principal de Chapelco" a partir de párrafos en prosa.

### Bloque A — Quién responde (define el peso de la respuesta)

| Campo | Tipo | Por qué |
|---|---|---|
| Barrio | select, obligatorio | Clave de agregación |
| Relación con la zona | select: vivo acá / viví acá / tengo propiedad / trabajo acá | Un dueño que no vive no opina igual que un residente |
| Antigüedad | select: <1 año / 1–5 / 5–10 / +10 años | Un vecino de 12 años vale más que uno de 6 meses |

Estos tres campos son los que después te permiten decir *"según residentes con más de 5
años en el barrio"*, que es muchísimo más fuerte que *"según encuestados"*.

### Bloque B — Dimensiones puntuables (el corazón del dataset)

Escala 1–5, todas obligatorias, todas comparables entre barrios:

1. **Tranquilidad** — ruido, movimiento
2. **Seguridad**
3. **Acceso en invierno** — nieve, estado de calles, si quedás aislado
4. **Servicios a mano** — comercios, escuela, salud
5. **Conectividad** — internet / señal
6. **Transporte público**
7. **Vida de barrio** — vecinos, comunidad

El punto 3 es el diferencial patagónico. Nadie lo mide y es exactamente lo que el
comprador de Buenos Aires no puede saber y más le va a doler si se equivoca.

### Bloque C — Recomendación (las métricas titulares)

| Pregunta | Opciones | Para qué |
|---|---|---|
| ¿Lo recomendás para vivir todo el año? | Sí / Con reparos / No | Titular de cada ficha |
| ¿Lo recomendás para invertir o alquilar? | Sí / Con reparos / No | Titular para el inversor |
| **¿Volverías a elegir este barrio?** | Sí / No | **La métrica estrella.** Es el NPS del barrio |
| ¿Se puede vivir sin auto? | Sí / No | Dato práctico, muy consultado |
| ¿Para qué perfil lo recomendás? | multi: familias / jubilados / jóvenes / inversores / teletrabajo | Permite armar el filtro "¿cuál me conviene?" |

*"El 82% de los vecinos volvería a elegir Vega Maipú"* es un titular que se comparte solo.

### Bloque D — Una sola pregunta abierta

> **"¿Qué te hubiera gustado que alguien te dijera antes de mudarte a este barrio?"**

Una sola, al final, opcional, máximo 280 caracteres. Esta pregunta produce las citas
memorables — es concreta, apela a la experiencia real y no a la opinión genérica, y
naturalmente saca a la luz lo que los folletos esconden. Es la que va a llenar de
contenido humano las fichas de barrio.

### Bloque E — Contacto

Email opcional, con un incentivo que **no sea algo ya público**. El informe de m² no
sirve: `/precio-m2` es una página abierta y linkeada en el footer. Alternativas reales:

- Aviso cuando aparezca una propiedad en ese barrio específico
- El resultado agregado del barrio cuando llegue a N respuestas ("te avisamos cuando
  tengamos 20 opiniones de tu barrio y te mandamos el informe")

La segunda es mejor: convierte al que responde en alguien que *quiere* que otros
respondan.

### Extensión total

13 preguntas, de las cuales 7 son clicks en una escala. Bien maquetado son **2 minutos
reales**, no 5. Y el email va al final, después de que ya invirtió esfuerzo.

---

## 3. Modelo de datos

Tabla nueva en Supabase, siguiendo el patrón de `subscribers` y el CRM (`lib/supabaseRest.js`).

```
barrio_opiniones
  id                  bigint pk
  created_at          timestamptz default now()

  -- quién
  barrio              text not null          -- clave de agregación, normalizada
  relacion            text not null
  antiguedad          text not null

  -- dimensiones 1..5
  tranquilidad        smallint
  seguridad           smallint
  acceso_invierno     smallint
  servicios           smallint
  conectividad        smallint
  transporte          smallint
  vida_barrio         smallint

  -- recomendación
  rec_vivir           text                   -- si | reparos | no
  rec_invertir        text
  volveria_elegir     boolean
  sin_auto            boolean
  perfiles            text[]

  -- abierto
  cita                text                   -- max 280
  cita_publicable     boolean default false  -- lo decide la moderación

  -- contacto
  email               text
  nombre              text

  -- moderación
  estado              text default 'pendiente'  -- pendiente | aprobada | rechazada
  nota_interna        text

  -- antifraude
  ip_hash             text
  user_agent          text
```

Puntos importantes:

- **`estado` arranca en `pendiente`.** Nada se publica sin que vos lo apruebes. Ya prometés
  moderación en la página; esto la hace real.
- **`cita_publicable` es independiente de `estado`.** Una respuesta puede computar en los
  promedios aunque su frase no se publique.
- **`ip_hash`** (hash, no la IP) para detectar que alguien cargue 40 respuestas del mismo
  barrio. Sin esto el dataset es trivialmente manipulable, y tu único activo es la credibilidad.
- La agregación se hace en una **vista SQL** (`barrio_agregados`), no en JS, para que las
  fichas de barrio lean un solo registro ya calculado.

### Lo que hay que sacar

El submit actual va a `https://api.web3forms.com/submit` → llega un email → se pierde.
Se reemplaza por una API route propia (`app/api/barrio-opinion`) que escribe en Supabase.
El email de aviso se puede seguir mandando, pero como notificación, no como almacenamiento.

---

## 4. Cómo se muestra sin quemar la credibilidad

El activo que estás construyendo *es* la credibilidad. Un porcentaje inflado la destruye
más rápido de lo que la construyen 200 respuestas.

**Reglas:**

- Con **menos de 5 respuestas** en un barrio: no se muestra ningún promedio. Solo las citas
  aprobadas y un "todavía estamos juntando opiniones de este barrio".
- Con **5 a 14**: números absolutos, nunca porcentajes. *"7 de 9 vecinos lo recomiendan
  para invertir."*
- Con **15 o más**: recién ahí porcentajes, siempre con el n visible al lado.
- Siempre visible: cuántos respondieron, y qué proporción son residentes vs. propietarios.

Esta honestidad no es un costo — es el argumento de venta. Es literalmente lo que te
diferencia del portal que publica cualquier cosa.

---

## 5. El encendido

Una base con cero respuestas no muestra nada, y una página que no muestra nada no
convence a nadie de responder. Hay que sembrar.

**La buena noticia: el contenido de siembra ya existe.** El post
`/blog/donde-vivir-san-martin-de-los-andes` tiene 6 barrios con datos completos —
Centro, Chapelco Golf, La Cascada, Vega Maipú, Peñón de Lolog y Caleuche — con precio m²,
internet, transporte, hospital y clínicas con distancias, cloacas, seguridad, estado de
calles, pet friendly, ventajas y desventajas. Está encerrado en un archivo de 767 líneas.

Se extrae a un dataset compartido (`lib/barrios.js`) y cada barrio pasa a tener su ficha
propia. Ahí, la sección de opiniones arranca vacía pero **la página ya vale por sí sola**.

Nota: hoy hay **tres listas de barrios que no coinciden** (blog: 6, `/precio-m2`: 5,
encuesta: 9; solo Centro y Chapelco Golf están en las tres). Hay que unificarlas en una
sola fuente de verdad antes de construir nada encima.

---

## 6. Los dos públicos

| | Vecino que aporta | Comprador que consulta |
|---|---|---|
| Quiere | Que lo escuchen, rápido | Leer y decidir |
| Llega por | WhatsApp, Instagram, grupos del pueblo | Google: "dónde vivir en San Martín" |
| Necesita ver | Que su opinión sirve para algo | Datos, citas, propiedades en ese barrio |

Hoy comparten una sola pantalla y ninguno obtiene lo suyo. La ficha de barrio sirve al
comprador; el bloque de opinión al final de cada ficha sirve al vecino — y aparece justo
cuando ya leyó algo y tiene una opinión formada, que es cuando la gente sí responde.

**Para el vecino hace falta además un link corto y directo** (tipo
`catalanpropiedades.com.ar/mi-barrio`) que abra el formulario sin pasar por nada, porque
va a llegar desde un mensaje de WhatsApp, no desde una búsqueda.

---

## 7. Escala realista

San Martín es una ciudad chica. El techo no son miles de respuestas: con buena
distribución local, un año bueno son un par de cientos. Eso implica:

- Cada respuesta tiene que rendir mucho → por eso importa tanto el diseño del instrumento
- Los umbrales de publicación del punto 4 no son opcionales
- Concentrar el esfuerzo en 5–6 barrios con volumen real vale más que 15 barrios con 2
  respuestas cada uno

---

## 8. Cómo medir si funciona

| Métrica | Por qué |
|---|---|
| Respuestas por barrio | La única que mide si el activo crece |
| % de respuestas de residentes con +5 años | Mide la *calidad*, no el volumen |
| Barrios que superan el umbral de 5 / de 15 | Cuántas fichas ya pueden mostrar datos |
| Tráfico orgánico a las fichas de barrio | Si la rueda gira |
| Consultas de propiedad originadas en una ficha | La conversión a negocio |

**Antes que nada:** el panel `/admin/analytics` muestra "Falta conectar Google Analytics".
Sin GA y sin Search Console conectados, "no tiene vistas" es intuición, no dato — y no vas
a poder saber si el problema es que no llegan o que llegan y se van.

---

## 9. Orden de construcción

1. **Base de datos + API + moderación en el admin.** Sin esto nada se acumula; todo lo
   demás es decoración. *(Incluye rediseñar las preguntas: la migración define el schema.)*
2. **Unificar la lista de barrios** en una sola fuente de verdad.
3. **Extraer el dataset del blog** a `lib/barrios.js` y crear las fichas por barrio.
4. **Conectar propiedades a barrios.** Hoy `data/properties.js` solo tiene `location` como
   texto libre, sin campo `barrio` — hay que mapearlo para poder mostrar "3 propiedades en
   este barrio" en cada ficha.
5. **Bloque de opinión al final de cada ficha** + link corto para distribución local.
6. **Conectar la medición** y recién ahí empujar distribución.
