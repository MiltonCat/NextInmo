# Email Drip #1: Arquitectura Correcta
## Favoritos en Supabase + Sync desde LocalStorage

---

## 🎯 Problema Actual

**Favoritos solo en localStorage = malo:**
- ❌ No persisten entre dispositivos
- ❌ Se pierden si cambias navegador
- ❌ No se pueden usar para email drips
- ❌ No hay estadísticas de qué le gusta a cada user

**Solución:** Mover favoritos a **Supabase** + sincronizar desde cliente.

---

## 📐 Arquitectura Nueva

### 1. Nueva Tabla en Supabase: `user_preferences`

```sql
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)  -- Un user no puede favoritar 2x la misma propiedad
);

CREATE INDEX idx_user_prefs_user_id ON user_preferences(user_id);
```

### 2. Flow del Usuario

```
Usuario abre sitio (sin login)
  ↓
Favoritos en localStorage (como ahora)
  ↓
Usuario se loguea
  ↓
Sync: localStorage → Supabase (user_preferences)
  ↓
Siguiente sesión: Lee desde Supabase (no localhost)
```

### 3. Cuando Llega Propiedad Nueva

```
Admin crea propiedad
  ↓
Webhook: nueva-propiedad
  ↓
Query: "usuarios que tienen favoritas CON MISMO BARRIO"
  ↓
Enviar email: "Nueva propiedad en Centro (tu zona)"
```

---

## 🛠️ Implementación: 4 Pasos

### PASO 1: Crear Tabla en Supabase

Ve a https://supabase.com → Tu proyecto → SQL Editor → Corre:

```sql
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_user_prefs_user_id ON user_preferences(user_id);
```

---

### PASO 2: `lib/userPreferences.js` (Nueva)

```javascript
// Acceso a datos de preferencias (favoritos) por user.
// SOLO servidor.

import { rest } from "./supabaseRest";

const TABLE = "user_preferences";

// Obtener favoritas de un user
export async function getUserFavorites(userId) {
  if (!userId) return [];
  
  const rows = await rest(
    `${TABLE}?select=property_id&user_id=eq.${encodeURIComponent(userId)}`
  );
  
  return Array.isArray(rows) ? rows.map(r => r.property_id) : [];
}

// Agregar favorita
export async function addFavorite(userId, propertyId) {
  if (!userId || !propertyId) return null;
  
  const data = await rest(`${TABLE}?on_conflict=user_id,property_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: userId,
      property_id: propertyId,
    }),
  });
  
  return data?.[0] ?? null;
}

// Remover favorita
export async function removeFavorite(userId, propertyId) {
  if (!userId || !propertyId) return;
  
  await rest(
    `${TABLE}?user_id=eq.${encodeURIComponent(userId)}&property_id=eq.${propertyId}`,
    { method: "DELETE" }
  );
}

// Obtener propiedades favoritas de un user (con detalles)
export async function getUserFavoritesWithDetails(userId) {
  if (!userId) return [];
  
  // Query: join user_preferences con properties
  const rows = await rest(
    `${TABLE}?select=properties(id,title,price,location,barrio,bedrooms,area,photo,slug,roi)&user_id=eq.${encodeURIComponent(userId)}`
  );
  
  if (!Array.isArray(rows)) return [];
  
  return rows
    .map(r => r.properties)
    .filter(p => p) // Remover nulls
    .flat();
}

// Obtener usuarios que tienen favoritas EN UN BARRIO ESPECÍFICO
// Útil para enviar emails cuando llega propiedad nueva
export async function getUsersWithFavoritesInLocation(location) {
  if (!location) return [];
  
  const query = `${TABLE}?select=user_id,auth.users(email,user_metadata)&properties(barrio)&properties.barrio=eq.${encodeURIComponent(location)}`;
  
  const rows = await rest(query);
  
  if (!Array.isArray(rows)) return [];
  
  return rows.map(r => ({
    userId: r.user_id,
    email: r.auth?.users?.email,
    name: r.auth?.users?.user_metadata?.full_name,
  }));
}
```

---

### PASO 3: Sincronizar LocalStorage → Supabase (Después de Login)

**`app/auth/callback/route.js`** (ya existe, modificar):

Agregar al final del callback (después de que user está autenticado):

```javascript
// Después de que el user inicia sesión...
// Sincronizar favoritos del localStorage al servidor

const clientSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }
);

// Obtener favoritos locales del query string (si vienen)
const localFavoritesJson = request.nextUrl.searchParams.get("favorites");
let localFavorites = [];
try {
  if (localFavoritesJson) {
    localFavorites = JSON.parse(decodeURIComponent(localFavoritesJson));
  }
} catch (e) {
  console.error("[sync-favorites] invalid json:", e);
}

// Sincronizar cada favorita al servidor
if (Array.isArray(localFavorites) && localFavorites.length > 0) {
  for (const propertyId of localFavorites) {
    await addFavorite(user.id, Number(propertyId));
  }
  console.log(`[sync-favorites] Synced ${localFavorites.length} favorites for ${user.id}`);
}
```

---

### PASO 4: Modificar `hooks/useFavorites.js`

**Cambiar de localStorage → Supabase cuando user está logged in:**

```javascript
"use client";
import { useMemo, useSyncExternalStore } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // O donde guardes el user actual

const EVENT = "propiaFavoritesChanged";
const STORAGE_KEY = "propiaFavorites";

let memoria = null;

function leerDeStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function getFavoritesSnapshot() {
  if (memoria === null) memoria = leerDeStorage();
  return memoria;
}

function subscribeToFavorites(onStoreChange) {
  const onStorage = (event) => {
    if (!event.key || event.key === STORAGE_KEY) {
      memoria = leerDeStorage();
      onStoreChange();
    }
  };

  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function parseFavorites(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const { user } = useAuth(); // El usuario actual (si está logged in)
  const [isLoading, setIsLoading] = useState(false);
  
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const favorites = useMemo(() => parseFavorites(snapshot), [snapshot]);

  // NUEVO: Sincronizar a servidor cuando user se loguea
  useEffect(() => {
    if (!user || isLoading) return;

    setIsLoading(true);

    // Enviar favorites al servidor para que las sincronice
    fetch("/api/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localFavorites: favorites,
      }),
    })
      .then(() => {
        console.log("[useFavorites] Synced to server");
        // Opcionalmente: limpiar localStorage después de sync
        // localStorage.removeItem(STORAGE_KEY);
      })
      .catch((err) => console.error("[useFavorites] sync error:", err))
      .finally(() => setIsLoading(false));
  }, [user, isLoading]);

  const toggle = (id) => {
    const current = parseFavorites(getFavoritesSnapshot());
    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];

    // Primero la memoria
    memoria = JSON.stringify(updated);

    try {
      localStorage.setItem(STORAGE_KEY, memoria);
    } catch {
      // Sin persistencia, pero sesión sigue usable
    }

    // Si hay user logged in, enviar cambio al servidor
    if (user) {
      fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: Number(id),
          isFavorite: updated.includes(id),
        }),
      }).catch((err) => console.error("[toggle-favorite] error:", err));
    }

    window.dispatchEvent(new Event(EVENT));
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggle, isFavorite, isLoading };
}
```

---

### PASO 5: Crear API Routes

#### `app/api/favorites/sync/route.js`
```javascript
import { requireAuthenticatedUser } from "@/lib/auth";
import { addFavorite } from "@/lib/userPreferences";

export async function POST(request) {
  const user = await requireAuthenticatedUser();
  const { localFavorites } = await request.json();

  if (!Array.isArray(localFavorites)) {
    return new Response("Invalid data", { status: 400 });
  }

  // Sincronizar cada una
  for (const propertyId of localFavorites) {
    try {
      await addFavorite(user.id, Number(propertyId));
    } catch (err) {
      console.error(`[sync] Failed to add ${propertyId}:`, err);
    }
  }

  return new Response(JSON.stringify({ synced: localFavorites.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

#### `app/api/favorites/toggle/route.js`
```javascript
import { requireAuthenticatedUser } from "@/lib/auth";
import { addFavorite, removeFavorite } from "@/lib/userPreferences";

export async function POST(request) {
  const user = await requireAuthenticatedUser();
  const { propertyId, isFavorite } = await request.json();

  if (!propertyId) {
    return new Response("Missing propertyId", { status: 400 });
  }

  try {
    if (isFavorite) {
      await addFavorite(user.id, Number(propertyId));
    } else {
      await removeFavorite(user.id, Number(propertyId));
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[toggle] error:", err);
    return new Response("Failed", { status: 500 });
  }
}
```

---

### PASO 6: Email Drip (Ahora Funciona)

Con favoritos en Supabase, el email drip es simple:

```javascript
// lib/emailNuevaPropiedad.js
import { getUsersWithFavoritesInLocation } from "@/lib/userPreferences";
import { sendNewPropertyEmail } from "@/lib/emailBienvenida";

export async function notifyUsersAboutNewProperty(property) {
  // Obtener usuarios que tienen favoritas EN EL MISMO BARRIO
  const users = await getUsersWithFavoritesInLocation(property.location);

  console.log(`[new-property] Notifying ${users.length} users`);

  // Enviar email
  for (const user of users) {
    await sendNewPropertyEmail({
      email: user.email,
      nombre: user.name,
      property,
    });
  }
}
```

---

## ✅ Checklist

- [ ] Crear tabla `user_preferences` en Supabase
- [ ] Crear `lib/userPreferences.js`
- [ ] Crear `app/api/favorites/sync/route.js`
- [ ] Crear `app/api/favorites/toggle/route.js`
- [ ] Modificar `hooks/useFavorites.js`
- [ ] Testear: marcar favorita sin login → login → verificar que esté sincronizada
- [ ] Crear `lib/emailNuevaPropiedad.js` con nueva lógica
- [ ] Testear email drip

---

## 🎯 Resultado

✅ Favoritos persistentes entre dispositivos
✅ Favoritos sincronizados al servidor
✅ Email drip funciona (sabe qué le gusta a cada user)
✅ FavoritosClient.jsx sigue siendo el mismo (abstracción del hook)

**¿Implementamos esta versión correcta?**
