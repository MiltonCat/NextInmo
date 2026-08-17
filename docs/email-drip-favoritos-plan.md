# Email Drip #1: "Alguien vio tu favorita"
## Plan de Implementación Realista

---

## 🎯 Objetivo
Cuando llega una **propiedad nueva**, enviar email a suscriptores que:
- Se suscribieron con interés "comprar" o "invertir"
- La propiedad coincide su rango de precio/barrio

**Resultado:** Retorno a la web + click = re-engagement.

---

## 🏗️ Arquitectura Actual (Tu Setup)

### Favoritos:
- **Guardados en:** localStorage (client-side, FavoritosClient.jsx)
- **Problema:** No se sincronizan al servidor. No sabemos qué favoritos tiene cada user.

### Suscriptores:
- **Tabla:** `subscribers` en Supabase
- **Campos:** email, nombre, interes (comprar/alquilar/invertir/mirar)
- **Usar:** Datos de suscripción para inferir preferencias

### Propiedades:
- **Tabla:** `properties` en Supabase
- **Campos:** price, barrio, bedrooms, etc.
- **Trigger:** Cuando se agrega propiedad nueva

---

## 🔄 Estrategia: Versión Simplificada (Viable)

**No vamos a trackear favoritos en servidor** (eso sería un cambio big).

**En su lugar:**
1. Cuando llega propiedad nueva
2. Enviar email a suscriptores que matched por:
   - **Interés** (comprar/invertir)
   - **Rango de precio** (estimado: si interes=comprar, asumimos $200K-$600K)
   - **Barrio** (si hay preferencia registrada)

**Copy del email:**
```
⚡ Nueva propiedad en Centro (tu zona favorita)
Alguien más la está mirando ahora.

[Propiedad + foto + precio + link]
Ver detalles →
```

---

## 📋 Implementación: 3 Archivos

### 1. `lib/emailNuevaPropiedad.js` (Nuevo)
```js
// Template de email cuando llega propiedad nueva matching suscriptor
import nodemailer from "nodemailer";
import { SITE_URL, CONTACT_EMAIL, WA_URL } from "@/config";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export async function sendNewPropertyEmail({ email, nombre, property }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn("[emailNuevaPropiedad] GMAIL_APP_PASSWORD no configurada");
    return;
  }

  try {
    const priceLabel = property.price
      ? `USD ${property.price.toLocaleString()}`
      : "Consultar";
    
    const propertyUrl = `${SITE_URL}/propiedades/${property.slug || property.id}`;

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
      <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#e11d48;font-weight:bold;margin:0 0 12px">Catalán Propiedades</p>
      
      <h1 style="font-size:22px;margin:0 0 12px;color:#111827">⚡ Nueva propiedad disponible</h1>
      
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#4b5563">
        Hola ${nombre || ""},<br/><br/>
        Justo apareció una propiedad en ${property.location || "San Martín"} que coincide con tu búsqueda.
        Alguien más la está viendo ahora.
      </p>

      ${property.photo ? `
      <div style="margin:0 0 20px;border-radius:8px;overflow:hidden">
        <img src="${property.photo}" alt="${property.title}" style="width:100%;height:auto;display:block" />
      </div>
      ` : ''}

      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:0 0 20px">
        <h2 style="font-size:18px;margin:0 0 8px;color:#111827">${property.title}</h2>
        <p style="margin:0 0 8px;color:#4b5563">
          <strong>${priceLabel}</strong> · ${property.bedrooms || 0} ambientes · ${property.area || 0} m²
        </p>
        <p style="margin:0;color:#6b7280;font-size:14px">${property.location || "San Martín de los Andes"}</p>
      </div>

      <p style="margin:0 0 8px">
        <a href="${propertyUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;text-decoration:none">Ver detalles</a>
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />
      
      <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px">
        ¿Querés más info? Escribinos por
        <a href="${WA_URL}" style="color:#e11d48;text-decoration:none">WhatsApp</a>.
      </p>
      
      <p style="font-size:12px;color:#9ca3af;margin:0">
        Catalán Propiedades · San Martín de los Andes, Patagonia<br/>
        Si no querés recibir estos avisos, respondé este email con BAJA.
      </p>
    </div>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Catalán Propiedades" <${GMAIL_USER}>`,
      to: email,
      subject: `⚡ Nueva propiedad en ${property.location || "San Martín"} — ${priceLabel}`,
      html,
    });
  } catch (err) {
    console.error("[emailNuevaPropiedad] error:", err);
  }
}
```

---

### 2. `lib/matchSuscriptores.js` (Nuevo)
```js
// Lógica: ¿a quién le enviamos email sobre esta propiedad?

export function shouldSendEmailToSubscriber(subscriber, property) {
  // Si el suscriptor NO especificó interés, no le enviamos.
  if (!subscriber.interes) return false;

  // "mirar" = solo quieren newsletter, no alertas
  if (subscriber.interes === "mirar") return false;

  // "alquilar" = solo propiedades de alquiler
  if (subscriber.interes === "alquilar") {
    return property.rent_price && !property.price;
  }

  // "comprar" o "invertir" = propiedades en venta
  if (subscriber.interes === "comprar" || subscriber.interes === "invertir") {
    if (!property.price) return false;

    // Rango de precio: estimación simple
    // "comprar" = personas con presupuesto flexible
    // "invertir" = suelen ser presupuestos mayores o ROI-driven
    const price = Number(property.price);

    if (subscriber.interes === "comprar") {
      // Rango típico comprador: $150K-$800K
      return price >= 150_000 && price <= 800_000;
    }

    if (subscriber.interes === "invertir") {
      // Rango típico inversionista: $200K+
      // Enfoque en propiedades con ROI > 0
      return price >= 200_000 && (property.roi > 0 || !property.roi);
    }
  }

  return false;
}
```

---

### 3. `app/api/webhook/nueva-propiedad/route.js` (Nuevo)
```js
// Webhook: llama cuando se crea propiedad nueva en admin
// Envía emails a suscriptores matching

import { sendNewPropertyEmail } from "@/lib/emailNuevaPropiedad";
import { shouldSendEmailToSubscriber } from "@/lib/matchSuscriptores";
import { getSubscribers } from "@/lib/suscriptores";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(request) {
  // 1. Verificar que venga del admin
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !verifyAdminToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parsear propiedad nueva
  const body = await request.json();
  const { property } = body;

  if (!property || !property.id) {
    return new Response("Missing property data", { status: 400 });
  }

  // 3. Obtener todos los suscriptores
  const subscribers = await getSubscribers();
  if (!Array.isArray(subscribers)) {
    return new Response("Failed to load subscribers", { status: 500 });
  }

  // 4. Filtrar matching + enviar emails (fire & forget)
  const matching = subscribers.filter((s) => shouldSendEmailToSubscriber(s, property));
  console.log(`[nueva-propiedad] Enviando a ${matching.length} suscriptores`);

  // Enviar en background (no bloquea la respuesta)
  matching.forEach((subscriber) => {
    sendNewPropertyEmail({
      email: subscriber.email,
      nombre: subscriber.nombre,
      property,
    }).catch((err) => {
      console.error(`[nueva-propiedad] Failed to send to ${subscriber.email}:`, err);
    });
  });

  return new Response(JSON.stringify({ sent: matching.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

---

## 🚀 Cómo Disparar el Email (Manual Primero)

### Opción A: Desde Admin (Interface)
En `/admin/propiedades/nueva/page.js`, después de crear propiedad:

```js
// Después de insertar la propiedad...
await fetch("/api/webhook/nueva-propiedad", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.ADMIN_WEBHOOK_SECRET}`,
  },
  body: JSON.stringify({ property: newProperty }),
});
```

### Opción B: Manual vía cURL (Testing)
```bash
curl -X POST http://localhost:3000/api/webhook/nueva-propiedad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-token-aqui" \
  -d '{
    "property": {
      "id": 123,
      "title": "Casa Centro",
      "price": 400000,
      "location": "Centro",
      "bedrooms": 3,
      "area": 120,
      "photo": "https://...",
      "slug": "casa-centro-123"
    }
  }'
```

---

## 📊 Métricas a Trackear

Después de enviar:
- ¿Cuántos emails enviados?
- ¿Cuántos abiertos? (si configuras tracking)
- ¿Cuántos clicks en "Ver detalles"?
- ¿Tiempo hasta primer click?

---

## ⚠️ Limitaciones de Esta Versión

❌ **No trackea favoritos en servidor** — solo usa `interes` al suscribirse
❌ **Rango de precio es estimado** — no es personalizado por usuario
❌ **Sin machine learning** — matching es simple (interes + precio)

✅ **Ventajas:**
- Funciona YA, sin grandes cambios
- Simple de debuguear
- Aprovecha data que ya tienes (subscribers)
- Se ejecuta en background (no bloquea admin)

---

## 🔄 Versión Avanzada (Mes 2)

Si quieres tracking completo de favoritos:
1. Agregar tabla `user_favorites` en Supabase
2. Sincronizar localStorage → servidor cuando user logged in
3. Usar esa tabla para matching más preciso

Pero eso es para después. Esto es **viable HOY**.

---

## ✅ Checklist de Implementación

- [ ] Copiar `lib/emailNuevaPropiedad.js`
- [ ] Copiar `lib/matchSuscriptores.js`
- [ ] Crear `app/api/webhook/nueva-propiedad/route.js`
- [ ] Testear webhook con cURL
- [ ] Agregar trigger en admin/propiedades/nueva/page.js (opcional, manual por ahora)
- [ ] Verificar template en Gmail
- [ ] A/B test: ¿mejora la tasa de return?

---

**¿Implementamos?**
