# Email Drip #1: Implementación Completa
## Checklist + Testing

---

## ⚠️ CORRECCIÓN (17/08/2026) — leer antes que el resto

La primera versión de este documento indicaba crear un hook `hooks/useAuth.js`
que leyera la sesión con `supabaseBrowser()`. **Eso no funciona en este
proyecto** y hacía que el sync de favoritos nunca corriera (la tabla quedaba
siempre en 0 filas).

El motivo: `lib/supabaseBrowser.js` crea el cliente con
`auth: { persistSession: false }`. Ese cliente sirve para lecturas públicas,
no guarda ni lee sesión. La sesión real vive en cookies httpOnly y la maneja
`@supabase/ssr` del lado del servidor (`lib/supabaseServer.js`). Por eso
`getSession()` en el navegador devuelve siempre `null`.

**Cómo quedó resuelto:**

- `hooks/useAuth.js` se eliminó. No hay detección de sesión en el cliente.
- `hooks/useFavorites.js` llama a `/api/favorites/sync` en cada carga de
  página, sin condiciones. El servidor lee la cookie y decide: si hay sesión
  sincroniza y devuelve la lista completa; si no, responde
  `authenticated: false` y no escribe nada.
- `toggle()` avisa al servidor siempre, por el mismo motivo: el navegador no
  puede saber si hay sesión.
- Las dos API routes usan `getSessionUser()` en vez de
  `requireAuthenticatedUser()`, porque este último hace `redirect()` y un
  redirect como respuesta a un `fetch` devuelve el HTML del login con 307.

Las secciones de más abajo que mencionan `useAuth` quedan obsoletas.

---

## ✅ Archivos Creados

- [x] `docs/sql-crear-user-preferences.sql` — SQL para tabla
- [x] `lib/userPreferences.js` — Queries a Supabase
- [x] `app/api/favorites/sync/route.js` — Sincronizar localStorage
- [x] `app/api/favorites/toggle/route.js` — Toggle favorita (logged in)
- [x] `hooks/useFavorites.js` — Modificado: sync a Supabase
- [x] `lib/emailNuevaPropiedad.js` — Template + envío de emails
- [x] `app/api/webhook/nueva-propiedad/route.js` — Webhook para disparar

---

## 📋 Pasos de Implementación

### PASO 1: Crear Tabla en Supabase

1. Abre tu proyecto Supabase
2. Ve a **SQL Editor**
3. Copia todo de `docs/sql-crear-user-preferences.sql`
4. **Reemplaza** `'tu-email-admin@ejemplo.com'` con TU email
5. Ejecuta

**Resultado esperado:** Tabla `user_preferences` creada sin errores.

---

### PASO 2: Crear Variables de Entorno

En `.env.local`, agregar:

```env
# Webhook secret (genera uno aleatorio para testing)
WEBHOOK_SECRET_NUEVA_PROPIEDAD=tu-secreto-aleatorio-12345

# Ya deberías tener estos:
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-google
```

---

### PASO 3: Deploy de Archivos

Todos los archivos ya están creados. Verificar que compilen:

```bash
npm run build
```

Si hay error de import en `hooks/useFavorites.js`, buscar si `useAuth` hook existe. Si no:

```bash
grep -r "export.*useAuth" hooks/
```

Si no existe, crear `hooks/useAuth.js`:

```javascript
"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    const { data } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => data?.subscription?.unsubscribe?.();
  }, []);

  return { user };
}
```

---

## 🧪 Testing

### TEST 1: Verificar tabla en Supabase

```bash
# En Supabase SQL Editor:
SELECT COUNT(*) FROM user_preferences;
-- Debería devolver: 0 (vacía al principio)
```

---

### TEST 2: Testing Manual de APIs

#### A. Crear usuario de prueba + marcar favorita

```bash
# 1. Login
curl -X POST https://tu-proyecto.supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: tu-public-key" \
  -d '{"email":"test@example.com","password":"password123"}'

# Guardar el access_token devuelto

# 2. Marcar como favorita (necesita access token)
curl -X POST http://localhost:3000/api/favorites/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -d '{"propertyId":123,"isFavorite":true}'

# Respuesta esperada: {"ok":true}
```

#### B. Sincronizar desde localStorage

```bash
curl -X POST http://localhost:3000/api/favorites/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -d '{"localFavorites":[123,456,789]}'

# Respuesta esperada: {"synced":3}
```

#### C. Disparar webhook (simular propiedad nueva)

```bash
curl -X POST http://localhost:3000/api/webhook/nueva-propiedad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-secreto-aleatorio-12345" \
  -d '{
    "property": {
      "id": 123,
      "title": "Casa Centro",
      "price": 400000,
      "location": "Centro",
      "bedrooms": 3,
      "area": 120,
      "photo": "https://ejemplo.com/foto.jpg",
      "slug": "casa-centro-123"
    }
  }'

# Respuesta esperada: {"ok":true,"property_id":123,"emails_sent":X}
```

---

### TEST 3: End-to-End (Recomendado)

**Escenario:** Usuario se loguea, marca favorita, le llega email cuando hay propiedad nueva.

1. Abre sitio en incógnito
2. **NO loguear** (favoritas en localStorage)
3. Ve a propiedades, marca 3 como favorita
4. Recarga, verifica que siguen siendo favoritas ✓
5. Loguea con tu email de prueba
6. Verifica que se sincronizaron a Supabase:
   ```bash
   SELECT COUNT(*) FROM user_preferences WHERE user_id='tu-user-id';
   # Debería mostrar 3
   ```
7. Dispara webhook como TEST 2C
8. Revisa tu correo (puede tardar 30 seg)
9. Verifica que llegó el email ✓

---

## 🚨 Troubleshooting

### Error: "Cannot find module useAuth"
**Solución:** Ver TEST 2C si existe, o crearla.

### Error: "GMAIL_APP_PASSWORD no configurada"
**Solución:** Verificar `.env.local` tiene `GMAIL_APP_PASSWORD=tu-app-password`

### Error: "supabaseAdmin not found"
**Solución:** Verificar que `lib/supabaseAdmin.js` existe. Si no:
```bash
grep -r "export.*supabaseAdmin" lib/
```

### No llegan emails
**Pasos:**
1. Verificar logs: `npm run dev` y buscar `[emailNuevaPropiedad]`
2. Verificar que GMAIL_APP_PASSWORD es correcto
3. Verificar que la tabla `user_preferences` tiene datos:
   ```bash
   SELECT * FROM user_preferences LIMIT 5;
   ```

### No se sincronizan favoritos
**Pasos:**
1. Abrir DevTools → Network → buscar POST a `/api/favorites/sync`
2. Ver response: ¿`{"synced":0}`? Significa que no encontró favoritas
3. Verificar que localStorage tiene `propiaFavorites`: 
   ```javascript
   localStorage.getItem('propiaFavorites')
   // Debería mostrar: "[123,456,789]" (array JSON)
   ```

---

## 📊 Métricas a Trackear (Después)

- ¿Cuántos usuarios sincronizaron favoritas? (query `user_preferences`)
- ¿Cuántos emails enviados por semana?
- ¿Tasa de apertura de emails?
- ¿Clicks en "Ver propiedad"?

---

## 🎯 Próximos Pasos (Mes 2)

- [ ] A/B test: ¿mejora CTR si cambias subject del email?
- [ ] Agregar unsubscribe link dinámico
- [ ] Dashboard admin: "X emails enviados esta semana"
- [ ] Estadísticas de usuario: "Tus favoritas: 12"

---

**¿Necesitas ayuda en algún paso?**
