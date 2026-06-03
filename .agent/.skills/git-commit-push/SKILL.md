---
name: git-commit-push
description: >
  Guarda y sube los cambios del proyecto NextInmo a GitHub al terminar una sesión de trabajo.
  Usar siempre que el usuario diga "listo", "terminamos", "guardá los cambios", "hacé commit",
  "subí los cambios", "push", "guardá todo", "cerramos", o cualquier frase que indique que
  terminó de trabajar. También usar proactivamente al final de cada sesión en la que se
  modificaron archivos del proyecto.
---

# Git Commit & Push — NextInmo

## Qué hacer

Al final de cada sesión de trabajo en el proyecto NextInmo, ejecutar los siguientes pasos en orden.

### Paso 1: Revisar los cambios

Ejecutar en bash (ruta del proyecto en el sandbox: `/sessions/jolly-zen-allen/mnt/nextjs`):

```bash
cd /sessions/jolly-zen-allen/mnt/nextjs && git status --short
```

Si no hay cambios (`nothing to commit`), informar al usuario y no hacer nada más.

### Paso 2: Generar el mensaje de commit

Leer el diff para entender qué cambió:

```bash
cd /sessions/jolly-zen-allen/mnt/nextjs && git diff --stat HEAD
```

Con eso, generar un mensaje de commit en español que:
- Empiece con un prefijo: `feat:`, `fix:`, `refactor:`, `content:`, o `chore:`
- Resuma en una línea qué se hizo (máximo 72 caracteres)
- Incluya 2-4 bullets describiendo los cambios principales

Ejemplo:
```
feat: agregar nueva propiedad y actualizar filtros

- Nueva propiedad en Barrio Chapelco agregada a data/properties.js
- Filtro por precio actualizado en PropertiesClient.js
- Hero actualizado con nueva imagen de portada
```

### Paso 3: Hacer el commit

```bash
cd /sessions/jolly-zen-allen/mnt/nextjs && git add -A && git commit -m "TU MENSAJE ACÁ"
```

### Paso 4: Indicar al usuario que haga el push

El sandbox no tiene credenciales de GitHub, así que el push lo hace el usuario.
Mostrar este mensaje claro:

---

✅ **Commit listo.** Para subir los cambios a GitHub, abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
git push origin main
```

---

## Notas

- Siempre incluir todos los archivos (`git add -A`), salvo que el usuario pida lo contrario.
- Si hay conflictos o errores en el commit, reportarlos claramente sin intentar resolverlos solos.
- Los archivos de log (`next_dev_err.log`, `next_dev_out.log`) y `out.zip` se pueden ignorar — si el usuario no los quiere en el repo, sugerirle agregarlos al `.gitignore`.
