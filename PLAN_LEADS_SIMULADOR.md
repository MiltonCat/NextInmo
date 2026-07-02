# Plan de generación de leads — Simulador de crédito

**Modelo definitivo:** somos una **inmobiliaria** — el servicio es la venta de propiedades. El gancho es **el número** que da el simulador (cuota, ingreso mínimo, anticipo necesario): la web lo calcula sola, sin regalar tiempo, sin prometer trámites ni asesorías. Quien simula y ve que le alcanza, el paso natural es buscar la propiedad — y ahí entra la inmobiliaria.

**Lógica:** la persona llega buscando saber si le alcanza. El simulador se lo responde gratis porque es software. Si el número le cierra, su siguiente problema es encontrar propiedad — el CTA lo lleva directo a eso.

---

## Fase 1 — Textos del simulador ✅ (aplicado 02/07/2026)

- **Botón:** "¿Te cierran los números? Contanos qué buscás"
- **Subtexto:** "Te mostramos propiedades compatibles con crédito hipotecario en tu presupuesto."
- **WhatsApp:** llega con los números simulados + "Estoy buscando propiedad para comprar con crédito, ¿qué opciones tienen?" (o "¿Sigue disponible?" si simuló desde una ficha)
- **FAQ:** "te orientamos para que la propiedad que elijas sea compatible con tu crédito" — rol de inmobiliaria, sin prometer trámites.

## Fase 2 — SEO y distribución del gancho

- El simulador como CTA en cada post del blog de crédito (ya existen y traen tráfico).
- Simulador embebido en las fichas de propiedades (ya existe en fichas — verificar que use estos mismos textos).
- Contenido mensual cuando el BCRA actualiza tasas: excusa recurrente para redes y para recontactar leads.

## Fase 3 — Captura de datos en la web

Para el que simula pero no escribe (la mayoría):

- **"Recibí tu simulación por email":** desglose completo + requisitos por banco, a cambio de nombre + email + WhatsApp. Sigue siendo el número como gancho — solo que documentado, sin prometer asesoría.
- Guardar como consulta (`api/consultas`, tipo `simulacion`) con los parámetros: en el admin ves el presupuesto de cada lead.
- WhatsApp directo siempre sin formulario adelante (lead caliente, cero fricción).
- Checkbox opcional de suscripción (`api/suscripcion`) para avisos de cambios de tasas.

## Fase 4 — Seguimiento y medición

- Email automático al que pidió su simulación; recordatorio a los 4-5 días.
- Recontacto mensual legítimo: el BCRA actualiza la comparativa de tasas todos los meses ("cambiaron las tasas, ¿actualizamos tus números?").
- **Métricas en admin/analytics:** simulaciones → % clic WhatsApp → % que deja email → gestiones contratadas. Meta inicial: 10% de los que simulan dejan contacto.
- **Difusión:** simulador como CTA en los posts del blog de crédito, y contenido mensual cuando cambian las tasas.

---

## Orden de implementación

| # | Qué | Estado |
|---|-----|--------|
| 1 | Textos CTA orientados al servicio de gestión | ✅ Hecho |
| 2 | Precio + página /gestion-credito | Pendiente (falta definir precio) |
| 3 | Formulario "recibí tu simulación" → api/consultas | Pendiente |
| 4 | Seguimiento + métricas | Pendiente |
