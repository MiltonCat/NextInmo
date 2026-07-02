# Estado de sesión — 2 de julio 2026

## Contexto rápido
El proyecto vive ahora en **C:\nextjs** (mudado desde OneDrive el 2/7). La copia vieja quedó como `nextjs-VIEJO` en OneDrive\Escritorio\Desarrollo\Next — borrable en unas semanas si todo sigue andando. NUNCA volver a trabajar el repo dentro de OneDrive (corrompió archivos 2 veces: footer y simulador).

## Decisión comercial del simulador (definitiva, costó varias iteraciones)
- Somos **inmobiliaria**: NO gestionamos créditos, NO armamos carpetas, NO damos asesoría financiera. No prometer nada de eso en la web, ni gratis ni pago.
- El **gancho es el número** que da el simulador (cuota, ingreso mínimo, anticipo). El CTA convierte al que le cierran los números en consulta de compra de propiedades.
- Textos vigentes: botón "¿Te cierran los números? Contanos qué buscás" + "Te mostramos propiedades compatibles con crédito hipotecario en tu presupuesto".

## Hecho hoy (commits 7558c0a y 073fca0, pusheados y deployados en Vercel)
- Textos CTA/WhatsApp/FAQ del simulador reorientados a venta de propiedades
- Fix de archivos corruptos por OneDrive (SimuladorCuota.jsx truncado, page.js con bytes nulos)
- `PLAN_LEADS_SIMULADOR.md` — plan de leads en 4 fases (Fase 1 ✅)
- `PROMPT_PROMOCION_SIMULADOR.md` — prompt mensual para generar piezas de promoción (falta completar la URL real del simulador donde dice [URL DEL SIMulador])

## Pendientes
1. **Fase 2 del plan:** SEO y distribución del gancho (simulador como CTA en posts del blog, verificar textos en fichas de propiedades)
2. **Fase 3:** captura de leads "recibí tu simulación por email" reusando api/consultas (tipo `simulacion`) + api/suscripcion
3. **Fase 4:** seguimiento por email + métricas en admin/analytics
4. **~80 archivos modificados sin commitear** de sesiones anteriores (admin, alquileres, blog) — revisar y armar commits por tema
5. Probar el prompt de promoción con datos de julio y generar el primer pack de piezas
