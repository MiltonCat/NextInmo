# Nota de sesión — Post "Score de inversión" (23 jun 2026)

## Estado: casi listo, falta 1 paso

### Qué se hizo
- Nuevo post creado: `app/blog/score-de-inversion-san-martin-de-los-andes/page.js`
  - Tema: score de inversión patagónico (ángulo técnico para inversores).
  - Usa datos reales del modelo vía `@/lib/mercado` (m² por barrio, evolución +57,7%, yields).
  - Misma línea editorial que los otros posts (header + autor, metadata, JSON-LD Article + FAQPage, CTA, FAQ, disclaimer, relacionados).
- Registrado como post más nuevo en `app/blog/page.js` (array `blogPosts`).
- Corregido el `<title>` que se duplicaba (el layout ya agrega "| Catalán Propiedades").
- Verificado en vivo en localhost:3000: renderiza bien con los datos reales. ESLint OK.
- Investigado el error "removeChild": NO es del código. Es una extensión del navegador (LastPass) mutando el DOM en dev. En carga limpia: 0 errores. Nada que arreglar.

### PENDIENTE (paso 1, retomar acá)
- **Falta guardar la imagen** `patagonia-activo.jpg` en `public/`.
  - La pieza es el flyer dark "La Patagonia también es un activo / Real estate con mirada financiera".
  - Se pegó en el chat pero NO quedó como archivo en disco, por eso no se pudo copiar.
  - El código YA apunta a `/patagonia-activo.jpg` en 3 lugares: portada visible del artículo (figure debajo del autor), tarjeta del blog y metadata OG/Twitter/JSON-LD.
  - Acción: copiar el archivo a `C:\Users\catal\OneDrive\Escritorio\Desarrollo\Next\nextjs\public\patagonia-activo.jpg` y recargar.

### Ideas / pendientes opcionales
- Aplicar la corrección de `<title>` duplicado a los otros posts (todos arrastran el sufijo doble).
- Si se quiere blindar contra el error de extensiones para visitantes reales: Error Boundary en el layout.
- Existe propuesta completa de copy para redes (IG/WhatsApp) del concepto "La Patagonia también es un activo" + mockup, por si se quiere publicar en social.

### Para correr el sitio
- En la carpeta del proyecto: `npm run dev` → http://localhost:3000/blog/score-de-inversion-san-martin-de-los-andes
