# Plan de SEO local — Catalán Propiedades (San Martín de los Andes)

**Fecha:** 29 de junio de 2026
**Objetivo:** que aparezcas cuando alguien busca "inmobiliaria San Martín de los Andes", "casas en venta SMA", "alquiler permanente San Martín de los Andes" y similares — y que ese tráfico se convierta en consultas.

---

## Punto de partida (lo que ya tenés y está bien)

No partís de cero. Revisando el código, el SEO **on-page** ya está sólido:

- Schema `RealEstateAgent` con nombre, teléfono, dirección (localidad Neuquén/AR), `areaServed` (SMA, Junín, Chapelco), `priceRange` y `sameAs`.
- `sitemap.js`, `robots.js`, `metadataBase`, Open Graph y verificación de Google Search Console.
- Metadata local en cada página y blog (títulos y descripciones con "San Martín de los Andes").
- Un blog que, según tu propio análisis de competencia, **te pone por delante de toda la competencia local en contenido**.

Por eso este plan se concentra en lo que falta: **el SEO local fuera del sitio**, que es donde de verdad se gana la búsqueda local y donde hoy tenés el mayor hueco.

---

## Prioridad 1 — Google Business Profile (lo de mayor impacto, gratis)

Es la palanca número uno del SEO local y vive fuera de tu web. Es lo que te mete en el mapa de Google y en el "paquete local" (las 3 fichas con mapa que aparecen arriba de los resultados).

Qué hacer:

1. **Crear / reclamar la ficha** en business.google.com como "Agencia inmobiliaria" en San Martín de los Andes. Verificarla (Google manda código por correo, teléfono o video).
2. **NAP idéntico al de tu web.** Nombre "Catalán Propiedades", teléfono +54 9 2944 30-1470, misma dirección. Que coincida exactamente con el schema del sitio — Google cruza esos datos.
3. **Completar todo:** horario (Lun–Vie 9:30–19:00, Sáb 10:00–13:00, ya lo tenés en `config.js`), zona de servicio (SMA, Junín, Chapelco), enlace a la web, WhatsApp, categorías secundarias ("Agente inmobiliario", "Servicio de tasaciones").
4. **Fotos reales** de propiedades, del local y del equipo. Las fichas con fotos reciben muchas más visitas y clics.
5. **Publicar novedades** cada semana (propiedad destacada, nota del blog). Google premia las fichas activas.

---

## Prioridad 2 — Reseñas (lo que más mueve el ranking local y la conversión)

Las reseñas en Google son, junto con la ficha, el factor que más pesa en el mapa local. Y convierten: el que ve 20 reseñas buenas confía y escribe.

Qué hacer:

1. **Pedir reseña a cada cliente cerrado.** Armá un link directo de reseña de Google y mandalo por WhatsApp apenas se firma. Lo más efectivo es pedirlo en caliente.
2. **Meta inicial realista:** 10–15 reseñas en los próximos 2–3 meses. Salir de 0 ya te diferencia de la competencia local.
3. **Responder todas**, buenas y malas, con tono profesional. Suma señal de actividad.
4. Cuando tengas reseñas, agregá `aggregateRating` al schema `RealEstateAgent` del sitio (hoy no lo tiene) para mostrar estrellas en los resultados.

---

## Prioridad 3 — Citations / directorios locales (consistencia de NAP)

Google confía más en un negocio cuyos datos (nombre, dirección, teléfono) aparecen idénticos en muchos lados. Esto se llama "citations".

Qué hacer:

1. **Alta en directorios** con el MISMO NAP: Páginas Amarillas Argentina, Cylex, portales inmobiliarios (Zonaprop, Argenprop, Mercado Libre — perfil de inmobiliaria, no solo avisos), guías turísticas de SMA (Interpatagonia, SMAndes).
2. **Redes sociales** con datos coherentes y enlace a la web (Instagram, Facebook). Sumalas al `sameAs` del schema.
3. Revisar que en ningún lado figure un teléfono o dirección viejos/distintos — la inconsistencia resta.

---

## Prioridad 4 — Pequeños ajustes on-page que faltan

Tu sitio está bien, pero hay tres mejoras concretas de SEO local:

1. **Coordenadas en el schema.** Agregar `geo` (latitude/longitude) al `RealEstateAgent` en `app/layout.js`. Refuerza la señal de ubicación.
2. **`openingHours` en el schema.** Ya tenés `BUSINESS_HOURS` en `config.js`; conviene reflejarlo también en el JSON-LD.
3. **Página de tasación como aterrizaje SEO local.** Tu tasador es tu activo no copiable. Una página optimizada para "tasar propiedad San Martín de los Andes" / "cuánto vale mi casa en SMA", enlazada desde cada post, capta búsqueda transaccional pura. (Ya identificado en tu análisis de competencia.)

---

## Prioridad 5 — Contenido (ya vas ganando, mantené el ritmo)

Tu análisis de competencia (`ANALISIS_COMPETENCIA_BLOG.md`) ya tiene la hoja de ruta. Los 3 próximos posts que más tráfico local de intención atraen:

1. **Cuánto rinde un alquiler temporario en SMA** (números reales: ocupación Chapelco, USD/noche, ROI).
2. **SMA vs. Bariloche vs. Villa la Angostura: dónde conviene comprar.**
3. **Costos reales de la operación en Neuquén** (sellos, escritura, honorarios, CDI).

El contenido trae tráfico de búsqueda informacional; la ficha + reseñas traen el tráfico local transaccional ("inmobiliaria cerca"). Necesitás los dos.

---

## Orden de ejecución sugerido

| Semana | Acción | Esfuerzo |
|---|---|---|
| 1 | Crear y verificar Google Business Profile completo + fotos | Medio, una vez |
| 1–2 | Armar link de reseña y empezar a pedirlas por WhatsApp | Bajo, continuo |
| 2 | Alta en 5–8 directorios con NAP idéntico | Medio, una vez |
| 3 | Ajustes de schema (`geo`, `openingHours`) + página tasación SEO | Bajo (código) |
| Continuo | 1 post del blog cada 2–3 semanas | Medio, recurrente |

---

## Cómo medir si funciona

- **Google Search Console:** impresiones y clics por consultas locales ("inmobiliaria san martin de los andes", etc.). Es la fuente real de cómo te ve Google.
- **Google Business Profile:** vistas de la ficha, clics a la web, clics a "cómo llegar", clics a llamar.
- **Tu panel `/admin/analytics`:** mirá si sube el canal "búsqueda orgánica" y, sobre todo, si suben las conversiones (`whatsapp_click`, `generate_lead`).

La regla: el SEO local rinde a 2–3 meses, no de un día para otro. La ficha y las reseñas dan resultado antes; el contenido, después.
