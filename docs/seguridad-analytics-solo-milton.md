# Seguridad: Analytics Solo para Milton
## catalanmilton826@gmail.com

---

## 🔒 Políticas de Seguridad (RLS)

La tabla `user_preferences` tiene 3 políticas de fila:

### 1. **Users can view their own preferences**
```sql
USING (auth.uid() = user_id)
```
**Qué hace:** Cada usuario solo ve SUS propias favoritas.
**Quién:** Usuarios registrados (cualquiera que se loguee)
**Ejemplo:** Juan vé sus 12 favoritas, pero no ve las de María.

---

### 2. **Users can insert/delete their own preferences**
```sql
WITH CHECK (auth.uid() = user_id)
```
**Qué hace:** Cada usuario solo puede agregar/remover SUS propias favoritas.
**Quién:** Usuarios registrados
**Resultado:** No hay forma de que un usuario marque favorita "en nombre de otro".

---

### 3. **Milton only can view all preferences for analytics** ⭐
```sql
USING (auth.jwt() ->> 'email' = 'catalanmilton826@gmail.com')
```
**Qué hace:** Solo TÚ (catalanmilton826@gmail.com) puedes ver TODAS las favoritas de TODOS.
**Quién:** Solo tu email
**Resultado:** Solo vos puedes hacer queries como:
```sql
-- Milton solo (nadie más puede hacer esto):
SELECT user_id, COUNT(*) as favorite_count 
FROM user_preferences 
GROUP BY user_id
ORDER BY favorite_count DESC;
```

**Otros usuarios** NO pueden hacer esa query. Les devuelve 0 filas.

---

## 📊 Analytics: Solo Vos Puedes Verlas

Con tu email puedes:

✅ **Ver todas las favoritas del sistema**
```sql
SELECT * FROM user_preferences;
```

✅ **Contar cuánta gente tiene cada propiedad como favorita**
```sql
SELECT property_id, COUNT(*) as favorite_count 
FROM user_preferences 
GROUP BY property_id 
ORDER BY favorite_count DESC;
```

✅ **Ver quién tiene más favoritas**
```sql
SELECT user_id, COUNT(*) FROM user_preferences GROUP BY user_id;
```

❌ **Otros usuarios NO pueden hacer nada de esto**
- Si se loguean con otro email, les da error o 0 filas

---

## 🔑 Cómo Funciona

Cuando haces query en Supabase SQL Editor:
1. Supabase verifica tu email (de tu sesión)
2. Compara: ¿Es catalanmilton826@gmail.com?
3. Si SÍ → Te deja ver TODO
4. Si NO → Te deja ver solo TUS propias favoritas

**No hay excepciones.** Ni siquiera admins de Supabase pueden ver los datos del usuario si no tienen RLS correcto.

---

## 🛡️ Seguridad de las Funciones

Las funciones que usamos en el código:

### `lib/userPreferences.js`

- **getUserFavorites(userId)** → Solo devuelve favoritas del user
- **getUsersWithFavoritesInLocation(location)** → Usa REST con ADMIN key (privada en servidor)
- **getPropertyFavoriteCount(propertyId)** → Solo cuenta favoritas públicas

**Nota:** Estas funciones usan `supabaseRest` que incluye la clave SECRETA del servidor. 
Por eso solo corren en SERVIDOR (lib/), nunca en navegador.

---

## 📝 Resumen de Acceso

| Quién | Puede Ver | Puede Hacer |
|-------|-----------|------------|
| Usuario Registrado | Solo SUS favoritas | Agregar/quitar SUS favoritas |
| Otro Usuario | Sus propias favoritas | Sus propios cambios |
| **Milton (tu email)** | **TODO** | **Analytics completas** |
| Hackers | Nada (sin credentials) | Nada |

---

## ✅ Ya Está Seguro

El SQL ya está configurado con TU email:
```sql
auth.jwt() ->> 'email' = 'catalanmilton826@gmail.com'
```

**Resultado:** Solo vos puedes correr queries de analytics.

---

**¿Necesitas agregar otro admin? Avisame y agregamos otro email con la misma política.**
