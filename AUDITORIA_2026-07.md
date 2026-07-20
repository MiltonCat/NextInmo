# Auditoría integral — Catalán Propiedades

**Proyecto:** catalanpropiedades.com.ar (repo `MiltonCat/NextInmo`) + Tasador (tasador-sma.vercel.app, API `modelo-predictivo-m2` en Render)
**Fecha:** 19 de julio de 2026
**Stack:** Next.js 16.2.6 (App Router, Server Actions, proxy.js), React 19, Tailwind 4, Supabase (Auth + Postgres + Storage), Vercel, Nodemailer/Gmail, EmailJS, GA4, Leaflet, Recharts.
**Estado:** Producción (sitio institucional + herramientas). Sin registro de usuarios públicos ni pagos todavía.
**Modelo previsto:** Freemium + pago.

---

## 1. Resumen ejecutivo

La web está en un estado de seguridad **muy superior al promedio** de un proyecto indie: headers A+ verificados en producción, panel admin con doble capa de protección (proxy + `requireUser()` en cada Server Action), clave secreta de Supabase solo en servidor, rate limiting y honeypots en los endpoints públicos, secretos nunca comiteados a git, y políticas de privacidad/términos reales conforme a la Ley 25.326. No se encontró ninguna vulnerabilidad crítica.

Los hallazgos son de severidad media/baja: una API key de Gemini con prefijo `NEXT_PUBLIC_` sin uso (rotar y borrar), login del admin sin rate limiting propio, subida de imágenes sin validación de tipo, y 5 dependencias con avisos (1 high en nodemailer, sin impacto práctico en tu uso).

El problema real del proyecto **no es la seguridad: es que todavía no existe el producto pago**. No hay registro de usuarios finales, ni infraestructura de suscripciones, ni una función premium definida. La buena noticia: tenés el activo que a la mayoría le falta — **datos propietarios del mercado de San Martín de los Andes** (324–1.753 propiedades relevadas, modelo predictivo propio, precio m² por barrio). Ese es exactamente el tipo de activo sobre el que Pieter Levels construyó Nomad List.

**Conclusión directa: avanzar**, con correcciones menores primero y validación de demanda antes de construir el sistema de suscripciones completo.

---

## 2. Diagnóstico general de la web

**Arquitectura observada:**

- **Público:** páginas estáticas/ISR (propiedades, alquileres, inversiones, precio-m2, blog con ~11 artículos SEO, simulador de crédito, tasación). Sin cuentas: favoritos vía localStorage (`hooks/useFavorites.js`), chatbot basado en reglas sin IA externa (`components/ChatBot.jsx` — no llama a Gemini).
- **Captura de leads:** `/api/consultas` (mini-CRM, tabla `inquiries`) y `/api/suscripcion` (tabla `subscribers` + email de bienvenida vía Gmail SMTP). Ambos con rate limit por IP, honeypot, clamp de longitudes y whitelist de campos.
- **Admin (`/admin`):** Supabase Auth email+password. Protección en dos capas: `proxy.js` (bloquea sin sesión, refresca cookies) y `requireUser()` al inicio de **cada** Server Action (`app/admin/property-actions.js:87,102,116`). ABM de propiedades, consultas, suscriptores y analytics.
- **Datos:** escrituras vía PostgREST con `SUPABASE_SECRET_KEY` solo en módulos de servidor (`lib/supabaseRest.js`, `lib/adminDb.js`); el navegador solo recibe la clave publicable.
- **Tasador:** front separado en Vercel; la API del modelo (Render) se consume server-side (`TASADOR_API_URL` sin `NEXT_PUBLIC_`, `config.js:9-11`).
- **Cron SEO:** `/api/cron/seo-radar` protegido con `CRON_SECRET` Bearer (`app/api/cron/seo-radar/route.js:7-12`).

**Verificado en producción:** securityheaders.com califica el sitio **A+** (scan del 19-jul-2026): CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.

**Git:** `.env.local` jamás fue comiteado (`git log --all -- .env.local` vacío; `.gitignore:45` cubre `.env*`).

---

## 3. Los cinco riesgos más importantes

1. **`NEXT_PUBLIC_GEMINI_API_KEY` definida sin uso** — si algún día se usa con ese prefijo, la clave viaja al navegador de cualquier visitante. Rotar y eliminar ya. (Media)
2. **Login `/admin` sin rate limiting propio ni 2FA** — `signIn` (`app/admin/actions.js:8-25`) acepta intentos ilimitados desde tu código; solo te protegen los límites internos de Supabase Auth. Es la puerta a toda tu base de leads. (Media)
3. **Dependencias con avisos** — nodemailer ≤9.0.0 (high, GHSA-p6gq-j5cr-w38f) y postcss vía next (moderate). Tu código no usa la opción `raw` vulnerable, pero conviene actualizar. (Media)
4. **`uploadImage` sin validación de tipo/tamaño** (`lib/adminDb.js:66-80`) — extensión tomada del nombre del archivo y content-type del cliente, a bucket público. Hoy solo explotable con sesión admin robada; se vuelve crítico si algún día suben archivos los usuarios. (Baja hoy, alta si se abre a usuarios)
5. **Riesgo de negocio, no técnico:** todo el circuito usuarios→suscripción→pago no existe. Cobrar hoy es imposible, no inseguro. (—)

---

## 4. Tabla completa de riesgos de seguridad

| # | Riesgo | Evidencia | Escenario | Prob. | Impacto | Severidad | Solución | Dificultad | Prioridad |
|---|--------|-----------|-----------|-------|---------|-----------|----------|-----------|-----------|
| S1 | API key Gemini con prefijo público, sin uso en el código | `.env.local` define `NEXT_PUBLIC_GEMINI_API_KEY`; `grep GEMINI` en app/components/lib no devuelve nada | Si se usa en un componente cliente, cualquiera la extrae del bundle y consume tu cuota / factura | Media | Medio | **Media** | Rotar la clave en Google AI Studio y borrar la variable (o renombrar sin `NEXT_PUBLIC_` y usar solo server-side) | Trivial | Ya |
| S2 | Fuerza bruta / credential stuffing en login admin | `app/admin/actions.js:8-25` — `signInWithPassword` sin `rateLimit()` | Bot prueba contraseñas filtradas contra tu email hasta entrar al CRM con todos los leads | Media | Alto | **Media** | Reusar `lib/rateLimit.js` en `signIn` (5 intentos/15 min por IP) + contraseña larga + activar MFA/TOTP de Supabase Auth | Baja | 7 días |
| S3 | Dependencias vulnerables | `npm audit --omit=dev`: nodemailer ≤9.0.0 high; postcss <8.5.10 moderate vía next 16.2.6 | El advisory de nodemailer requiere la opción `raw` que `lib/emailBienvenida.js` no usa; riesgo práctico bajo pero la ventana existe | Baja | Medio | **Media** | `npm i nodemailer@9 next@16.2.10` + probar el email de bienvenida | Baja | 7 días |
| S4 | Subida de imágenes sin validación | `lib/adminDb.js:66-80` — sin whitelist de extensión/MIME, sin límite por archivo (solo 25 MB global, `next.config.mjs` serverActions) | Con una sesión admin comprometida se sube un SVG con script al bucket público (XSS servido desde supabase.co) | Baja | Medio | **Baja** | Whitelist `jpg/png/webp`, límite ~10 MB, reencodar con `sharp` (ya es dependencia) | Baja | 30 días |
| S5 | Rate limit en memoria por instancia serverless | `lib/rateLimit.js:1-6` (limitación documentada por vos mismo) | Bot distribuido u oleada de cold starts multiplica el límite efectivo; spam de leads/emails | Media | Bajo | **Baja** | Aceptable hoy. Si hay spam real: Upstash Redis o Vercel Firewall | Media | Cuando duela |
| S6 | CSP sin `script-src` | `next.config.mjs` headers (decisión documentada) | Un XSS que lograra inyectarse no sería frenado por CSP | Baja | Medio | **Baja** | Endurecer con nonces cuando haya área de usuarios pagos | Media | 90 días |
| S7 | Suscripción sin doble opt-in | `app/api/suscripcion/route.js:40-56` — alta directa + email de bienvenida | Cualquiera suscribe el email de un tercero; spam desde tu Gmail daña reputación del remitente | Media | Bajo | **Baja** | Email de confirmación con token antes de activar (o al menos link de baja firmado) | Media | 30–90 días |
| S8 | `/api/consultas` devuelve `ok:true` ante error de DB | `app/api/consultas/route.js:49-53` | Leads que se pierden en silencio si Supabase falla (operacional, no seguridad) | Baja | Medio | **Info** | Alerta (email/Telegram) cuando `insertInquiry` lanza | Baja | 30 días |
| S9 | CSRF en APIs públicas | Sin token CSRF; mitigado: CSP `form-action 'self'`, Server Actions con check de Origin de Next, y las APIs solo insertan leads | Un tercero hace POST cross-site e inserta un lead falso | Media | Muy bajo | **Info** | Nada urgente; verificar header Origin si se agregan APIs con efectos mayores | Baja | — |
| S10 | Enumeración de usuarios | `signIn` devuelve mensaje genérico (`actions.js:21`); `/api/suscripcion` responde igual exista o no el email | — | — | — | **OK** | — | — | — |
| S11 | Secretos en git | `git log --all -- .env.local` vacío; `.gitignore:45` | — | — | — | **OK** | — | — | — |
| S12 | Cron sin auth | `seo-radar/route.js:7-12` exige `Bearer CRON_SECRET` | — | — | — | **OK** | — | — | — |
| S13 | XSS por `dangerouslySetInnerHTML` | Todos los usos son JSON-LD estáticos generados por vos (`grep` en app/) | — | — | — | **OK** | — | — | — |

**Backups:** Supabase free hace backups diarios con retención corta. Agregar un `pg_dump` semanal automatizado de `inquiries`/`subscribers`/`properties` (media prioridad — es tu CRM entero).

---

## 5. Preparación para usuarios, pagos y suscripciones

**Hoy: no estás listo, y está bien — todavía no hay nada que cobrar.** Lo importante es el orden correcto:

**Antes de abrir registro de usuarios finales:**
- Reusar Supabase Auth (ya integrado) con un flujo `signUp` público separado del admin, con verificación de email obligatoria.
- **RLS es la clave:** las tablas nuevas de usuarios deben tener Row Level Security que garantice `user_id = auth.uid()`. Nunca reusar el patrón `SUPABASE_SECRET_KEY` de las rutas admin para datos de usuarios.
- Rate limit en signup/login, política de contraseñas de Supabase, y el S2 resuelto.

**Antes de cobrar (elección de proveedor para Argentina):**
- **Stripe no opera para cobrar desde Argentina.** Opciones reales: **Mercado Pago Suscripciones (preapproval)** para cobrar en ARS al público local, o un *merchant of record* (Lemon Squeezy, Paddle) si querés cobrar en USD a compradores del exterior (tu público de inversores de Buenos Aires/exterior lo justificaría). Mucho de lo que leas sobre "Stripe + webhooks" aplica igual conceptualmente a Mercado Pago.
- Reglas no negociables: nunca tocar datos de tarjeta (siempre checkout del proveedor); validar la **firma de los webhooks**; procesar webhooks con **idempotencia** (guardar `event_id` procesados); el acceso premium se decide **server-side leyendo el estado real de la suscripción en tu DB**, nunca por un flag del frontend ni por el precio que envía el cliente (el precio vive en el servidor/proveedor, jamás en un input).
- Estados mínimos en tu tabla `subscriptions`: `trialing / active / past_due / canceled / expired`, con período de gracia para pagos rechazados (Mercado Pago reintenta solo).
- Conciliación: un cron diario que compare tu DB contra la API del proveedor y loguee divergencias.

**Flujo seguro propuesto:** registro → email verificado → checkout del proveedor (precio definido server-side) → webhook firmado e idempotente actualiza `subscriptions` → gate server-side en cada página/API premium → renovación automática vía webhook → `past_due` con gracia de 3–5 días y aviso → cancelación desde el propio panel (autoservicio, sin fricción) → acceso hasta fin del período pagado.

---

## 6. Problemas de confianza y conversión

Lo fuerte (mantener): identidad real y verificable (Milton Catalán, LinkedIn, Instagram, WhatsApp, horarios), políticas de privacidad y términos reales y bien escritos, datos concretos (1.753 propiedades, operaciones cerradas con años y montos), tasador sin registro previo, simulador gratis "sin registrarte". Es un sitio que transmite un negocio real — eso ya lo pone por encima del 90% de las inmobiliarias de la zona.

Problemas concretos, por impacto:

1. **El tasador vive en `tasador-sma.vercel.app`** — un dominio gratuito de Vercel resta seriedad justo en el momento de mayor intención (alguien por contarte cuánto vale su casa). Ya lo tenés anotado en `config.js:7`: crear el DNS `tasador.catalanpropiedades.com.ar`. Es la mejora de confianza más barata disponible.
2. **Números inconsistentes entre páginas:** la home dice "1.753 propiedades relevadas" y "analizamos 324 propiedades" en el email de bienvenida (`lib/emailBienvenida.js:37`), el tasador muestra "342 propiedades". Un visitante atento lo nota y duda de todos los demás números. Unificar (o etiquetar: "1.753 relevadas, 342 usadas por el modelo").
3. **"Error promedio 16.1%"** en el hero del tasador: honesto, pero un 16% "de error" asusta antes de empezar. Reformular como rango: "la estimación cae dentro de ±16% del valor de venta — te damos el rango completo".
4. **Emails desde `@gmail.com`** (`ventascatalanprop@gmail.com`): para leads está bien, para cobrar suscripciones no. Configurar email con dominio propio (Google Workspace o Resend con SPF/DKIM) antes de cualquier cobro.
5. **Sin testimonios con nombre y cara.** Tenés operaciones cerradas reales; pedí a 3–4 clientes una frase con nombre y foto (o captura de Google Reviews). Prueba social > métricas propias.
6. **"ROI promedio gestionado +18%"** sin metodología visible: o se explica en un link ("cómo lo calculamos"), o se baja. Un inversor sofisticado desconfía de un número redondo sin fuente.
7. **Falta FAQ en /tasacion y /vender** sobre lo que la gente realmente pregunta (¿cuánto cobra la inmobiliaria?, ¿exclusividad?, ¿cuánto tarda?). Cada pregunta sin responder es un WhatsApp que no llega.

---

## 7. Investigación: Pieter Levels y sus negocios

> ⚠️ **Advertencia global:** prácticamente todas las cifras de Levels son **autodeclaradas por él** (en su X, sus dashboards "Open Startup" o entrevistas) y **no están auditadas de forma independiente**. Se listan con esa reserva.

**Quién es:** desarrollador holandés autodidacta, lanzó 70+ productos de los cuales ~4-5 generan casi todos los ingresos, sin empleados ni inversores. Se hizo conocido con el reto "12 startups in 12 months" (2014): un lanzamiento por mes, cobrando con Stripe desde el día uno ([entrevista Lex Fridman #440, ago-2024](https://lexfridman.com/pieter-levels/); [transcript](https://lexfridman.com/pieter-levels-transcript/)).

**Productos principales:**

| Producto | Qué resuelve | Modelo | Cifra declarada | Fuente/fecha |
|---|---|---|---|---|
| **Nomad List** (2014) | Elegir ciudad para trabajar remoto (costo, clima, internet, seguridad) | Membresía; histórico ~$99 lifetime, hoy planes anuales/lifetime | Pionero del "Open Startup" (métricas públicas, [anuncio feb-2018](https://x.com/levelsio/status/968219339588493312)). Cifras de terceros como [Getlatka "5.3M ARR 2024"](https://getlatka.com/companies/nomad-list) son estimaciones no confiables | levels.io; dato no auditado |
| **Remote OK** (2015) | Job board de trabajo remoto | Cobra a empresas por publicar (~$300+/aviso); gratis para candidatos | ~$26k/mes citado por fuentes secundarias ([FastSaaS, s/f](https://www.fast-saas.com/blog/pieter-levels-success-story/)) | No auditado |
| **Photo AI** (2022) | Fotos profesionales con IA (entrenás un modelo con tus selfies) | Suscripción, plan Pro ~$29/mes | >$100k/mes pocos meses post-lanzamiento (declarado por él); ~$132k/mes según [PPC Land](https://ppc.land/how-one-photo-ai-app-generates-132k-monthly-after-70-failed-startups/) | Autodeclarado |
| **Interior AI** (2022) | Rediseño de interiores con IA | Suscripción | Parte del portfolio ~$200k/mes combinado (fuentes secundarias, 2023-24) | No auditado |
| **fly.pieter.com** (feb-2025) | Simulador de vuelo MMO en el navegador, "vibe-coded" con IA en 3 horas | Free-to-play + sponsors in-game | "$1M ARR (~$87k MRR) en 17 días" declarado por él ([levels.io, 2025](https://levels.io/fly-pieter-com-vibecoded-flight-simulator)); ~$50-70k/mes según [404 Media](https://www.404media.co/this-game-created-by-ai-vibe-coding-makes-50-000-a-month-yours-probably-wont/) que además advierte: funcionó por su audiencia de 10 años, el tuyo probablemente no | Autodeclarado; contexto crítico en 404 Media |

**Cómo trabaja (lo verificable en sus propias publicaciones y entrevistas):**
- **Valida cobrando**, no preguntando: lanza en días, con Stripe conectado desde el primer día. Si nadie paga en semanas, lo mata. De 70+ lanzamientos, la enorme mayoría murió ([Lex #440](https://lexfridman.com/pieter-levels/)).
- **Primeros usuarios:** comunidades existentes (Hacker News, Product Hunt, Twitter/X, Reddit) + lanzar como historia pública ("estoy construyendo esto en vivo").
- **SEO programático:** Nomad List genera miles de páginas desde su base de datos (una por ciudad, por par de ciudades, por criterio). El contenido lo generan los datos, no un redactor.
- **UGC y comunidad:** los propios nómadas cargan reviews y datos; el chat de Slack/Discord de Nomad List es el moat — eso sí genera network effects difíciles de copiar.
- **Automatización extrema:** sin empleados; bots para moderación, cobros, refunds automáticos dentro de la garantía; costos operativos mínimos.
- **Precios simples:** un plan o dos, sin enterprise, lifetime deals para generar caja temprana.
- **No paga publicidad:** distribución = marca personal (2M+ seguidores en X) + SEO + boca a boca.
- **Build in public:** compartir métricas reales genera confianza y prensa gratis.

**Qué NO es replicable:** su audiencia de una década (el retuit de Musk que viralizó fly.pieter.com no le pasa a nadie más), y su tolerancia a lanzar 65 fracasos públicos antes de los éxitos.

---

## 8. Principios transferibles (destilados)

1. Cobrar es la única validación. 2. Lanzar en semanas, no meses. 3. Nicho concreto y con dolor real. 4. Los datos propios son el moat — el software es commodity. 5. SEO programático sobre esos datos. 6. Dejar que los usuarios generen contenido. 7. Automatizar todo lo repetitivo. 8. Precios simples. 9. Construir en público con tu nombre real. 10. Matar rápido lo que no funciona.

---

## 9. Comparación directa con tu proyecto

| Principio Levels | Cómo lo aplicó él | Aplicación a Catalán Propiedades | Qué NO copiar | Métrica de control |
|---|---|---|---|---|
| Datos propios como moat | Nomad List: base de datos de ciudades que nadie más tenía | **Ya lo tenés**: 1.753 propiedades relevadas + modelo predictivo + precio m²/barrio de SMA. Nadie más en la zona tiene esto | — | # de páginas indexadas que solo vos podés generar |
| SEO programático | Miles de páginas por ciudad generadas de la DB | Una página por barrio: "Precio del m² en [barrio] 2026", "¿Cuánto vale una casa en [barrio]?" — 38 barrios × 2-3 plantillas = ~100 páginas desde tus datos, actualizadas por ISR | Generar páginas basura sin datos reales (Google lo penaliza) | Clicks orgánicos no-marca en Search Console |
| Validar cobrando | Stripe día 1, matar lo que no vende | Antes de construir suscripciones: vender 10 **informes premium** cobrados a mano (Mercado Pago link de pago) | Construir 3 meses de infraestructura de pagos antes de la primera venta | 10 ventas en 30 días = validado |
| Nicho concreto | Nómadas digitales, no "viajeros" | Tu nicho no es "el que quiere tasar": es **el inversor de afuera que quiere comprar en SMA con datos** y **el propietario que quiere vender bien** | Intentar ser portal nacional (Zonaprop ya existe) | % de leads de fuera de SMA |
| UGC / comunidad | Reviews de nómadas | Ya arrancaste: "Compartí tu barrio" (`/experiencia-barrio`). Publicar cada testimonio como página indexable por barrio | Foro/comunidad genérica (no hay masa crítica local) | Testimonios publicados/mes |
| Build in public | Métricas públicas, historia en X | Versión local: "el corredor que muestra los datos" — publicar el índice trimestral del m² en SMA con tu nombre; LinkedIn + Instagram + prensa regional | Exponer ingresos de la inmobiliaria (mercado chico, te lee la competencia) | Menciones/backlinks; suscriptores del informe |
| Automatización | Bots para todo | Ya tenés: tasador automático, email de bienvenida, cron SEO. Falta: informe PDF automático post-tasación, secuencia de 3 emails por interés | — | Leads atendidos sin intervención manual |
| Precios simples | 1-2 planes, lifetime | Un solo precio por informe; una sola suscripción si valida | Matriz de 4 planes × features | Conversión checkout |
| Global vs local | Productos globales en inglés | Tu ventaja es la inversa: **hiperlocal indefendible desde afuera**. Profundizar SMA antes que expandir | Saltar a 10 ciudades antes de dominar una | Share de búsquedas "inmobiliaria SMA" |
| Marca personal | 2M seguidores | "Milton Catalán, el que tasa con datos" en un mercado donde nadie lo hace. Escala local alcanzable | Esperar el retuit de Musk | Seguidores locales / consultas que te nombran |

---

## 10. La estrategia que yo implementaría

**Posicionamiento:** "La única inmobiliaria de San Martín de los Andes que tasa, publica y asesora con datos reales del mercado — y los muestra."

**Insight central:** tu producto pago NO compite con Zonaprop ni es un SaaS masivo. El mercado de SMA es chico; el valor está en que **cada lead vale muchísimo** (una comisión de venta = años de suscripciones). Por eso el modelo correcto es un **híbrido**: las herramientas gratis alimentan la inmobiliaria (donde está la plata grande), y una capa premium de **informes y datos para inversores/propietarios** monetiza a los que nunca van a operar con vos, valida disposición a pagar, y te construye autoridad.

- **Función central por la que pagarían:** el **Informe Premium de Propiedad/Inversión** (PDF automático): valuación con rango, comparables reales, precio m² del barrio y evolución, proyección a 3 años, score de inversión, renta esperada tradicional y temporaria. Precio único simple: **USD 15–25 (o equivalente ARS)**. Costo marginal ≈ 0 (todo ya existe: modelo, datos, generación).
- **Gratis (freemium):** tasación instantánea con rango amplio + páginas de barrio + newsletter. El gratis captura el lead; el pago captura al analítico.
- **Postergar/descartar:** cuentas de usuario con panel propio (no hacen falta para vender informes), app móvil, chat con IA, expansión multi-ciudad, comunidad.
- **Primeros 10 pagos:** ofrecérselo a mano a los leads recientes del tasador (ya tenés la tabla `subscribers` con `source=tasador`) con un link de pago de Mercado Pago. Sin código nuevo.
- **Primeros 100:** upsell automático post-tasación ("tu informe completo por $X") + páginas de barrio con CTA + newsletter mensual del mercado.
- **Retención/recurrencia:** la suscripción llega después, y es el **Informe Trimestral del Mercado SMA** para inversores (el índice que nadie más puede armar) — recurrencia natural sin necesidad de engagement diario.

## 11. Tres escenarios

| | 1. Conservador | 2. Equilibrado ★ recomendado | 3. Ambicioso |
|---|---|---|---|
| Qué | Solo lead-gen mejorado: subdominio tasador, páginas de barrio, newsletter. Sin cobros online | Todo lo anterior + informe premium pago único (Mercado Pago) + upsell post-tasación | Todo lo anterior + suscripción trimestral inversores + tasador white-label/API para inmobiliarias de otras ciudades patagónicas |
| Inversión | ~0 USD, 2-3 semanas de trabajo | ~0-100 USD, 4-6 semanas | Meses de desarrollo + ventas B2B |
| Riesgo | Nulo, pero no valida pago | Bajo; valida disposición a pagar real | Alto; mercado B2B chico y lento |
| Resultado esperado | Más leads (la comisión paga todo) | Leads + primeros ingresos digitales + validación | Ingreso recurrente escalable si funciona |

**Recomendación: el equilibrado.** Es el único que responde la pregunta que importa ("¿alguien paga por mis datos?") sin apostar meses. El conservador no aprende nada nuevo; el ambicioso construye sobre una hipótesis sin validar. Si el equilibrado vende bien, el ambicioso se financia solo.

---

## 12. Plan priorizado

**Próximas 48 horas** (esfuerzo bajo, hacer ya):
- [ ] Rotar/eliminar `NEXT_PUBLIC_GEMINI_API_KEY` (S1). *Riesgo de no hacerlo: cuenta facturada a tu nombre.*
- [ ] `npm i next@16.2.10 nodemailer@9` + smoke test (S3).
- [ ] Crear DNS `tasador.catalanpropiedades.com.ar` en WNPower → dominio custom en Vercel (confianza #1).
- [ ] Unificar los números (1.753 / 342 / 324) en home, tasador y emails.

**Próximos 7 días:**
- [ ] Rate limit + lockout en `signIn` del admin, activar MFA en Supabase (S2).
- [ ] Reformular "error 16.1%" como rango de confianza en el tasador.
- [ ] Pedir 3-4 testimonios reales con nombre (o Google Reviews) y publicarlos.
- [ ] Elegir proveedor de cobro (Mercado Pago vs Lemon Squeezy) y crear un link de pago manual del informe premium.

**Próximos 30 días** (validación):
- [ ] **Experimento central:** ofrecer el informe premium a mano a los últimos 50-100 leads del tasador. Meta: 10 ventas. Métrica: conversión ≥5% = construir; <2% = repensar precio/propuesta.
- [ ] Generar las ~100 páginas de barrio programáticas desde tus datos (plantilla + ISR).
- [ ] Whitelist + reencodado en `uploadImage` (S4); alerta cuando `insertInquiry` falla (S8).
- [ ] Backup semanal automatizado de `inquiries`/`subscribers`/`properties`.
- [ ] FAQ en /vender y /tasacion; email con dominio propio (SPF/DKIM).

**Próximos 90 días** (si validó):
- [ ] Automatizar el informe premium: pago → webhook firmado e idempotente → PDF generado → email. Tabla `purchases` con estados.
- [ ] Doble opt-in de suscriptores (S7) + secuencia de emails por interés.
- [ ] Newsletter/informe trimestral del mercado SMA (embrión de la suscripción).
- [ ] CSP con `script-src` + nonces (S6).

**Etapa de crecimiento:** suscripción trimestral inversores → si tracciona, evaluar white-label del tasador para inmobiliarias de Bariloche/Villa La Angostura (ya tenés modelo "bariloche" cargado en la API).

## 13. Métricas recomendadas

Embudo (medir en GA4, ya instalado): visitas → tasaciones completadas → % que deja email → % que compra informe → % que agenda tasación presencial → operaciones. Más: clicks orgánicos no-marca (Search Console, ya integrado en tu admin), suscriptores netos/mes, ventas de informes/mes, CAC = $0 (orgánico) como restricción de diseño, y tasa de respuesta de leads <1h (el lead inmobiliario se enfría en horas).

## 14. Conclusión

**Avanzar.** La base técnica es sólida y no hay bloqueantes de seguridad; las correcciones son menores y rápidas. El paso crítico no es técnico: es validar con dinero real que tus datos valen un pago, antes de construir la infraestructura de suscripciones.

## 15. Fuentes consultadas

- Evidencia local: repo `MiltonCat/NextInmo` (archivos citados en cada hallazgo), `npm audit`, `git log`, [scan securityheaders.com A+ (19-jul-2026)](https://securityheaders.com/?q=https%3A%2F%2Fcatalanpropiedades.com.ar%2F&followRedirects=on), sitio en vivo y tasador.
- [Lex Fridman Podcast #440 — Pieter Levels (20-ago-2024)](https://lexfridman.com/pieter-levels/) y [transcript](https://lexfridman.com/pieter-levels-transcript/).
- [levels.io — fly.pieter.com, "$1M ARR en 17 días" (2025, autodeclarado)](https://levels.io/fly-pieter-com-vibecoded-flight-simulator) · [levels.io — Nomad List founder](https://levels.io/nomad-list-founder).
- [404 Media — crítica del caso fly.pieter.com (2025)](https://www.404media.co/this-game-created-by-ai-vibe-coding-makes-50-000-a-month-yours-probably-wont/).
- [Anuncio Open Startup de Nomad List (feb-2018)](https://x.com/levelsio/status/968219339588493312).
- Cifras secundarias no auditadas: [PPC Land — Photo AI ~$132k/mes](https://ppc.land/how-one-photo-ai-app-generates-132k-monthly-after-70-failed-startups/), [FastSaaS](https://www.fast-saas.com/blog/pieter-levels-success-story/), [Getlatka (estimación dudosa)](https://getlatka.com/companies/nomad-list), [hilo de Julian Ivaldy sobre los 70+ lanzamientos (sep-2023)](https://x.com/julianivaldy/status/1705224483441643596).

---

## Respuestas directas

**¿Es seguro registrar usuarios hoy?** El admin, sí (con S2 pendiente). Usuarios públicos: el registro no existe aún; la base (Supabase Auth) es apta, pero antes de abrirlo hacen falta S2, verificación de email y RLS en las tablas nuevas.

**¿Es seguro cobrar suscripciones hoy?** No, porque no existe el circuito — no por vulnerabilidades. Con checkout externo (link de pago de Mercado Pago) podés cobrar informes **ya**, sin tocar tu código ni tarjetas.

**¿El riesgo más grave?** La clave Gemini pública sin rotar (técnico) y, como negocio, invertir en infraestructura de suscripciones antes de validar que alguien paga.

**¿La corrección más urgente?** Rotar/borrar `NEXT_PUBLIC_GEMINI_API_KEY` + actualizar next/nodemailer. 30 minutos en total.

**¿Por qué alguien pagaría?** Porque sos el único con datos reales y un modelo predictivo del mercado de SMA: un informe que reduce el miedo a pagar de más (comprador/inversor) o a malvender (propietario) en operaciones de cientos de miles de dólares. USD 20 contra ese riesgo es trivial.

**¿Qué parte del enfoque de Levels tiene mayor potencial acá?** SEO programático sobre tus datos propios (las páginas de barrio) + validar cobrando antes de construir. Su moat fue una base de datos única de ciudades; el tuyo es una base de datos única de un mercado inmobiliario que nadie más midió.

**¿Qué haría primero como fundador?** El subdominio del tasador (48 h) y, en la misma semana, ofrecer el informe premium a mano a los leads existentes con un link de pago. Cero código, validación inmediata.

**¿El próximo experimento comercial?** Informe premium a USD 15-25, ofrecido a los últimos 100 leads del tasador durante 30 días. ≥10 ventas: automatizar. 2-9: ajustar precio/contenido. <2: los datos valen como lead-gen, no como producto — volcar todo al escenario conservador.
