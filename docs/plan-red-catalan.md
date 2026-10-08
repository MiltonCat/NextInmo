# Plan · Construir la red de Catalán Propiedades

> Creado el 06/10/2026. Basado en los modelos de Zillow, CoStar, OpenTable y Rightmove, aplicados a lo que ya existe en este repo.
> **Idea central:** la red no son las propiedades publicadas, son los **precios de cierre de la Patagonia** y los dueños que vuelven todos los meses.

## Resumen de etapas

| # | Etapa | Referencia | Inicio | Deadline |
|---|-------|-----------|--------|----------|
| 0 | Verificación y medición base | — | 06/10/2026 | **Hecha 06/10/2026** |
| 1 | "Seguí el valor de tu propiedad" | Zillow | 07/10/2026 | **Publicada 07/10/2026** (falta medir) |
| 2 | Lucía califica contactos | Equipos de alto volumen | 26/10/2026 | **08/11/2026** |
| 3 | Precios de cierre | CoStar + Glassdoor | 09/11/2026 | **20/12/2026** |
| 4 | Tasador en webs de otros corredores | OpenTable | 04/01/2027 | **14/02/2027** |
| 5 | /desarrollos verificados | Rightmove | 15/02/2027 | **15/03/2027** |
| 6 | Revisión y cobro | Rightmove / Zillow | 16/03/2027 | **15/04/2027** |

Las etapas 1, 2 y 3 dependen solo de Milton y del repo. La 4 y la 5 necesitan que la red ya tenga datos para ofrecer.

---

## Etapa 0 · Verificación y medición base
**Deadline: 09/10/2026 · HECHA el 06/10/2026 (punto 3 completado el 08/10/2026)**

- [x] **Frecuencia de actualización.**
  - Datos: se relevan **todas las semanas** (tarea `ModeloM2_Actualizacion_Semanal`, domingos 4 am, en la PC de Milton). La última corrida fue el 04/10.
  - Modelo: la corrida mensual entrena un candidato y lo instala solo si pasa la compuerta. **SMA sigue fijado con el modelo del 06/09**, Villa La Angostura tiene modelo nuevo del 04/10, y Bariloche y Neuquén siguen con el del 06/09.
  - Medianas del sitio (`app/data/mercado_sma.json`): se exportan **a mano**. Última exportación el 13/09; antes el 22/06, 21/07, 06/08 y 21/08 (cada 2 a 4 semanas).
  - El índice mensual del m² ya existe en la API (`GET /mercado/historia`, primera edición 2026-10).
  - **Conclusión:** el valor de una propiedad puntual puede no moverse de un mes a otro (SMA fijado), pero el índice del barrio sí cambia todos los meses. El mail de la etapa 1 tiene que apoyarse en el **movimiento del barrio**, no solo en el valor de la casa.
- [x] **Mails que dejó el muro del tasador:** `subscribers` con `source = tasador` = **2** (5 suscriptores en total). `saved_valuations` = 37 (solo usuarios logueados; puede incluir pruebas de Milton). `inquiries` = 6 (2 de propiedad, 4 de contacto).
- [x] **Operaciones propias con precio de cierre conocido:** no está en la base (`properties` tiene estados disponible/reservada/alquilada/no_disponible, sin precio de cierre). **Milton informó 15 cierres el 08/10/2026.** La etapa 3a arranca con ese histórico. Reparto: Centro 8, Vega San Martín 5, Caleuche 1, Vega Maipú 1. Con N = 5, se pueden publicar **Centro y Vega San Martín**; Caleuche y Vega Maipú solo suman al total de San Martín de los Andes (15 cierres).
- [x] **Tablero:** queda definido en la tabla de métricas del final.

### Hallazgos que cambian el plan
1. **La etapa 1 ya está a medio construir en el repo del modelo** (commit `1c9e185`, 02/10): endpoints `/seguimiento` (alta con consentimiento, valor de hoy, baja y **venta reportada**), `informe_seguimiento.py` (arma el mail mensual sin enviarlo) y el índice mensual. **El sitio todavía no los llama.**
2. **Riesgo de pérdida de datos:** los seguimientos se guardan en archivos (`data/seguimientos/*.jsonl`) y la API corre en **Render gratis, que no conserva el disco** entre reinicios y deploys. Antes de abrir el alta al público, hay que pasarlos a Postgres (ya existe el patrón en `api/feedback_postgres.py`) o a la Supabase del sitio.
3. **La venta reportada por el dueño es la semilla de la etapa 3:** entra como cierre a validar. Las etapas 1 y 3 comparten el dato.
4. **El volumen de entrada es muy bajo:** 2 mails en el muro del tasador. La etapa 1 mejora la retención, pero sin más tasaciones no hay a quién seguir. Hay que sumar tráfico al tasador en paralelo.
5. **Supabase avisa que la organización superó la cuota del plan gratis:** los proyectos quedan restringidos desde el **29/10/2026** si no se resuelve. Esto va antes que todo.

## Etapa 1 · "Seguí el valor de tu propiedad"
**Objetivo:** conseguir propiedades para vender. El dueño que tasa vuelve todos los meses en vez de irse.
**Deadline: 25/10/2026 · PUBLICADA el 07/10/2026 (commit `9ec2631`)**

Se resolvió en el sitio, no en la API del modelo: la tabla vive en la Supabase del sitio y así se evitó el disco que Render gratis no conserva.

- [x] Tabla `seguimientos_valor` en Supabase (`scripts/setup-seguimientos.mjs`), creada el 07/10.
- [x] Bloque "Seguí el valor de tu propiedad" en el resultado del tasador; alta en `POST /api/seguimiento` con consentimiento.
- [x] Cron diario `/api/cron/seguimiento-valor`: vuelve a tasar a los 30 días, suma el movimiento del barrio (`/mercado/historia`) y manda el mail.
- [x] Botón "Quiero vender" → consulta en el panel + aviso por mail. Baja con un clic.
- [ ] Probarlo en producción: tasar, tocar "Avisame cada mes" y ver que la fila aparezca en la tabla.
- [ ] Medir: altas por semana (`seguimiento_alta` en GA4), aperturas y clics en "Quiero vender". El primer mail real sale a los 30 días de la primera alta.

**Métricas:** propiedades seguidas, tasa de apertura, captaciones por mes.

---

## Etapa 2 · Lucía califica contactos
**Objetivo:** que tu tiempo vaya solo a contactos calificados.
**Deadline: 08/11/2026**

**Lo que ya existe:** `lucia_preguntas`, el mini sistema de clientes en `inquiries` (`lib/crm.js`) y los dos embudos (compra y alquiler).

- [ ] Clasificar la intención al cerrar la charla: `curioso` / `comprador_con_fecha` / `dueno_vendedor`.
- [ ] Guardar en `inquiries` la intención y un resumen de 2 o 3 líneas.
- [ ] Avisarte (mail o WhatsApp) **solo** de `comprador_con_fecha` y `dueno_vendedor`.
- [ ] Vista en `/admin/consultas` filtrada por intención.
- [ ] Revisar a mano 20 clasificaciones antes de confiar en los avisos.

**Entregable:** avisos de contactos calificados funcionando.
**Métricas:** contactos calificados por semana, tiempo hasta tu primera respuesta, precisión de la clasificación.

---

## Etapa 3 · Precios de cierre
**Objetivo:** el dato propio que no tiene nadie, que es la base de m² Patagonia.
**Deadline: 20/12/2026**

**Referencia de Milton (08/10/2026):** el precio de cierre suele quedar entre un 5% y un 10% por debajo del publicado. La diferencia se explica sobre todo por los gastos de escritura, que rondan esos valores: el comprador casi nunca los tiene contemplados en el monto que ofrece y son un costo inevitable.
- `precio_cierre` = monto real acordado por la propiedad (no el valor escriturado, si difiere). Milton confirmó el 08/10/2026 que tiene anotado el monto real de sus 15 operaciones.

**3a · Tus cierres (09/11 → 22/11)**
- [x] Tabla `cierres`: barrio, tipo, m² cubiertos, m² de terreno, precio publicado, precio de cierre, fecha, días publicada, fuente (`propia` / `corredor` / `escribano`).
- [x] Formulario en `/admin/cierres` (commit `f73441d`, tabla creada el 08/10/2026).
- [ ] Carga del histórico propio: el 08/10 Milton empezó por los 8 del Centro; quedan pendientes Vega San Martín (5), Caleuche (1) y Vega Maipú (1).

**3b · Informe público (23/11 → 06/12)**
- [ ] En `/precio-m2`: diferencia entre precio publicado y de cierre, y días de venta por barrio.
- [ ] Mostrar un barrio **solo si tiene al menos N cierres** (definir N, por ejemplo 5) para que nadie quede identificado. Si hay menos, mostrar el barrio agregado o "sin datos suficientes". Nunca rellenar.
- [ ] Avisar a IndexNow y marcar con datos estructurados para que lo citen los asistentes de IA.

**3c · Abrir a terceros (07/12 → 20/12)**
- [ ] Formulario para corredores y escribanos: cargan un cierre anónimo y a cambio ven el informe detallado de su barrio.
- [ ] Validar cada cierre a mano antes de sumarlo.

**Entregable:** el informe de cierres publicado y el primer cierre cargado por un tercero.
**Métrica principal de la red:** cierres cargados por mes.

---

## Etapa 4 · Tasador en webs de otros corredores
**Objetivo:** que la red se llene sola.
**Deadline: 14/02/2027**

**Lo que ya existe:** `/demo/[inmobiliaria]/widget`, un iframe con la marca de otra inmobiliaria. **No calcula**, es una demo. El modelo ya cubre San Martín, Neuquén, Villa La Angostura y Bariloche.

- [ ] **Decisión (antes del 04/01):** ¿sale como Catalán o como m² Patagonia?
- [ ] Widget real conectado a `/api/tasar`, con una clave por inmobiliaria y un límite de uso por clave.
- [ ] Los contactos del widget van al corredor, con un panel simple para verlos.
- [ ] A cambio, el corredor carga sus cierres (etapa 3) y su oferta. Consultar a Tokko si da acceso por API con la clave de la cuenta.
- [ ] Sumar de 3 a 5 corredores piloto de ciudades donde no operás.

**Entregable:** 3 corredores con el widget en producción.
**Métrica:** corredores activos por semana (no registrados).
**Nota:** enero y febrero son temporada alta. Si te falta tiempo, esta etapa es la que se corre.

---

## Etapa 5 · /desarrollos verificados
**Objetivo:** la oferta de terceros con confianza como diferencial.
**Deadline: 15/03/2027**

**Lo que ya existe:** la tabla `developments` con `desarrolladorInfo` y Pueblo Chapelco cargado.

- [ ] Ficha de trayectoria del desarrollador: obras entregadas, fechas reales contra prometidas, referencias y fotos de obras anteriores.
- [ ] Sello "Verificado por Catalán Propiedades" con fecha de verificación.
- [ ] Intermediario para los contactos (el inversor no ve el contacto directo al principio) y un acuerdo simple del 3% al cierre.
- [ ] Sumar un segundo desarrollador.

**Entregable:** 2 desarrolladores verificados publicados.
**Métrica:** liquidez, es decir, qué porcentaje de los desarrollos recibe un contacto calificado en 30 días.

---

## Etapa 6 · Revisión y cobro
**Deadline: 15/04/2027**

Se cobra **recién cuando hay movimiento**. Cobrar antes frena la red.

- [ ] Revisar las métricas de todas las etapas.
- [ ] Si los corredores activos y los cierres por mes crecen, armar la suscripción de m² Patagonia para corredores.
- [ ] Si los desarrollos tienen liquidez, formalizar el 3% y una tarifa por destacar.
- [ ] Decidir qué etapa se profundiza y cuál se abandona.

---

## Tablero de métricas

| Métrica | Etapa | Fuente |
|---------|-------|--------|
| Propiedades seguidas | 1 | Supabase |
| Captaciones por mes | 1 | `inquiries` tipo `captacion` |
| Contactos calificados por semana | 2 | `inquiries` por intención |
| **Cierres cargados por mes** | 3 | `cierres` |
| Corredores activos por semana | 4 | uso del widget por clave |
| Liquidez de desarrollos | 5 | `inquiries` por desarrollo |

## Reglas que no se rompen
- No se inventan datos. Lo que no está confirmado queda en `null` o "sin datos suficientes".
- Nada se publica de un barrio sin la cantidad mínima de cierres.
- Cada etapa se cierra con su métrica medida, no con el código terminado.
