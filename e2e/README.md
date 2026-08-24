# Tests end-to-end

Cinco flujos que no pueden romperse. Si uno falla, algo que el negocio necesita
dejó de funcionar — no es un detalle de estilo.

| Archivo | Flujo | Qué protege |
|---|---|---|
| `buscar-propiedad.spec.js` | Buscar | Que el catálogo cargue y los filtros no dejen la página muda |
| `ficha-propiedad.spec.js` | Ver ficha | Que la propiedad abra y **las fotos existan de verdad** |
| `enviar-consulta.spec.js` | Consultar | Que ningún lead se pierda en silencio |
| `tasacion.spec.js` | Tasar | Que los 5 pasos se completen y un modelo caído se avise |
| `cuenta-login.spec.js` | Cuenta | Que la puerta esté cerrada sin sesión |

## Cómo correrlos

La primera vez, una sola vez, hay que bajar el navegador:

```bash
npx playwright install chromium --with-deps
```

Después:

```bash
npm test              # todos, sin ventana
npm run test:ui       # modo interactivo, para depurar
npm run test:headed   # viendo el navegador
npm test -- e2e/tasacion.spec.js    # uno solo
```

No hace falta levantar `npm run dev` antes: Playwright lo arranca solo. Si ya
lo tenés abierto, lo reusa y no te pisa el puerto.

## Regla que no se negocia: ningún test manda datos reales

`e2e/base.js` extiende `page` con una red de seguridad:

- **EmailJS** siempre devuelve OK falso. Nunca sale un correo.
- **Todo POST a `/api/**` está bloqueado por defecto** (503). Un test que
  necesite uno lo declara con `page.route(...)` y así el permiso queda
  explícito y a la vista en el test.

Si agregás un test que completa un formulario nuevo, mockealo. Si te olvidás,
el bloqueo por defecto lo corta igual — vas a ver el test fallar, que es
infinitamente mejor que descubrir 200 leads de prueba en el CRM.

### Lo que NO se puede mockear

El login por código (`signInAccount`) y el alta de propiedades son **Server
Actions**: corren en el servidor, y `page.route()` solo intercepta pedidos del
navegador. Por eso `cuenta-login.spec.js` llega hasta el botón y no lo aprieta.
Si algún día querés cubrir el login completo, hace falta una casilla de prueba
real (Mailosaur, Ethereal) o un usuario semilla en Supabase de staging — no
alcanza con un mock.

## Por qué los selectores son como son

Se usa texto visible y roles de accesibilidad, no clases de Tailwind. Las
clases cambian con cada retoque de diseño; el texto "Enviar mensaje" cambia
cuando cambia el producto. Un test que se rompe con un cambio de color es un
test que vas a terminar borrando.

Dos casos donde hubo que tener cuidado:

- **Buscador duplicado**: el listado tiene dos inputs, uno para mobile y otro
  para escritorio, con placeholders distintos. El test elige según el viewport.
- **Inventario cambiante**: ningún test hardcodea un slug, un barrio ni un
  título. Se toma siempre el primer elemento real de la lista.

## Cuándo se rompe legítimamente

Si cambiás uno de estos textos, actualizá el test correspondiente — es una
línea:

- `"Enviar mensaje"`, `"¡Mensaje enviado!"`, `"El mensaje es requerido"`
- `"Siguiente"`, `"Ver el valor"`, `"Paso N de 5"`, `"Tu tasación está lista"`
- `"Mi cuenta"`, `"Enviarme un código"`
- `"No se encontraron propiedades con los filtros seleccionados."`
