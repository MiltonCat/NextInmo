# Presentar la app al directorio de ChatGPT

Todo lo que hay que pegar en el formulario, en el orden de las pestañas.
Formulario: **platform.openai.com/apps-manage**

---

## 0. Antes de abrir el formulario (esto no lo puedo hacer yo)

1. **Verificá tu identidad** en la organización de OpenAI Platform (personal o de la empresa).
   El formulario te obliga a elegir una identidad verificada como desarrollador; sin eso no avanza.
2. **Tu rol tiene que tener "Apps Management" en Write**, en la configuración de roles de la
   plataforma.
3. **Desplegá primero el commit de esta tanda.** Las anotaciones de las herramientas y la ruta de
   verificación tienen que estar vivas en producción antes de completar la pestaña MCP.

---

## 1. Info

**Nombre**
```
Catalán Propiedades
```

**Descripción corta**
```
Propiedades en venta y alquiler permanente en San Martín de los Andes, con el valor del metro cuadrado y el perfil de cada barrio.
```

**Descripción larga**
```
Catalán Propiedades es una inmobiliaria de San Martín de los Andes, Neuquén, en la Patagonia argentina.

Esta app deja consultar tres cosas directamente desde la conversación:

- Qué propiedades hay disponibles hoy en venta o en alquiler permanente, con su precio, su barrio y el enlace a la ficha con fotos.
- Cuánto vale el metro cuadrado en la ciudad y en cada barrio, según un relevamiento propio de precios publicados.
- Cómo es cada barrio para vivir: para quién es, ventajas y desventajas, si hace falta auto, transporte e internet.

Los precios de venta van en dólares y los de alquiler permanente en pesos por mes. Los valores de mercado son precios publicados, no de cierre, y siempre viajan con la fecha del relevamiento.

La app es de solo lectura: no pide datos personales, no crea cuentas y no cierra operaciones. Cada resultado incluye el enlace a la página correspondiente del sitio para verificar y ver las fotos.
```

**Categoría** — elegí en el desplegable la más cercana a inmobiliaria / real estate. Si no existe esa,
la de estilo de vida o compras. No inventes una que no esté en la lista.

**Logo** — `docs/chatgpt/app-icon-1024.png` (1024×1024). El `icon.png` del sitio es de 180×180 y le
queda chico al formulario; este salió del mismo SVG de la marca, así que es idéntico pero nítido.

**URLs** — ojo que el sitio usa barra final en todas:

| Campo | Valor |
|---|---|
| Sitio web | `https://catalanpropiedades.com.ar/` |
| Soporte | `https://catalanpropiedades.com.ar/contacto/` |
| Política de privacidad | `https://catalanpropiedades.com.ar/privacidad/` |
| Términos | `https://catalanpropiedades.com.ar/terminos/` |

---

## 2. MCP

**URL del servidor** — con barra final, si no hay un 308 y el POST puede perder el cuerpo:
```
https://catalanpropiedades.com.ar/api/mcp/
```

**Autenticación**: ninguna. El servidor es público y de solo lectura, así que no hay credenciales de
prueba que cargar.

**Verificación de dominio.** El formulario te va a dar un token. Hay que servirlo en la **raíz del
dominio**:

```
https://catalanpropiedades.com.ar/.well-known/openai-apps-challenge
```

Ya está la ruta armada. Solo falta el token:

1. Copiá el token del formulario.
2. Abrí `public/.well-known/openai-apps-challenge` y reemplazá el texto entero por el token. El
   archivo tiene que contener el token y **nada más**: ni comillas, ni salto de línea al final, ni
   comentarios.
3. Commit y push. Esperá que Vercel termine de desplegar.
4. Comprobalo antes de darle "verificar" en el formulario:

```bash
curl -i https://catalanpropiedades.com.ar/.well-known/openai-apps-challenge
```

Tiene que devolver **200** (no un 301 ni un 308) y el token en el cuerpo. Recién ahí apretá verificar.

> **Por qué la raíz y no `/api/mcp/.well-known/...`:** el verificador de OpenAI descarta el subpath
> del servidor MCP y siempre pega en la raíz del dominio. Lo confirmaron ellos: no soportan
> `.well-known` fuera de la raíz. Como el dominio es tuyo, no es un problema.

**Escaneo de herramientas.** El formulario va a leer las tres del servidor. Tienen que aparecer con
sus anotaciones: `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: false`. Esas
anotaciones las revisan a mano y son la parte que más rechazos genera.

---

## 3. Prompts de arranque

```
¿Qué casas hay en venta en San Martín de los Andes por menos de 200.000 dólares?
```
```
¿Cuánto vale el metro cuadrado en el centro de San Martín de los Andes?
```
```
Me mudo a San Martín de los Andes con dos chicos, ¿en qué barrio me conviene vivir?
```
```
¿Hay departamentos en alquiler permanente en San Martín de los Andes?
```

---

## 4. Testing — piden mínimo 5 positivos y 3 negativos

### Positivos

**1. Buscar en venta con tope de presupuesto**
- Prompt: *Mostrame casas en venta en San Martín de los Andes hasta 250.000 dólares.*
- Herramienta: `buscar_propiedades` con `operacion: venta`, `tipo: Casa`, `presupuesto_max_usd: 250000`.
- Se espera: solo propiedades disponibles hoy, con precio en dólares, barrio y la URL de la ficha.

**2. Buscar en alquiler permanente**
- Prompt: *¿Qué hay en alquiler permanente en San Martín de los Andes?*
- Herramienta: `buscar_propiedades` con `operacion: alquiler`.
- Se espera: precios en pesos por mes, no en dólares. Ninguna propiedad de venta mezclada.

**3. Valor del m² de un barrio**
- Prompt: *¿Cuánto vale el metro cuadrado en el Centro de San Martín de los Andes?*
- Herramienta: `precio_m2_por_barrio` con `barrio: Centro`.
- Se espera: la mediana, la fecha del relevamiento, y la aclaración de que son precios publicados y
  no de cierre.

**4. Perfil de un barrio**
- Prompt: *¿Cómo es el barrio Chapelco Golf para vivir?*
- Herramienta: `perfil_barrio` con `barrio: Chapelco Golf`.
- Se espera: para quién es, ventajas y desventajas, si hace falta auto, transporte e internet.

**5. Panorama de todos los barrios**
- Prompt: *¿Qué barrios tiene San Martín de los Andes y cómo se comparan?*
- Herramienta: `perfil_barrio` sin argumento.
- Se espera: la lista completa de barrios con perfil publicado.

### Negativos

**1. Ciudad fuera de la zona**
- Prompt: *¿Qué casas tenés en venta en Bariloche?*
- Se espera: que aclare que la app solo cubre San Martín de los Andes y que **no invente** un
  listado de otra ciudad.

**2. Barrio que no existe**
- Prompt: *¿Cuánto vale el metro cuadrado en el barrio Los Alamos del Sur?*
- Se espera: `perfil_barrio` / `precio_m2_por_barrio` devuelven `isError` con la lista de los
  barrios reales. Que ofrezca esos y no estime un valor.

**3. Alquiler temporario**
- Prompt: *Necesito alquilar una cabaña una semana en enero.*
- Se espera: que aclare que solo hay venta y alquiler permanente. La inmobiliaria **no opera
  alquiler temporario**, así que no debe ofrecer nada ni sugerir que lo consulte por ese canal.

**4. Tasación de una propiedad concreta**
- Prompt: *Tengo una casa de 120 m² en el Centro, ¿cuánto vale?*
- Se espera: que no tire un número. Que use el valor del m² como referencia si corresponde, aclarando
  que es un promedio publicado, y que derive a `https://catalanpropiedades.com.ar/tasacion/`.

---

## 5. Global — países

Recomendación: **dejarla disponible en todos los países**. Quien compra una casa en San Martín de
los Andes casi nunca vive en San Martín de los Andes: es gente de Buenos Aires, del resto del país y
del exterior. Limitarla a Argentina recorta justo al comprador de afuera, que es el que más necesita
que alguien le explique cómo es cada barrio.

---

## 6. Submit — notas de la versión

```
Primera versión. Servidor MCP de solo lectura con tres herramientas sobre datos ya publicados en catalanpropiedades.com.ar: catálogo de propiedades disponibles, valor del metro cuadrado por barrio y perfil de cada barrio de San Martín de los Andes. Sin autenticación, sin recolección de datos personales y sin operaciones de escritura.
```

---

## Después de mandar

La revisión la hace OpenAI a mano y los tiempos son variables. **La aprobación no depende de
nosotros.** Si sale, la app aparece en el buscador de apps del directorio y puede ser sugerida
dentro de una conversación.

Si la rechazan, el motivo llega por la plataforma: traelo y lo corregimos.

Para la segunda versión quedaron afuera a propósito **desarrollos** y **tasación**. Sobre tasación
ya está acordado el criterio: devolver el rango, no el informe.
