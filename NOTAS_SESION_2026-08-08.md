# Sesión 2026-08-08 — Bugs del tasador, cuentas y formularios

Continuación de `NOTAS_SESION_2026-08-07.md`. **Todo sigue sin commitear**, sumado
a lo de ayer. Nada tocó la base de datos.

---

## 1. Lo que estaba roto y por qué

### a) El login con Google no entraba

`.env.local` tenía `ACCOUNT_AUTH_REDIRECT_URL=http://127.0.0.1:3000/auth/callback/`,
pero `"dev": "next dev"` sirve en `localhost:3000`. El verificador PKCE es una
cookie: se guardaba en `localhost` y Google devolvía a `127.0.0.1`, otro tarro de
cookies. De ahí `pkce_code_verifier_not_found` y el rebote a `/cuenta/?auth_error=1`.

**Arreglado** en `app/cuenta/actions.js`: `getAccountAuthRedirectUrl()` pasó a
`async` y fuera de producción deriva el origen del header `host` —el mismo truco
que ya usaba `redirigirA()` en el callback—. Solo acepta `localhost` y `127.0.0.1`
con puerto opcional: el host lo controla el cliente y aceptar cualquier valor
sería un redirect abierto. En producción sigue usando la variable de entorno.

**Falta que Milton lo confirme haciendo el clic real con Google.**

### b) "Con mi correo ya suscrito no puedo tasar"

El correo nunca fue el problema. Los formularios tenían un campo trampa antibots
llamado `website`, y ese es exactamente el nombre que los gestores de contraseñas
completan solos. **LastPass lo rellenaba** y el servidor tomaba a la persona por
bot. Evidencia: `POST /api/tasar/ 400 in 14ms` — ni llegó a llamar al modelo, y el
mensaje "el modelo no pudo trabajar con esos datos" mentía.

`autoComplete="off"` no alcanza: Chrome y los gestores lo ignoran hace años.

**El mismo campo estaba en cinco lugares**, y los modos de falla eran peores que
el del tasador:

| Dónde | Qué hacía antes | Qué hace ahora |
|---|---|---|
| Muro del correo del tasador | 400 con error visible | No bloquea; a lo sumo saltea el alta en la lista |
| `SuscripcionForm` | Fingía éxito y no suscribía | Igual, pero con el campo blindado |
| `ContactoClient` | `return` mudo: **consulta perdida sin aviso** | Trampa eliminada |
| `EncuestaBarrioDrawer` | `return` mudo | Trampa eliminada |
| `/api/consultas` | Código muerto, ningún form lo alimentaba | Eliminado |

Lo de `/api/consultas` era una mina: el día que el payload incluyera un campo
`website` —la URL de la propiedad, por ejemplo— los leads dejaban de guardarse en
el CRM sin un solo error en ningún lado.

**Nuevo `components/CampoTrampa.jsx`**: campo único, llamado `cp_verif`, con los
atributos que LastPass, 1Password, Bitwarden, Proton Pass y Dashlane respetan
para saltear un campo.

**No sabemos cuántas consultas de contacto se perdieron** mientras el campo se
llamaba `website`. Si se puede cruzar visitas a `/contacto` contra leads
recibidos, ahí estaría el daño.

### c) La primera tasación del día siempre fallaba

`TIMEOUT_MS` era 45 s y el arranque en frío de Render tardaba más. Medido: dos
llamadas seguidas dieron `modelo_dormido` y después resultado, 52 s en total.

**Arreglado en tres frentes:**

- `lib/tasador.js`: 25 s por intento, dos intentos. Dos cortos le ganan a uno
  largo porque el primero despierta el contenedor aunque se corte. Solo reintenta
  ante corte por tiempo.
- **Warmup**: `app/api/tasar/despertar/route.js` + llamada al montar el wizard.
  Completar cinco pantallas lleva más de lo que Render tarda en levantar, así que
  el pedido real llega con el modelo despierto.
- `maxDuration = 60` en `/api/tasar` y en el warmup. **Esto no fallaba en local
  pero iba a romper en producción**: la ruta no lo declaraba y el tope por
  defecto de Vercel es más corto que el timeout del propio tasador.

---

## 2. Cambios de interfaz

### El resultado ahora es un número, no un rango

Decisión revertida respecto de ayer, a pedido de Milton. Un rango de 139k a 256k
no le responde la pregunta a nadie que quiera vender.

`USD 188.953` en grande, el m² debajo, y el rango en letra chica con la leyenda
"puede moverse entre". El número no es inventado: `valorTotal` es la predicción
del modelo, no el punto medio del rango (el medio sería 197.693).

**La barra del rango era decorativa**: relleno fijo en `left-[8%] right-[8%]` y
marcador clavado en `left:50%`, así que dibujaba a la propiedad siempre en el
centro exacto. Ahora `RangoEstimado` calcula la posición real.

El mensaje de WhatsApp abre con el número y deja el rango entre paréntesis.

### El zorro

`components/MascotaModelo.jsx`. SVG inline, sin dependencias. Duerme con Zzz
mientras el contenedor arranca, abre los ojos cuando el modelo contesta, y pasa a
"calculando" durante el pedido. **El estado sale de la respuesta del servidor, no
de un temporizador**: si dijera algo distinto de lo que pasa sería peor que no
tenerlo. Respeta `prefers-reduced-motion`. Reemplazó al cartel de texto que solo
aparecía cuando ya era tarde.

### Scroll al cambiar de paso

`scrollIntoView` no descontaba el header fijo y la tarjeta quedaba debajo del
menú: "Paso N de 5" y la barra de progreso desaparecían. Se agregó `scroll-mt-24`.
En pantallas bajas eso se leía como "apreté y no pasó nada".

---

## 3. Pendientes, en orden

### a) Las fotos: 50,4 MB por entrar a git

Sigue siendo lo más urgente antes del commit. Medido hoy:

| archivo | tamaño | se muestra a |
|---|---|---|
| `deco-living-fuego.jpg` | 8192×5464 · 14,3 MB | 300 px |
| `deco-living-vigas.jpg` | 8256×5504 · 13,5 MB | 300 px |
| `deco-living-fiestas.jpg` | 6430×4287 · 5,2 MB | 300 px |
| `deco-living-moderno.jpg` | 5760×3840 · 4,5 MB | 300 px |
| `deco-living-ventanal.jpg` | 4444×2500 · 2,7 MB | 300 px |
| `tasacion-cuentas.jpg` | 5760×3840 · 4,7 MB | media página |
| `tasacion-ventana.jpg` | 5760×3840 · 3,4 MB | media página |
| `tasacion-asesor.jpg` | 5396×3602 · 2,1 MB | **sin uso** |

El carrusel las pide con `sizes="(min-width: 640px) 300px, 78vw"`: a 2000 px de
ancho sobra hasta en retina.

**Decidido y sin ejecutar**: mover los ocho originales a
`C:\Cerebros\fotos-originales-tasacion` (fuera del repo) y dejar en `public/` las
versiones de 2000 px. Los enlaces de Adobe Stock ya vencieron, así que si se
achica encima no se recuperan.

Falta decidir qué hacer con `tasacion-asesor.jpg`, que quedó sin uso.

### b) `npm run build` sigue sin correrse nunca

Lint da 0 errores y 42 warnings —todas de `<img>`, preexistentes—, pero el build
completo no corrió. Correrlo antes de deployar.

### c) Lo de ayer, sin tocar

- Se fue la puerta de entrada para terrenos, cabañas y locales.
  `components/TasacionForm.jsx` quedó sin borrar a propósito.
- El carrusel tiene cinco livings y uno con adornos de Navidad, que va a
  envejecer mal a partir de marzo.
- El tasador externo `tasador-sma.vercel.app` sigue publicado y ya no está
  enlazado desde ningún lado.

### d) Para mirar en `modelo-predictivo-m2`

El rango que devuelve la API es más ancho que el error del modelo: va de −26% a
+35% sobre la predicción cuando el error promedio es 19,3%. Puede ser un
intervalo de predicción legítimo o puede estar calculado de más. Hay que ver de
dónde salen `rango_min` y `rango_max`.

Ahí también sigue pendiente lo de re-tunear el SMA.

---

## 4. Cosas del entorno, no del código

La terminal de Traycer estaba en `cmd.exe`. Quedó en PowerShell 7 con Oh My Posh,
tema propio en `~/.config/catalan.omp.json` y fuente `GeistMono NF`. Detalle para
no volver a perder tiempo: **la familia se llama `GeistMono NF`, no "GeistMono
Nerd Font"**, y las 27 fuentes estaban en la carpeta del usuario sin registrar en
Windows, así que ningún programa las veía.

La ruta de pwsh que quedó configurada en Traycer incluye la versión
(`...PowerShell_7.6.4.0_x64...`): si se actualiza PowerShell 7, hay que reponerla
en Ajustes → Shell.
