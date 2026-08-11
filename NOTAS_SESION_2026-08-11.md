# Sesión 2026-08-11 — el `npm run build` pendiente

Sesión corta. **No se tocó una sola línea del repo**: el build corrió sobre una
copia descartable en un sandbox Linux, fuera de la máquina de Milton.

## Por qué se corrió

Venía marcado con ⚠️ desde el 7 de agosto. Todo lo que se hizo entre el 7 y el
10 —el tasador dentro de `/tasacion`, `CalculadoraM2.jsx`, `InvestorQuiz.jsx`,
`InversionesClient.js`, `lib/mercado.js`, `precioZonas.js`— se había verificado
parseando con `@babel/parser`. Eso confirma sintaxis, no compilación: no ve
imports rotos, ni un client component tocando algo del server, ni un prerender
que revienta al generar las páginas estáticas.

## Resultado: pasa

```
✓ Compiled successfully in 43s
  Finished TypeScript in 194ms
✓ Generating static pages (82/82)
exit=0
```

Cero warnings de compilación. Las 82 rutas se generan.

## Lo que hubo que sortear (nada del código)

El sandbox no tiene acceso a Google Fonts ni a la red del sitio. Dos parches
**solo en la copia**, nunca en el repo:

1. `app/layout.js` — `Plus_Jakarta_Sans` de `next/font/google` reemplazado por un
   objeto stub. Sin eso el build muere antes de compilar.
2. `npm install --ignore-scripts` — el postinstall de ffmpeg-static baja un
   binario de GitHub releases y da 403 acá.

## El hallazgo que sí importa

Con Supabase y `modelo-predictivo-api.onrender.com` inalcanzables, **el build
terminó bien igual**:

- `[properties] Error leyendo Supabase, uso respaldo` — en las 40 propiedades.
- `[barrios] Sin opiniones para "centro" / "chapelco-golf" / ...` — los 6.
- `[tasador] no se pudo leer la lista de barrios` — y `/tasacion` se generó
  igual, como `○ (Static)` con `revalidate 1d`.

El código degrada sin romperse, que es lo correcto. Pero la consecuencia es que
**un deploy hecho con las fuentes caídas publica datos de respaldo en silencio**,
y cada página queda congelada lo que dure su `revalidate`:

| Ruta | Revalidate | Qué queda servido |
|---|---|---|
| `/propiedades`, `/`, `/favoritos` | 5 m | el respaldo |
| `/barrios/[slug]` | 1 h | sin opiniones |
| `/tasacion` | **1 d** | sin lista de barrios |

Un día entero es mucho, y la API de Render duerme sola cuando nadie la usa —por
algo existe `/api/tasar/despertar`—. No es un bug del código nuevo; es cómo está
armado el deploy. Queda anotado, sin tocar.

## El ⚠️ estaba mal planteado — lo marcó Milton

*"pero lo que se subió a git le llegó a Vercel"*. Y tiene razón.

`main` está pusheado en `origin/main` (`01f41ac`) y Vercel deploya de ahí, así
que **el build viene corriendo en cada push desde el 7 de agosto**, con las
credenciales y las fuentes vivas. Lo que nunca corrió fue el build *local*, que
es otra cosa y bastante menos importante.

Verificado en producción el 11-ago:

- `/precio-m2` — la calculadora, la FAQ y los valores nuevos: 2.085 / 3.292 /
  +57,7 % / "datos al 6 de agosto de 2026". ✅
- `/tasacion` — **las medianas por barrio están con datos reales**: Centro 3.400
  sobre 281 relevadas, Chapelco Golf 3.025, Vega Maipú 2.508, Altos del Sol
  2.027. ✅

Ese segundo punto es la prueba: si Vercel hubiera buildeado con la API caída,
esos barrios saldrían vacíos —como salieron acá en el sandbox—. Salieron con
datos, o sea que el deploy fue sano.

**El pendiente se cierra.** Lo que queda no es correr el build sino el riesgo de
la sección anterior, que sigue vigente y no lo resuelve ningún build verde: esta
vez las fuentes estaban vivas, pero nada garantiza que lo estén en el próximo
push, y el deploy no avisaría.

## Pendiente (sin cambios respecto del 10-ago)

Sigue todo lo listado en `NOTAS_SESION_2026-08-10.md`. Lo grande:

1. Re-tunear SMA en `modelo-predictivo-m2` + regenerar y redeployar la API (hoy
   sirve datos del 17-jul). Si el export nuevo trae el cruce barrio × tipo, se
   cae la limitación que declara la calculadora de `/precio-m2`.
2. 5,5 MB de originales sin usar en `/public` — decidir antes de commitear.
3. ~~El quiz de `/inversiones` recomienda terrenos al perfil conservador~~ —
   cerrado más abajo, en la segunda parte de esta sesión.

`public/grafico1.webp` sigue sin trackear en el repo.

---

# Segunda parte — `/inversiones` deja de contradecirse

Acá sí se tocó código: `app/inversiones/InversionesClient.js`,
`components/InvestorQuiz.jsx` y `components/InversionesMatrizChart.jsx`.
**Ningún archivo de imagen, ninguna consulta a la base.**

El pendiente entró como "el quiz recomienda terrenos", que era un renglón. Al
abrirlo apareció que la página venía diciendo tres cosas distintas sobre lo
mismo según dónde mirabas.

## 1. El quiz no cerraba con nada

| Perfil | Recomendaba | Resaltaba | Simulador |
|---|---|---|---|
| Conservador | **Terrenos y lotes** | `null` — no existe | no preconfiguraba |
| Moderado | **Departamentos** | "Casa alquiler" | alquiler |
| Dinámico | turístico **o reventa** | "Depto turístico" | turístico |

Tres desalineaciones. El conservador terminaba el test y la página no
reaccionaba. El moderado leía "departamentos" y se le iluminaba una casa. El
dinámico recibía dos estrategias en una línea que el simulador cotiza por
separado y con retornos distintos.

Quedó una sola escalera, la que ya existía en la matriz y en el simulador:

    Conservador → alquiler permanente → matriz 3,5 → simulador "alquiler"
    Moderado    → compra y reventa    → matriz 6,5 → simulador "reventa"
    Dinámico    → alquiler turístico  → matriz 7,5 → simulador "turistico"

**Hubo que tocar la pregunta 3.** Su opción del medio era "Generar renta mensual
estable", y con el moderado apuntando a reventa alguien podía pedir renta
mensual y recibir "el retorno llega todo junto en la venta". El problema de
fondo es que las otras tres preguntas miden tolerancia al riesgo y esa medía
preferencia de producto, con la misma escala y sumando al mismo total. Una
preferencia no es un punto intermedio de nada: quien quiere renta mensual puede
ser el más conservador de todos. Ahora dice "Hacer crecer mi capital sin
arriesgar de más".

## 2. Los ROI del quiz salían de otro lado que el simulador

El quiz manda al simulador dos clics después ("Simulá cuánto podrías ganar con
este perfil"), así que prometer ahí un número que esa pantalla no confirma es la
forma más rápida de que deje de creerle a las dos.

| | Simulador | Quiz ahora | Decía |
|---|---|---|---|
| Alquiler | 8,9–10,6 % | 9–11 % | 6–8 % |
| Reventa | 8,0–14,0 % | 8–14 % | — |
| Turístico | 11,6–15,6 % | 12–16 % | 12–18 % |

## 3. La matriz de riesgo estaba escrita a mano

Es lo más grande que apareció. El eje de retorno decía otra cosa que el
simulador de la misma página:

| Punto | Decía | Simulador |
|---|---|---|
| Casa alquiler | 7 % | 9,6 % |
| Casa reventa | 14 % | 11,0 % |
| Depto turístico | 18 % | 13,6 % |

No eran números viejos: eran números de otro lado, y el que tenía respaldo era
siempre el más bajo. Mismo patrón que la serie del m² duplicada que se unificó
el 9-ago, así que mismo arreglo: **no corregir los números sino sacarlos del
mismo lugar**. `MATRIX_DATA` ahora calcula su retorno con las constantes del
simulador —`GASTOS_VACANCIA`, `RENTA_BRUTA_TURISTICO`, `MARGEN_REVENTA`— y la
valorización del m² pasó a una sola `VALORIZACION_ANUAL` que antes se calculaba
adentro del `useMemo`. Reventa y turístico coinciden al decimal; alquiler no
puede coincidir exacto porque el simulador elige segmento según el monto y la
matriz no tiene monto, así que promedia.

Efectos secundarios:

- **Local comercial se cayó del gráfico.** Su 9 % tampoco tenía origen y esta
  vez no hay de dónde sacarlo: `rentabilidad_alquiler` cubre deptos y casas, no
  locales, así que falta el dato de renta que lo ubicaría en el eje. Mantiene su
  tarjeta en la comparativa, que puntúa factores con fuente y no promete retorno
  anual. Es la regla que se le aplicó a Terreno el 10-ago.
- **El eje Y se calcula.** Estaba fijo en 22 % porque el máximo decía 18; con
  13,6 los puntos quedaban apretados abajo con un tercio del gráfico vacío.
  Ahora redondea al múltiplo de 2 sobre el máximo más aire para las etiquetas —
  hoy da 16 %— y acompaña solo si el modelo mueve la valorización.
- **Nota al pie nueva.** Los dos ejes no tienen el mismo respaldo y la página no
  lo decía: el retorno se rastrea hasta la calculadora, el riesgo es una escala
  de 1 a 10 puesta a criterio. Nada en el relevamiento mide volatilidad.

## 4. Las tarjetas de la comparativa estaban desalineadas

Lo vio Milton en pantalla. La fila de etiquetas ("Mejor posicionado" / "Para tu
perfil") se renderiza siempre, pero vacía colapsaba a 0 px: la tarjeta que sí
tenía etiqueta empujaba barra, factores y descripción 20 px abajo, y las tres
columnas de una comparativa quedaban en distinta línea. Ahora la fila reserva
`min-h-[20px]`, que es exactamente lo que mide la etiqueta (`leading-4` 16 +
`py-0.5` 4). Es `min-h` y no `h` fija para que un envolvido inesperado desalinee
en vez de montarse sobre la barra.

## Lo que se evaluó y no se hizo

**La cuarta tarjeta, "Casa reventa".** Sería la que le falta al moderado, pero
no puede existir bien: es el mismo activo que "Casa alquiler" —el modelo tiene
un solo número para casas— así que demanda, liquidez y revalorización serían
idénticas y lo único que cambiaría es estabilidad, donde la reventa es peor
porque no paga renta. Da **65/100, última de las cuatro**, y no por ser peor
inversión sino porque ninguno de los cuatro factores puede ver el margen de
reventa, que es lo que hace que la estrategia valga la pena. El moderado
terminaría el test para leer que su estrategia salió última.

El fondo: la comparativa mide **qué comprar** y la reventa es **qué hacer con lo
comprado**. Si alguna vez hay que resolverlo es cambiando qué mide la tabla, no
agregando una fila. Queda anotado en el código, en el comentario de
`PERFIL_MAP`.

## Verificación

- Build en sandbox: `✓ Compiled successfully`, 82 rutas, `exit=0`. Mismos dos
  parches de siempre y solo en la copia (stub de la fuente, `--ignore-scripts`).
- Se comprobó que cada `card` y cada `calc` del `PERFIL_MAP` existe de verdad en
  `SCORE_DATA` y en el `<select>` del simulador.
- Los números de la matriz se verificaron evaluando el texto real del archivo
  contra el motor del simulador, no una reimplementación.
- Las clases `min-h-[20px]` y `leading-4` se buscaron en el CSS compilado: 20 px
  contra 16+4. Las tres tarjetas reservan la fila.

## Pendiente después de esto

Lo de arriba menos el punto 3, más lo que apareció hoy:

- Los pesos de `SCORE_DATA` (demanda 35 %, liquidez 20 %, revalorización 30 %,
  estabilidad 15 %) también están puestos a criterio y la página no lo declara,
  igual que pasaba con el eje de riesgo.
- El FAQ de `/inversiones` sigue diciendo que "los lotes en zonas de expansión
  muestran la mayor valorización de capital a largo plazo". Se decidió dejarlo:
  es una afirmación general de mercado, no un puntaje derivado del relevamiento.
