# docs/

Notas de trabajo, SQL de referencia y material interno del proyecto.

**Nada de esta carpeta se sirve.** Next publica únicamente `public/`. Mientras estos
archivos vivan acá, no están en internet.

## Los diagramas: internos, no van a `public/`

`tasador-flujo` y `web-arquitectura` son mapas del sistema generados con
[Archify](https://github.com/tt-a1i/archify). Cada uno tiene dos archivos:

| Archivo | Qué es |
| --- | --- |
| `*.json` | La fuente. JSON tipado, ~7 KB, se lee y se diffea en git. **Este es el activo.** |
| `*.html` | La salida compilada. ~840 KB, autocontenida. Se regenera de la fuente. |

Si hay que cambiar un diagrama, se edita el `.json` y se recompila. No se toca el HTML
a mano.

### Por qué no van a `public/`

Un archivo en `public/` queda servido en una URL abierta apenas se pushea a main
(Vercel despliega solo). Y estos diagramas dicen cosas que no se publican:

- `web-arquitectura` es el plano completo: el panel de admin y sus 9 pantallas, las 8
  tablas de Supabase, que el modelo propio corre en Render, el servidor MCP, la sonda
  `/api/salud`, y cómo las fotos se atan a la base por URL completa.
- `tasador-flujo` incluye el límite por IP y su número exacto, los endpoints, la tabla
  `saved_valuations` y la lógica del muro del correo. El límite de tasa, en particular,
  no se anuncia: publicar el número es publicar a qué velocidad hay que ir para no
  activarlo.

Para qué sirven entonces: **material de venta cara a cara.** `tasador-flujo` es lo que
se le muestra a una inmobiliaria que podría contratar el tasador — muestra el producto.
`web-arquitectura` es para un socio o alguien que ponga plata — muestra que hay un
sistema armado.

Si en algún momento se quiere una sección pública de "cómo funciona", se escribe una
versión aparte, redactada para eso, sin endpoints, sin nombres de tablas y sin los
controles. No se recorta esta.

### Mantenerlos vivos

Un diagrama de un sistema que se mueve se vuelve mentira despacio. Para saber si
quedaron viejos:

```bash
node scripts/verificar-diagramas.mjs
```

Compara la fecha del último commit de cada `.json` contra la de los archivos de los que
depende. Si alguno quedó atrás, lo dice y sale con código 1.

Para regenerar el HTML, con Archify instalado, pedirle al agente que recompile el JSON
correspondiente.
