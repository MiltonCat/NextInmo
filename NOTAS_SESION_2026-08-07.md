# Sesión 2026-08-07 — Tasador nativo en /tasacion

Estado al cerrar el día. Todo el código está aplicado en la carpeta local,
**sin commitear**. Nada tocó la base de datos ni renombró archivos existentes.

---

## 1. Qué se hizo: el tasador ahora vive dentro del sitio

Antes `/tasacion` era un formulario que abría WhatsApp, y el tasador real vivía
en una app aparte (`tasador-sma.vercel.app`). Ahora el cálculo ocurre en el
sitio propio: el tráfico, el SEO y los correos se quedan en el dominio.

La API del modelo (`modelo-predictivo-api.onrender.com`) se consume **desde el
servidor**, nunca desde el navegador. Su URL no está en el bundle del cliente.

### Archivos nuevos

| Archivo | Qué hace |
|---|---|
| `app/api/tasar/route.js` | Único camino al modelo. Rate limit, muro del correo, alta de suscriptor, guardado en `saved_valuations`. |
| `lib/tasador.js` | Server-only. Normaliza la entrada, llama al modelo, trae la lista de barrios. |
| `lib/tasadorOpciones.js` | Constantes que comparten el wizard y la API (tipos, extras, límites). |
| `components/TasadorWizard.jsx` | Wizard de 5 pasos, una pregunta por pantalla. |
| `components/TasadorResultado.jsx` | Resultado y muro del correo. |
| `components/CarruselDecoracion.jsx` | Carrusel aspiracional del cierre. |
| `descargar-fotos-tasacion.ps1` | Baja las fotos licenciadas de Adobe Stock. Ya se corrió; los enlaces adentro **ya vencieron**. |

### Archivos modificados

`app/tasacion/page.js` (rehecha), `lib/mercado.js` (+`referenciaBarrio`,
`barriosDestacados`, serie de evolución), `config.js` (+`TASADOR_PATH`),
`components/TasacionForm.jsx` (paleta), y 6 páginas que enlazaban al tasador
externo (`app/page.js`, `app/vender/page.js`, 4 posts del blog).

---

## 2. El muro del correo

La regla, decidida con Milton:

- **1ª tasación**: libre y anónima, no pide ni el nombre.
- **2ª en adelante**: pide correo. Se ve la ficha tapada con un *placeholder*
  difuminado y el campo encima. Al dejar el mail se revela sin recargar.
- **Con sesión iniciada**: sin muro nunca, y cada tasación se guarda en
  `saved_valuations` (tabla que ya existía sin usar).

**El conteo va en cookie httpOnly** (`cp_tasaciones`, `cp_tasador_email`), no en
`localStorage`: una condición que el cliente puede reescribir no es una
condición. Y cuando está bloqueado **el modelo ni se llama**, así que el número
real nunca viaja al navegador de quien no debe verlo.

El correo entra a `subscribers` con `source: "tasador"` y recibe el mail de
bienvenida que ya existía.

### Para probar los tres escenarios

Borrar `cp_tasaciones` y `cp_tasador_email` en DevTools → Application → Cookies,
o abrir una ventana de incógnito.

---

## 3. Decisiones de criterio que conviene no revertir sin pensarlo

**El resultado es un rango, no un número.** El modelo tiene un error de dos
dígitos; publicar "USD 312.480" fingiría una precisión que no existe y se cae
en cuanto la persona consulte a un segundo tasador.

**Los barrios sin datos suficientes no muestran precio.** De los 38 que acepta
el modelo, 18 tienen mediana publicable (`estado: usable` y n ≥ 4). Los demás
aparecen en la lista pero sin número al costado.

**No se usa `hero-montana.webp`.** Es el Fitz Roy, en Chaltén, a 1.500 km.
Ilustrar el mercado local con un cerro de otra provincia rompe lo que la página
promete. Ojo: **esa imagen sigue siendo la que sale al compartir cualquier
página del sitio** (`DEFAULT_OG_IMAGE` en `config.js`). Quedó sin tocar porque
afecta a todo el sitio, no solo a esta página.

**Las fotos de personas son de stock, no clientes.** Los textos alternos las
describen sin atribuirles historia. Ponerles nombre y una frase entre comillas
convertiría la única página que promete datos verificables en la que tiene un
testimonio inventado.

**Se sacaron 6 promesas de "informe PDF gratis"** repartidas por el sitio: el
tasador nuevo no genera PDF. Si algún día se hace, el copy vuelve.

---

## 4. Pendientes para mañana, en orden de urgencia

### a) Las fotos pesan 51 MB y están por entrar a git

Ocho archivos en `public/`, dos de ellos de 13 y 14 MB (8256×5504 px) que en el
carrusel se muestran a 300 px de ancho. `next/image` las optimiza al servir, así
que **al visitante no le llegan así**, pero una vez commiteadas quedan para
siempre en la historia del repo.

**Todavía no se commiteó nada.** Achicarlas antes es la última oportunidad
barata: a 2000 px de ancho alcanza y sobra, y bajaría de 51 MB a unos 4.

### b) `public/tasacion-asesor.jpg` quedó sin uso

2,2 MB. Era para el bloque del formulario personal, que se sacó. Borrarlo o
dejarlo por si ese bloque vuelve.

### c) Se fue la puerta de entrada para terrenos, cabañas y locales

El modelo no los tasa y el formulario largo era por donde entraban esas
consultas. Hoy esa persona llega, no encuentra su tipo de propiedad y se va.
`components/TasacionForm.jsx` quedó **sin borrar** a propósito: reponerlo, o
poner un botón a WhatsApp en su lugar, son diez minutos.

### d) El carrusel: cinco livings y uno con adornos de Navidad

Falta variedad (una cocina, un dormitorio) y la de fiestas va a envejecer mal a
partir de marzo. Los IDs de Adobe Stock están en `descargar-fotos-tasacion.ps1`;
reemplazarlas es buscar dos nuevas y licenciarlas.

### e) Falta correr `npm run build`

Se verificó con lint (0 errores) y con parseo de todos los archivos tocados,
pero **el build completo nunca corrió**: el sandbox de Linux no tiene el binario
SWC porque `node_modules` se instaló en Windows. Correrlo antes de deployar.

### f) El tasador externo sigue publicado

`tasador-sma.vercel.app` ya no está enlazado desde ningún lado del sitio.
Cuando deje de recibir visitas, redirigirlo a `/tasacion` y borrar la constante
`TASADOR_URL` de `config.js` (quedó comentada explicando esto).

---

## 5. Cosas que se intentaron y no se pudieron

- **Generar imágenes con IA**: Magnific pide plan pago; Adobe no tiene IA
  generativa habilitada en este entorno. Se resolvió con Adobe Stock.
- **Bajar las fotos desde el agente**: el sandbox no tiene salida a internet
  (el proxy devuelve 403 en CONNECT). Por eso el script de PowerShell.
- **Ver las fotos de stock antes de elegirlas**: el preview de Adobe da error de
  encode. Se resolvió mostrándoselas a Milton para que eligiera él.
