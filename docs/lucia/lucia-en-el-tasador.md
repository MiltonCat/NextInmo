# Lucía dentro del tasador

**Estado:** plan para revisar · 11/09/2026 · todavía sin código.
**Lo que decidís vos:** la sección 8.

---

## 1. Por qué acá

En los últimos 28 días, **7 personas hicieron una tasación completa** y **ninguna pidió la revisión
por WhatsApp** desde el resultado (el evento `tasador_resultado_whatsapp` no aparece ni una vez en
Analytics). Una guardó el PDF. El tasador es lo que más se usa del sitio y termina en pantalla
muerta: la persona ve un número, no sabe qué hacer con él y se va.

Ahí es donde Lucía sirve de verdad. No como burbuja esperando que alguien escriba, sino **explicando
el número que la persona acaba de recibir**, que es el único momento en que tiene una duda concreta.

Ya existe media conexión: `components/LuciaTasador.jsx` mete el tasador **dentro del chat**. Falta
la dirección contraria, que es la que tiene tráfico.

---

## 2. Los cuatro momentos

| Momento | Qué hace Lucía | Por qué ahí |
|---|---|---|
| **Mientras el modelo calcula** | Cuenta qué está haciendo y ofrece un dato del barrio elegido | El modelo puede tardar un minuto si estaba dormido. Hoy esa espera es un cartel; puede ser lo primero útil |
| **Cuando aparece el resultado** | Tres preguntas ya escritas, armadas con los datos de esa tasación | Es el momento de máxima duda y hoy no hay nada que hacer salvo irse |
| **Cuando hay algo raro** | Una línea de lectura sin que se la pidan: el modelo avisó algo, o el valor se despega de la mediana del barrio | El dato ya está en pantalla, pero solo alguien del rubro sabe leerlo |
| **Al cerrar** | Arma el mensaje para Milton con lo que la persona preguntó, no solo con los números del formulario | El mensaje de WhatsApp de hoy es fijo y no dice qué le preocupa a la persona |

---

## 3. Qué explica (con datos, sin inventar nada)

Todo esto ya está en la respuesta del modelo o en el sitio:

- **Cómo se armó el número:** qué variables entraron (tipo, barrio, cubierta, terreno, distribución,
  extras) y cuánto pesa el barrio. Lucía ya tiene la herramienta `precio_m2_por_barrio`.
- **Qué es el rango y por qué importa** (`rangoMin`, `rangoMax`, `intervaloPct`) y qué significa el
  error promedio del modelo (`errorPromedioPct`, `nEntrenamiento`).
- **Cómo queda contra el barrio:** el resultado ya compara el m² con la mediana (`medianaBarrio`,
  `nBarrio`). Lucía explica **por qué** puede estar arriba o abajo.
- **Qué avisó el modelo:** las `advertencias` en castellano llano.
- **Qué no ve el modelo:** estado, terminaciones, vista, orientación, ruido, papeles. Esto no es una
  limitación que haya que esconder: es exactamente el puente a la revisión con vos.
- **Que son precios publicados, no de cierre.** Ya está escrito en el gráfico de mercado y tiene que
  decirlo igual acá.

**Tres preguntas que aparecen como botones** (el texto se arma con los datos reales de esa tasación):

1. ¿Por qué me da este valor?
2. ¿Está caro o barato para el barrio?
3. ¿Qué mira Milton que el modelo no ve?

---

## 4. Qué puede opinar, y con qué límite

Esta es la parte que define el proyecto. **Opinar no es que el modelo se anime a dar su parecer: es
aplicar un criterio tuyo a un caso concreto.**

Archivo nuevo: **`data/criteriosDeTasacion.js`**. Cada criterio tiene una condición y tu frase.

```js
{
  id: "arriba-de-la-mediana",
  cuando: (t) => t.valorM2 > t.medianaBarrio * 1.15,
  criterio: "…lo que vos dirías cuando una propiedad da bastante arriba de la mediana del barrio…",
}
```

Casos que conviene cubrir primero, porque son los que más aparecen:

| Situación | Qué tiene que poder decir |
|---|---|
| Da bastante arriba de la mediana del barrio | Cuándo eso se sostiene y cuándo es la propiedad la que tiene algo que el modelo no ve |
| Da bastante abajo | Qué revisar antes de asustarse |
| El modelo avisó que hay pocas comparables | Cuánto confiar en esa estimación |
| Es un terreno o algo poco frecuente en la zona | Cómo se valúa eso de verdad |
| La persona quiere vender ya vs. puede esperar | Tu criterio de precio de publicación según el apuro |

**Las reglas del juego:**

- Si ningún criterio aplica, **Lucía no opina**. Dice qué muestra el dato y ofrece que lo mires vos.
  Nunca improvisa una opinión.
- Cuando opina, se nota que es la postura de la casa, no una deducción del modelo: "la postura acá
  es…". Es la misma separación que ya hace el bloque `respuesta_de_la_casa`.
- **Cada caso sin criterio se guarda como pendiente** del circuito de aprendizaje
  (`docs/lucia/circuito-de-aprendizaje.md`, causa `criterio_casa`). Así el tasador se convierte en la
  mejor fuente de preguntas para vos: son personas decidiendo si venden.
- El número nunca se repite como certeza. Siempre rango, y siempre con el error promedio a la vista.

---

## 5. Lo que hay que construir

Ninguna pieza es grande. La conexión que falta es de datos, no de interfaz.

1. **Pasarle la tasación al chat.** `LuciaProvider.openLucia()` ya abre a Lucía con una pregunta
   escrita (lo usa `LuciaHomePrompt`). Se le suma un `contexto` con el resultado de la tasación.
2. **Que el servidor la reciba con desconfianza.** `/api/lucia` acepta un objeto `tasacion` validado
   campo por campo (tipo, barrio de la lista, superficie dentro de los límites, valores numéricos).
   Viene del navegador: se valida como cualquier otra entrada.
3. **Un bloque nuevo de contexto:** `tasacion_del_visitante` en `lib/luciaKnowledge.js`, con su
   fuente explicada ("es la tasación que esta persona acaba de hacer") y las reglas de arriba. Va
   con prioridad alta en el orden de bloques, junto a `respuesta_de_la_casa`.
4. **Los botones en `components/TasadorResultado.jsx`**, debajo de la comparación con el barrio.
5. **La línea proactiva**, cuando hay `advertencias` o el desvío contra la mediana pasa el 15%.
6. **`data/criteriosDeTasacion.js`** y el selector de criterio (función pura, con tests, como
   `luciaAdvisor.mjs`).
7. **El mensaje de WhatsApp armado con la conversación**, no solo con el formulario.

---

## 6. Fases

| Fase | Qué incluye | Cómo se sabe que anda |
|---|---|---|
| **1 · Explicar** | Puntos 1 a 4. Lucía explica el resultado; todavía no opina | Tasás una propiedad tuya, tocás "¿Por qué me da este valor?" y la respuesta usa tu barrio, tu m² y el rango correcto |
| **2 · Leer sin que le pregunten** | Punto 5 | Una tasación con advertencia muestra la línea de Lucía; una normal, no |
| **3 · Opinar** | Punto 6, con tus primeros tres criterios | Un caso cubierto recibe tu criterio; uno no cubierto ofrece la revisión y deja el pendiente |
| **4 · Cerrar** | Punto 7 y la explicación dentro del PDF | El mensaje que llega a tu WhatsApp incluye lo que la persona preguntó |

Cada fase se puede publicar sola. La 1 ya cambia la página muerta de hoy.

---

## 7. Qué se mide

Hoy, por cada 100 personas que terminan una tasación: **ninguna** pide la revisión. Ese es el número
a mover, y estos eventos nuevos dicen si se mueve y por qué:

- `tasador_lucia_pregunta` — qué botón tocaron (o si escribieron).
- `tasador_lucia_opinion` — si hubo criterio o si cayó en "esto lo mira Milton".
- Los que ya existen: `tasador_submit`, `tasador_resultado`, `tasador_resultado_whatsapp`,
  `tasador_resultado_pdf`.

La pregunta que responde la medición: **de los que hablan con Lucía después de tasar, ¿cuántos
terminan escribiéndote?** Si esa proporción no sube, el problema no era la explicación.

---

## 8. Lo que tenés que decidir

1. **Los primeros tres criterios** de la sección 4, escritos con tus palabras. Sin eso, la fase 3 no
   existe.
2. **¿Puede decir que una propiedad está cara?** Acá es tuya, así que el costo es distinto que en una
   ficha publicada: si alguien tasa y le da arriba de la mediana, ¿Lucía se lo dice derecho?
3. **¿El chat se abre solo cuando hay algo raro, o siempre a demanda?** Yo iría a demanda, con la
   línea proactiva visible pero sin abrir nada.
4. **¿La explicación va también en el PDF?** Ese PDF sale con tu membrete y lo puede mostrar a otro.

---

## 9. Riesgos

- **La espera del modelo.** Lucía no puede sumar segundos a un resultado que ya puede tardar un
  minuto. Todo lo suyo se pide a demanda, después del número.
- **Tapar el resultado en el celular.** El panel de Lucía ocupa casi toda la pantalla: al abrirse
  desde el tasador tiene que dejar el valor a la vista, o repetirlo arriba de la respuesta.
- **Sonar más seguro que el modelo.** El prompt de este bloque tiene que obligar al rango y al error
  promedio. Un texto fluido suena más confiable que un número con margen, y esa confianza no está
  respaldada.
- **Aprender del tasador puede desviar el contenido.** Las preguntas de quien tasa son de venta, no
  de compra. Cuando entren al circuito de aprendizaje conviene tenerlo presente para que el blog no
  se vuelva todo para vendedores.
