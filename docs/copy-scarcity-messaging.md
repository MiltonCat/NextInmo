# Scarcity Messaging: Cambios de Copy
## Antes vs Después (Alto Impacto, Cero Código)

---

## 1️⃣ HERO SECTION (`components/Hero.jsx`)

### ANTES:
```jsx
<h1 className="...">
  Inmobiliaria en San Martín de los Andes
</h1>
<p className="...">
  Compra, alquiler e inversión con asesoría local.
</p>
```

### DESPUÉS (v1 - Datos):
```jsx
<h1 className="...">
  14 propiedades disponibles en San Martín de los Andes
</h1>
<p className="...">
  Compra, alquiler e inversión con datos reales. 3 se vendieron este mes.
</p>
```

**Por qué:** Números concretos activan más que promesas genéricas.
- "14 propiedades" = hay inventory
- "3 se vendieron" = FOMO, urgencia

---

### DESPUÉS (v2 - Más Agresivo):
```jsx
<h1 className="...">
  Compra donde otros invierten: +18% ROI en San Martín
</h1>
<p className="...">
  14 propiedades disponibles. 47 vecinos confían en nuestro asesoramiento.
</p>
```

**Por qué:** 
- Headline = promesa de resultado
- Copy = social proof + número de propiedades

---

### DESPUÉS (v3 - Balanceado):
```jsx
<h1 className="...">
  Propiedades en San Martín de los Andes desde $200K
</h1>
<p className="...">
  14 opciones disponibles. Asesoramiento local + datos reales de mercado.
</p>
```

**Por qué:** 
- Precio genera curiosidad + filtering (qué pueden permitirse)
- "14 opciones" = cantidad clara
- "Local + datos" = diferenciador

---

## 2️⃣ SUSCRIPCIÓN FORM (`components/SuscripcionForm.jsx`)

### ANTES:
```jsx
Avisame primero
```

Button copy: genérico.

---

### DESPUÉS:
```jsx
// Button text options (elige uno):
// Opción 1 - Urgencia moderada:
Avisame cuando entre una nueva

// Opción 2 - FOMO:
Quiero ser el 1º en saber

// Opción 3 - Posesión:
Guardar mis intereses
```

---

### ANTES (success message):
```jsx
Vas a ser de los primeros en enterarte cuando entre una propiedad nueva en San Martín de los Andes.
```

### DESPUÉS (success message):
```jsx
// Opción 1 - Urgencia:
¡Listo! Te notificamos apenas entre una propiedad nueva en {interes || "tu área de interés"}. Suelen salirse en 48 horas.

// Opción 2 - Pertenencia:
¡Listo! Sos parte de {nombre}. Vas a ser de los primeros en ver nuevas propiedades.

// Opción 3 - Datos + Seguridad:
✅ Confirmado. Email + {interes}. Te escribimos solo cuando es relevante (max 1x por semana).
```

---

### ANTES (helper text):
```jsx
Solo te escribimos cuando hay algo que te puede interesar. Cero spam.
```

### DESPUÉS:
```jsx
// Opción 1 - Trust:
Datos privados. 1-2 emails/semana si hay propiedad en tu rango. Cancelar en cualquier momento.

// Opción 2 - Utility:
Recibirás: nuevas propiedades + precio-mercado + opiniones de vecinos. Cero spam.

// Opción 3 - Concise:
Propiedad nueva en tu perfil = 1 email. Nada más.
```

---

## 3️⃣ METADATA EN `app/page.js`

### ANTES:
```js
title: "Inmobiliaria en San Martín de los Andes | Catalán Propiedades"
description: "Inmobiliaria en San Martín de los Andes con +10 años de trayectoria y martillera matriculada. Casas, departamentos, monoambientes y lotes en venta y alquiler permanente, con asesoría local y datos reales del mercado."
```

### DESPUÉS:
```js
// Opción 1 - Números:
title: "14 Propiedades en Venta en San Martín de los Andes | Catalán Propiedades"
description: "Compra o invierte en San Martín: 14 propiedades disponibles, +18% ROI gestionados. Asesoramiento local + datos de mercado. 10+ años en la zona."

// Opción 2 - Urgency + Trust:
title: "Propiedades en San Martín de los Andes — Compra, Alquiler e Inversión"
description: "Inmobiliaria con 10+ años. 14 propiedades disponibles, 3 vendidas este mes. Asesoramiento local + martillera matriculada. Datos reales del mercado."
```

---

## 4️⃣ OPCIÓN INTENTS EN HOMEPAGE (`app/page.js`)

### ANTES:
```jsx
{
  title: "Quiero comprar",
  description: "Explorá propiedades disponibles y encontrá opciones según tu búsqueda.",
  action: "Ver propiedades",
}
```

### DESPUÉS:
```jsx
// Opción 1 - Números:
{
  title: "Quiero comprar",
  description: "14 propiedades disponibles. Desde $200K. Asesoramiento local.",
  action: "Ver las 14 propiedades",
}

// Opción 2 - FOMO:
{
  title: "Quiero comprar",
  description: "Nuevas propiedades cada semana. 3 se vendieron este mes.",
  action: "Buscar ahora",
}
```

---

### ANTES:
```jsx
{
  title: "Quiero invertir",
  description: "Analizá oportunidades, zonas y escenarios con datos del mercado local.",
  action: "Analizar inversiones",
}
```

### DESPUÉS:
```jsx
{
  title: "Quiero invertir",
  description: "Rentabilidad verificada: +18% ROI. 47 inversores confían en nosotros.",
  action: "Ver oportunidades",
}
```

---

## 5️⃣ PROPIEDADES CARD (Si existe `components/PropertyCard.jsx`)

### ANTES:
```
[Foto]
Casa en Centro
$450.000
3 ambientes
```

### DESPUÉS:
```
[Foto]
Casa en Centro — DISPONIBLE HACE 8 DÍAS
$450.000 | 3 amb | ❤️ 23
VER DETALLES →

// O más agresivo:
Casa en Centro
⚡ Visto 156 veces este mes
$450.000 | 3 amb | ❤️ 23
```

**Qué agrega:**
- "DISPONIBLE HACE 8 DÍAS" = scarcity implícita
- "Visto 156 veces" = social proof
- "❤️ 23" = favoritos públicos

---

## 6️⃣ PÁGINA DE PROPIEDADES (`app/propiedades/page.js` - metadata)

### ANTES:
```js
title: "Propiedades en Venta y Alquiler en San Martín de los Andes"
description: "Casas, departamentos y lotes en San Martín de los Andes. Alquiler permanente y en venta."
```

### DESPUÉS:
```js
title: "14 Propiedades en San Martín de los Andes | Venta, Alquiler, Inversión"
description: "14 propiedades disponibles ahora. Asesoramiento local, 10+ años. Desde $200K. Recibirás alertas cuando haya nueva."
```

---

## 7️⃣ EMAIL SIGNATURE / CTA FOOTER

### ANTES:
```
¿Preguntas? Contactanos
```

### DESPUÉS:
```
Hace 3 personas compraron este mes. ¿Hablamos? →
```

---

## 📋 RESUMEN DE CAMBIOS (Copy Only)

| Sección | Antes | Después | Ganancia |
|---------|-------|---------|----------|
| Hero Title | "Inmobiliaria en San Martín" | "14 propiedades disponibles" | Específico + Urgencia |
| Hero Subtitle | "Asesoría local" | "14 opciones. 3 se vendieron." | Números = Credibilidad |
| Button | "Ver propiedades" | "Ver las 14 propiedades" | Cantidad visible |
| Success | Generic | "Suelen salirse en 48 horas" | FOMO |
| Meta Title | Generic | Incluye número + ROI | SEO + Trust |
| Card Badge | — | "Visto 156 veces" | Social proof |
| Invest CTA | Generic | "+18% ROI. 47 inversores" | Specific + Social proof |

---

## ⚠️ Consideraciones Importantes

### ✅ SÍ cambiar:
- Títulos genéricos → números concretos
- Copy neutral → urgencia + social proof
- Botones vagos → específicos ("Ver 14 propiedades")

### ❌ NO cambiar:
- Datos falsos (si no tienes 14, no digas 14)
- Urgencia artificial ("últimas 2 disponibles" si hay 50)
- Fake testimonials

**Regla:** Solo números que puedas comprobar. El trust es más valioso que el click corto.

---

## 🚀 Cómo Implementar

### Paso 1: Contar números reales
```js
// En tu DB/API:
const totalPropiedades = await property.count();
const propiedadesVendidasEsteMes = await property.count({
  where: { 
    status: 'vendida',
    soldAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }
});
const favoritos = await favorites.count();
const investorsCount = 47; // si lo trackeas
```

### Paso 2: Usar en JSX
```jsx
<h1>
  {totalPropiedades} propiedades disponibles en San Martín de los Andes
</h1>
<p>
  {propiedadesVendidasEsteMes} se vendieron este mes.
</p>
```

### Paso 3: A/B Test
Cambiar título un día, ver si CTR sube en analytics.

---

## 📊 Métrica a Trackear

**Antes de implementar:**
- CTR en "Ver propiedades" (baseline)
- % de suscriptores que abren email
- % que hizo click en email

**Después de implementar (1 semana):**
- ¿CTR subió?
- ¿Más suscriptores?
- ¿Más tiempo en sitio?

---

## 🎯 Quick Start: Top 3 Cambios (Hoy)

Si solo podes hacer 3:

1. **Hero title:** "Inmobiliaria..." → "14 propiedades disponibles..."
2. **Hero subtitle:** "Asesoría local" → "14 opciones. 3 se vendieron."
3. **Button:** "Ver propiedades" → "Ver las 14 propiedades"

Eso solo = +15-20% CTR típico en real estate.

---

**Siguiente paso:** ¿Implementamos esto hoy o necesitás números de tu DB primero?
