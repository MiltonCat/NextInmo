// Capa servidor del tasador: habla con la API del modelo predictivo y normaliza
// lo que entra y lo que sale. Solo servidor — así la URL del modelo, el conteo
// de tasaciones gratis y el muro del correo no viven en el bundle del navegador,
// donde cualquiera los editaría desde la consola.
import "server-only";
import { TASADOR_API_URL } from "@/config";
import { EXTRAS_TASADOR, LIMITES, TIPOS_TASADOR } from "./tasadorOpciones";
import { marcarDegradado } from "./salud";
import { headersTasador } from "./tasadorAuth";

const TIPOS_VALIDOS = new Set(TIPOS_TASADOR.map((t) => t.valor));
const EXTRAS_POR_ID = new Map(EXTRAS_TASADOR.map((e) => [e.id, e]));

// La API vive en Render con plan gratuito: la primera llamada después de un
// rato de inactividad despierta el contenedor y puede tardar bastante. 45 s es
// deliberadamente generoso; la UI muestra mientras tanto un estado de espera
// que explica qué está pasando en vez de un spinner mudo.
// El presupuesto de espera va repartido en dos intentos en vez de uno largo.
//
// Dos motivos. El primero es que una función en Vercel tiene un tope de
// duración propio: 25 + 25 entra cómodo donde 45 + 45 no entraría. El segundo,
// más importante, es que dos intentos cortos le ganan a uno largo justo en el
// caso que falla: cuando el contenedor está arrancando, el primer intento lo
// despierta aunque se corte por tiempo, y el segundo ya lo encuentra en pie.
// Probado contra la API real: intento 1 `modelo_dormido`, intento 2 con
// resultado.
const TIMEOUT_MS = 25_000;
const INTENTOS = 2;

function entero(valor, { min, max }, porDefecto = 0) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(max, Math.max(min, n));
}

// Traduce lo que mandó el formulario al contrato de la API del modelo.
// Devuelve { ok: false, error } en vez de lanzar: los datos vienen de afuera y
// un payload raro es un caso esperable, no una excepción.
export function normalizarEntrada(body = {}) {
  const tipo = String(body.tipo || "").trim();
  if (!TIPOS_VALIDOS.has(tipo)) {
    return { ok: false, error: "tipo_invalido" };
  }

  const barrio = String(body.barrio || "").trim().slice(0, 120);
  if (!barrio) return { ok: false, error: "barrio_requerido" };

  const superficie = Number(body.superficie);
  if (
    !Number.isFinite(superficie) ||
    superficie < LIMITES.superficie.min ||
    superficie > LIMITES.superficie.max
  ) {
    return { ok: false, error: "superficie_invalida" };
  }

  const extrasPedidos = Array.isArray(body.extras) ? body.extras : [];
  const extras = extrasPedidos
    .map((id) => EXTRAS_POR_ID.get(String(id)))
    .filter(Boolean);

  // Los extras sin campo propio en el modelo se concatenan en `descripcion`,
  // que es texto libre que el modelo sí usa como variable.
  const descripcion = extras
    .filter((e) => !e.campo)
    .map((e) => e.frase)
    .join(", ");

  const terrenoBruto = Number(body.superficieTerreno);
  const terreno =
    tipo === "Casa" && Number.isFinite(terrenoBruto) && terrenoBruto > 0
      ? Math.min(LIMITES.terreno.max, terrenoBruto)
      : null;

  return {
    ok: true,
    barrio,
    tipo,
    payload: {
      ciudad: "sma",
      tipo_propiedad: tipo,
      barrio,
      superficie_cubierta: superficie,
      superficie_terreno: terreno,
      dormitorios: entero(body.dormitorios, LIMITES.dormitorios, 2),
      banos: entero(body.banos, LIMITES.banos, 1),
      ambientes: entero(body.ambientes, LIMITES.ambientes, 3),
      cocheras: entero(body.cocheras, LIMITES.cocheras, 0),
      tiene_pileta: extras.some((e) => e.campo === "tiene_pileta"),
      descripcion,
    },
  };
}

// Barrios que el modelo reconoce. Se pide en el servidor y se cachea 24 h: la
// lista solo cambia cuando se reentrena el modelo, y si la API está dormida no
// queremos que la página tarde en pintar. El fallback son los barrios que ya
// tenemos en el JSON de mercado, así el tasador nunca queda sin opciones.
export async function getBarrios() {
  // Ocho segundos y se corta. Sin este límite, una API dormida deja colgada la
  // página ENTERA mientras el servidor espera: la persona ve una pantalla en
  // blanco por algo accesorio, cuando la lista de respaldo ya la tenemos en
  // disco. Es un techo distinto del de /tasar (45 s), donde esperar sí vale la
  // pena porque es lo que la persona vino a buscar.
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), 8_000);

  try {
    const res = await fetch(`${TASADOR_API_URL}/barrios?ciudad=sma`, {
      next: { revalidate: 86_400 },
      headers: headersTasador(),
      signal: controlador.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const barrios = Array.isArray(data?.barrios) ? data.barrios.filter(Boolean) : [];
    if (barrios.length) return barrios;
    throw new Error("lista vacía");
  } catch (err) {
    marcarDegradado("tasador", `no se pudo leer la lista de barrios: ${err?.message || err}`);
    const { M2_POR_BARRIO } = await import("./mercado");
    return M2_POR_BARRIO.filter((b) => b.estado === "usable").map((b) => b.barrio);
  } finally {
    clearTimeout(reloj);
  }
}

// Llama al modelo. Devuelve el resultado ya con nombres en el idioma del resto
// del código, para que ni la API route ni el componente tengan que conocer el
// snake_case de la API de Python.
export async function tasar(payload) {
  let ultima;

  for (let intento = 1; intento <= INTENTOS; intento += 1) {
    ultima = await intentarTasar(payload);
    if (ultima.ok) return ultima;

    // Solo se reintenta el corte por tiempo. Si el modelo rechazó los datos o
    // devolvió un error propio, insistir da exactamente lo mismo y lo único
    // que se consigue es duplicar la espera de la persona.
    if (ultima.error !== "modelo_dormido") return ultima;

    if (intento < INTENTOS) {
      console.warn(`[tasador] intento ${intento} agotado; el contenedor debería estar despertando, reintento`);
    }
  }

  return ultima;
}

// Despierta el contenedor de Render sin pedirle una tasación.
//
// Se llama al abrir el tasador: el formulario son cinco pantallas y arrancar
// el contenedor tarda alrededor de un minuto, así que para cuando la persona
// termina de completarlo el modelo ya está en pie y el resultado sale al
// instante. Es lo que evita que el primer visitante después de un rato de
// inactividad se coma la espera entera.
//
// Nunca lanza: que falle el golpecito no puede romper la página.
export async function despertarModelo() {
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), 50_000);

  try {
    const res = await fetch(`${TASADOR_API_URL}/barrios?ciudad=sma`, {
      headers: headersTasador(),
      signal: controlador.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(reloj);
  }
}

async function intentarTasar(payload) {
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${TASADOR_API_URL}/tasar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headersTasador() },
      body: JSON.stringify(payload),
      signal: controlador.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      // Un 422 significa que el modelo rechazó los datos (barrio desconocido,
      // valor fuera de rango). Se distingue del resto para poder decírselo a la
      // persona en vez de mostrarle "error del servidor".
      return { ok: false, error: res.status === 422 ? "datos_rechazados" : "modelo_caido" };
    }

    const data = await res.json();
    return {
      ok: true,
      resultado: {
        valorTotal: data.valor_total_usd,
        valorM2: data.valor_m2_usd,
        rangoMin: data.rango_min_usd,
        rangoMax: data.rango_max_usd,
        intervaloPct: data.intervalo_pct,
        modelo: data.modelo_usado,
        errorPromedioPct: data.mape_cv ?? null,
        nEntrenamiento: data.n_entrenamiento ?? null,
        advertencias: Array.isArray(data.advertencias) ? data.advertencias : [],
      },
    };
  } catch (err) {
    // AbortError = se acabó el tiempo, casi siempre porque Render estaba dormido.
    const dormido = err?.name === "AbortError";
    console.error("[tasador] falló la llamada al modelo:", err);
    return { ok: false, error: dormido ? "modelo_dormido" : "modelo_caido" };
  } finally {
    clearTimeout(reloj);
  }
}
