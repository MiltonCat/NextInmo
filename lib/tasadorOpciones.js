// Opciones del tasador. Vive fuera de lib/tasador.js (que es server-only)
// porque el wizard del navegador y la API route tienen que compartir
// exactamente la misma lista: si divergen, el modelo recibe un extra que no
// entiende o la UI ofrece algo que el backend descarta en silencio.

// Solo Casa y Departamento. Es la misma decisión que ya tomaba el formulario
// de tasación a mano: son los únicos tipos con datos suficientes (512 y 505
// relevadas). Cabaña, terreno y local van a WhatsApp, donde los tasa Milton.
export const TIPOS_TASADOR = [
  {
    valor: "Casa",
    label: "Casa",
    ayuda: "Con terreno propio",
    icono: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5",
  },
  {
    valor: "Departamento",
    label: "Departamento",
    ayuda: "En edificio o complejo",
    icono: "M4 20V4.5A.5.5 0 0 1 4.5 4h8a.5.5 0 0 1 .5.5V20M13 20V10h6.5a.5.5 0 0 1 .5.5V20M7.5 7.5h2M7.5 11h2M7.5 14.5h2M16 13.5h1M16 17h1M3 20h18",
  },
];

// Los extras que el modelo no recibe como campo van dentro de `descripcion`,
// que es una variable de texto que el modelo sí procesa. Por eso cada extra
// lleva la frase exacta que se le manda: son las palabras que aparecen en los
// avisos con los que fue entrenado, no una etiqueta inventada acá.
export const EXTRAS_TASADOR = [
  { id: "pileta", label: "Pileta", frase: "con pileta", campo: "tiene_pileta" },
  { id: "quincho", label: "Quincho o parrilla", frase: "quincho con parrilla" },
  { id: "vista", label: "Vista al lago o cerro", frase: "vista al lago y a los cerros" },
  { id: "estrenar", label: "A estrenar", frase: "a estrenar" },
  { id: "jardin", label: "Jardín o parque", frase: "jardín parquizado" },
  { id: "privado", label: "Barrio privado o golf", frase: "en barrio privado con seguridad" },
  { id: "leña", label: "Calefacción a leña", frase: "hogar a leña" },
  { id: "amoblado", label: "Amoblado", frase: "totalmente amoblado y equipado" },
];

// Límites de los campos numéricos. Los máximos coinciden con los que valida la
// API del modelo (ver su OpenAPI): pedirle algo fuera de rango devuelve un 422
// que la persona no puede interpretar, así que se corta antes.
export const LIMITES = {
  superficie: { min: 15, max: 2000 },
  terreno: { min: 0, max: 20000 },
  dormitorios: { min: 0, max: 10 },
  banos: { min: 0, max: 8 },
  ambientes: { min: 1, max: 15 },
  cocheras: { min: 0, max: 5 },
};

// Cuántas tasaciones se pueden hacer sin dejar el correo. La primera es libre
// —si le pedimos el mail antes de mostrarle nada, no tiene motivo para darlo—
// y a partir de la segunda hace falta.
export const TASACIONES_LIBRES = 1;
