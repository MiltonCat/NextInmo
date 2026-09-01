// El clima de San Martín de los Andes.
//
// Por qué está en un sitio inmobiliario: el que compra desde Buenos Aires
// pregunta por el invierno y por la nieve antes que por los metros cuadrados.
// Es la pregunta que Lucía no podía contestar y que no tiene nada que ver con
// el catálogo.
//
// La fuente es Open-Meteo: gratis, sin API key y sin registro, con uso
// comercial permitido citando la fuente. Por eso no hay ninguna variable de
// entorno nueva que configurar en Vercel.
//
// REGLA: si la API no contesta, contesta raro o le falta un campo, esto
// devuelve `null` y Lucía dice que no lo pudo traer. Nunca un número
// aproximado, nunca "debe estar fresco". Un dato del clima inventado en un
// sitio que vende propiedades a distancia se descubre en dos minutos y se lleva
// puesta la credibilidad de todo lo demás.

const SMA = { lat: -40.1579, lon: -71.3533 };

const API =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${SMA.lat}&longitude=${SMA.lon}` +
  "&current=temperature_2m,apparent_temperature,weather_code" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=4";

// Media hora. Open-Meteo actualiza cada 15 minutos y el dato no se mueve tanto
// como para justificar una llamada por visitante; con esto, mil personas que
// pregunten en la misma hora son dos llamadas a la API.
export const CLIMA_REVALIDATE = 1800;

// Códigos WMO, que es lo que devuelve la API. Traducidos a cómo se dice acá.
const WMO = {
  0: "despejado",
  1: "mayormente despejado",
  2: "parcialmente nublado",
  3: "nublado",
  45: "con niebla",
  48: "con niebla y escarcha",
  51: "con llovizna leve",
  53: "con llovizna",
  55: "con llovizna intensa",
  56: "con llovizna helada",
  57: "con llovizna helada intensa",
  61: "con lluvia leve",
  63: "con lluvia",
  65: "con lluvia fuerte",
  66: "con lluvia helada",
  67: "con lluvia helada fuerte",
  71: "con nevadas leves",
  73: "con nevadas",
  75: "con nevadas fuertes",
  77: "con nieve en grano",
  80: "con chaparrones aislados",
  81: "con chaparrones",
  82: "con chaparrones fuertes",
  85: "con chaparrones de nieve",
  86: "con chaparrones de nieve fuertes",
  95: "con tormenta",
  96: "con tormenta y granizo",
  99: "con tormenta y granizo fuerte",
};

const describir = (codigo) => WMO[codigo] || null;

// Redondeo a entero, o null si no vino un número. Todo lo que sale de acá pasa
// por esta función: un `undefined` que llegue al chat se dibuja como "undefined°".
//
// El descarte explícito de null y "" NO es de más: `Number(null)` es 0 y
// `Number("")` también, y 0 es una temperatura perfectamente válida en San
// Martín. Sin estas tres líneas, un campo que Open-Meteo no manda se publica
// como "0°" y parece un dato. Es el mismo bug que ya ofreció alquileres a
// "USD 0" en el buscador.
function grados(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// "Hoy", "mañana", y después el día de la semana. `fecha` viene como
// "2026-09-01" (ya en hora local, porque se pidió con timezone): se le agrega
// el mediodía para que ningún huso la corra un día para atrás.
function nombreDelDia(fecha, indice) {
  if (indice === 0) return "Hoy";
  if (indice === 1) return "Mañana";
  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const nombre = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(d);
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export async function climaSanMartin() {
  let json;
  try {
    const res = await fetch(API, {
      next: { revalidate: CLIMA_REVALIDATE },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    json = await res.json();
  } catch (e) {
    // Timeout, DNS, API caída: no hay clima que dar y no se inventa ninguno.
    console.error("[clima] Open-Meteo no respondió:", e?.message || e);
    return null;
  }

  const temperatura = grados(json?.current?.temperature_2m);
  const sensacion = grados(json?.current?.apparent_temperature);
  const estado = describir(json?.current?.weather_code);
  // Sin temperatura no hay nada que decir; el resto puede faltar.
  if (temperatura === null) return null;

  const d = json?.daily || {};
  const dias = Array.isArray(d.time)
    ? d.time
        .map((fecha, i) => ({
          nombre: nombreDelDia(fecha, i),
          min: grados(d.temperature_2m_min?.[i]),
          max: grados(d.temperature_2m_max?.[i]),
          estado: describir(d.weather_code?.[i]),
        }))
        // Un día al que le falta el nombre o alguna punta no se muestra a medias.
        .filter((x) => x.nombre && x.min !== null && x.max !== null)
        .slice(0, 4)
    : [];

  return {
    ahora: { temperatura, sensacion, estado },
    dias,
    fuente: "Open-Meteo",
  };
}
