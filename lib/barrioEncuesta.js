// Definición del instrumento de la Guía de Barrios: qué se pregunta y qué
// valores son válidos. SIN dependencias de servidor a propósito.
//
// Vive separado de lib/barrioOpiniones.js porque el formulario es un componente
// cliente: si importara desde ahí, arrastraría lib/supabaseRest.js —y con él la
// SUPABASE_SECRET_KEY— al bundle del navegador. Este archivo es seguro de
// importar desde cualquier lado; el otro es solo servidor.
//
// El formulario, la validación del endpoint y el panel de moderación leen todos
// de acá, así que las opciones no se pueden desincronizar.

// Las 7 dimensiones puntuables 1..5. `acceso_invierno` es el diferencial
// patagónico: nadie lo mide y es justo lo que el comprador de afuera no puede
// saber antes de mudarse.
export const DIMENSIONES = [
  { key: "tranquilidad", label: "Tranquilidad", ayuda: "Ruido y movimiento" },
  { key: "seguridad", label: "Seguridad", ayuda: "Qué tan seguro se siente" },
  { key: "acceso_invierno", label: "Acceso en invierno", ayuda: "Nieve, calles, quedar aislado" },
  { key: "servicios", label: "Servicios a mano", ayuda: "Comercios, escuela, salud" },
  { key: "conectividad", label: "Conectividad", ayuda: "Internet y señal" },
  { key: "transporte", label: "Transporte público", ayuda: "Colectivo y frecuencia" },
  { key: "vida_barrio", label: "Vida de barrio", ayuda: "Vecinos y comunidad" },
];

export const DIMENSION_KEYS = DIMENSIONES.map((d) => d.key);

export const RELACIONES = [
  { value: "vivo", label: "Vivo acá actualmente" },
  { value: "vivi", label: "Viví acá antes" },
  { value: "propietario", label: "Tengo una propiedad acá" },
  { value: "trabajo", label: "Trabajo o tengo un negocio acá" },
];

export const ANTIGUEDADES = [
  { value: "menos1", label: "Menos de 1 año" },
  { value: "1a5", label: "Entre 1 y 5 años" },
  { value: "5a10", label: "Entre 5 y 10 años" },
  { value: "mas10", label: "Más de 10 años" },
];

export const PERFILES = [
  "Familias con chicos",
  "Jubilados",
  "Jóvenes / primera vivienda",
  "Inversores",
  "Teletrabajo",
];

export const REC_OPCIONES = [
  { value: "si", label: "Sí" },
  { value: "reparos", label: "Con reparos" },
  { value: "no", label: "No" },
];

// Etiquetas legibles para el panel de moderación.
export const RELACION_LABEL = Object.fromEntries(RELACIONES.map((r) => [r.value, r.label]));
export const ANTIGUEDAD_LABEL = Object.fromEntries(ANTIGUEDADES.map((a) => [a.value, a.label]));
export const REC_LABEL = Object.fromEntries(REC_OPCIONES.map((r) => [r.value, r.label]));

// ── Umbrales de publicación ────────────────────────────────────────────────
// Lo que protege la credibilidad del dataset. Un porcentaje inflado la destruye
// más rápido de lo que la construyen 200 respuestas.
//
// n < 5    → no se muestra ningún promedio
// n 5..14  → números absolutos ("7 de 9 vecinos"), nunca porcentajes
// n >= 15  → recién ahí porcentajes, siempre con el n visible al lado
export const MIN_PROMEDIO = 5;
export const MIN_PORCENTAJE = 15;

export function nivelDePublicacion(n) {
  if (!n || n < MIN_PROMEDIO) return "insuficiente";
  if (n < MIN_PORCENTAJE) return "absolutos";
  return "porcentajes";
}

// Formatea una proporción respetando el umbral. Nunca devuelve un porcentaje
// con muestra chica.
export function formatearProporcion(parte, total) {
  if (!total || total < MIN_PROMEDIO) return null;
  if (total < MIN_PORCENTAJE) return `${parte} de ${total}`;
  return `${Math.round((parte / total) * 100)}%`;
}
