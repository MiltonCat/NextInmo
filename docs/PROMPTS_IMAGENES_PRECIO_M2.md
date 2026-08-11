# Las imágenes de /precio-m2

## Estado al 2026-08-09

| Sección | Foto | Estado |
|---|---|---|
| Por qué el m² es tan caro acá | `hero-lago.webp` | ✅ **Resuelta.** El lago Lácar. Estaba en `public/` sin que la usara ninguna página. |
| El barrio manda | `tasacion-cuentas.jpg` | ⚠️ Repite con `/tasacion` |
| Un promedio no ve tu casa | `tasacion-ventana.jpg` | ⚠️ Repite con `/tasacion` |

**Faltan dos.** Abajo está de dónde sacarlas gratis y qué buscar.

---

Dos caminos, los dos sin costo. **La opción B es la que recomiendo.**

## Specs (valen para las dos opciones)

- **Relación 4:3.** El `<figure>` usa `aspect-[4/3]` con `object-cover`, así que
  tolera algo de recorte, pero 4:3 es lo que menos pierde.
- **Ancho mínimo 1600 px.** Las actuales son 2000×1333.
- **`.jpg` de calidad alta o `.webp`, por debajo de 300 KB.**
  `deco-living-fuego.jpg` pesa 436 KB y es la más pesada del sitio.
- **Sin texto, sin logos, sin carteles** en la imagen.
- **Que las caras no sean protagonistas.** Vale para las dos opciones y explico
  por qué al final.

## Dónde va cada una

| Archivo a crear | Sección | Qué tiene que transmitir |
|---|---|---|
| `precio-m2-barrios.jpg` | "El barrio manda" | Comparar, elegir zona |
| `precio-m2-limites.jpg` | "Un promedio no ve tu casa" | Lo particular de una casa |
| `precio-m2-porque.jpg` | "Por qué el m² es tan caro acá" | Por qué la gente quiere venir |

---

# Opción A — Generarlas con IA, gratis

Magnific (el conector que tenés en Cowork) es pago. Estas generan gratis:

- **Google Gemini** — gratis con límite diario, buena calidad fotográfica.
- **Microsoft Copilot / Bing Image Creator** — gratis, sin tarjeta.
- **Adobe Firefly** — tiene créditos gratis mensuales. Es el que tiene la
  licencia comercial más clara de los tres, porque Adobe lo entrenó con su
  propio banco.

Los prompts van en inglés, que es donde mejor rinden. Abajo de cada uno, la
traducción para que sepas qué estás pidiendo.

### 1. `precio-m2-barrios.jpg` — El barrio manda

> Editorial lifestyle photograph, natural documentary style: a couple in their
> thirties standing on a quiet residential street in a Patagonian mountain town,
> looking together at houses across the street. Wooden and stone houses with
> steep roofs, pine trees, a forested mountain ridge in the background.
> Overcast soft daylight, gentle natural colors, muted greens and warm wood
> tones. Shot on 35mm lens, shallow depth of field, candid unposed moment, seen
> from slightly behind and to the side so faces are partially turned away.
> No text, no logos, no signage.

*Una pareja de treinta y pico en una calle tranquila de un barrio de montaña,
mirando juntos las casas de enfrente. Casas de madera y piedra con techos a dos
aguas, pinos, un cordón boscoso al fondo. Luz suave de día nublado. Vistos desde
atrás y de costado, sin que se les vea bien la cara.*

### 2. `precio-m2-limites.jpg` — Un promedio no ve tu casa

> Editorial lifestyle photograph, natural documentary style: a woman in her
> forties standing inside a warm wooden mountain home, holding a mug, looking
> out through a large floor-to-ceiling window at a forested mountain landscape.
> Soft morning light entering the room, wooden beams, simple modern furniture,
> calm and quiet atmosphere. Shot on 50mm lens, shallow depth of field, seen
> from behind at three-quarter angle, face not visible. Muted natural color
> palette. No text, no logos.

*Una mujer de unos cuarenta adentro de una casa de montaña de madera, con una
taza en la mano, mirando por un ventanal de piso a techo hacia el bosque y el
cerro. Luz de mañana entrando, vigas a la vista, muebles simples. Vista desde
atrás, sin que se le vea la cara.*

### 3. `precio-m2-porque.jpg` — Por qué el m² es tan caro acá

> Editorial lifestyle photograph, natural documentary style: a family with two
> adults and a child arriving at a wooden mountain cabin in late afternoon,
> carrying bags toward the front door. Andean-Patagonian setting with pine
> trees, a lake glimpsed in the distance, warm golden hour light. Cozy inviting
> atmosphere, natural muted colors. Shot on 35mm lens, candid unposed moment,
> seen from a respectful distance so faces are small and not the focus.
> No text, no logos, no signage.

*Una familia —dos adultos y un chico— llegando a una cabaña de madera al
atardecer, con bolsos, camino a la puerta. Pinos, el lago asomando a lo lejos,
luz dorada. Vistos de lejos, las caras chiquitas y fuera de foco.*

---

# Opción B — Fotos reales gratis (recomendada)

**Unsplash** y **Pexels**: gratis, uso comercial permitido, sin atribución
obligatoria. Para tu caso puntual tienen una ventaja sobre la IA que no es
menor: **son personas reales.** `/precio-m2` es la página cuyo argumento entero
es "estos datos son reales y verificables". Ilustrarla con gente que no existe
es una contradicción chiquita, pero es una contradicción — y es exactamente el
tipo de detalle que ya te costó caro antes con el Fitz Roy de Chaltén ilustrando
el mercado de San Martín.

## Búsquedas concretas

**Para `precio-m2-barrios.jpg`:**

- https://www.pexels.com/search/couple%20looking%20at%20house/
- https://www.pexels.com/search/neighborhood%20street/
- https://unsplash.com/s/photos/house-hunting

Buscá: pareja de espaldas o de perfil, calle residencial arbolada, casas bajas.
Descartá: barrios suburbanos con cerco blanco y pasto perfecto, que gritan
Estados Unidos y no pegan con San Martín.

**Para `precio-m2-limites.jpg`:**

- Ya encontré una que sirve: https://unsplash.com/photos/woman-holding-mug-and-looking-out-window-ihyo6ih7Fro
- Otra opción: https://unsplash.com/photos/woman-holding-mug-looking-out-window--jvaq1qZ3Vk
- Más: https://unsplash.com/s/photos/mountain-cabin

Buscá: alguien de espaldas frente a un ventanal grande, luz de mañana, madera.

**Para `precio-m2-porque.jpg`:**

- https://unsplash.com/s/photos/cozy-cabin
- https://unsplash.com/s/photos/forest-cabin
- https://www.pexels.com/search/fireplace%20cozy/

Buscá: cabaña de madera entre pinos, luz dorada, gente a distancia. Descartá:
cabañas nórdicas con nieve extrema — San Martín no se ve así la mayor parte del
año, y la página se lee todo el año.

## Advertencia de licencia

Las licencias de Unsplash y Pexels permiten uso comercial, pero **ninguna de las
dos garantiza que la persona de la foto haya firmado una cesión de imagen**
(*model release*). Para uso editorial e ilustrativo como este es la práctica
habitual y el riesgo es bajo. Lo que no se puede hacer nunca es dar a entender
que esa persona es cliente tuya, o que compró o vendió con vos.

---

## Cuando las tengas

1. Poner los tres archivos en `public/`.
2. En `app/precio-m2/page.js`, cambiar las tres rutas del objeto `FOTOS` (está
   arriba de todo) y **reescribir los tres `alt`** para que describan la foto
   nueva.
3. `npm run build`.

Si me pasás los archivos o los links, hago los tres cambios y verifico.

## La regla de los `alt`, otra vez

Describen **lo que se ve** y nada más. No pueden decir ni sugerir que esas
personas son clientes, que esa casa se vendió, ni que ese barrio es un barrio
concreto de San Martín.

Es la misma regla que ya está escrita en `app/tasacion/page.js`, y la razón es
la misma: en la página que promete datos verificables, inventarle una historia
real a una foto de stock es lo único capaz de tirar abajo todo lo demás.
