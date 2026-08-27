"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { WA_NUMBER } from "@/config";
import AdvisoryProcess from "@/components/AdvisoryProcess";
import InvestorQuiz from "@/components/InvestorQuiz";
import { useAnalytics } from "@/hooks/useAnalytics";
import mercadoJson, {
  EVOLUCION_SERIE,
  MERCADO_GENERADO,
  RELEVADAS_PUBLICO,
  VALOR_M2,
  VALOR_M2_CASA,
  VALOR_M2_DEPTO,
} from "@/lib/mercado";
import { barriosConMediana } from "@/lib/precioZonas";

const InversionesEvolucionChart = dynamic(
  () => import("@/components/InversionesEvolucionChart"),
  // El placeholder tiene que medir lo mismo que el gráfico que reemplaza, o la
  // página salta cuando termina de cargar.
  { ssr: false, loading: () => <div className="h-56 sm:h-80 bg-gray-100 rounded-xl animate-pulse" /> }
);

const InversionesMatrizChart = dynamic(
  () => import("@/components/InversionesMatrizChart"),
  { ssr: false, loading: () => <div className="h-80 sm:h-[26rem] bg-gray-100 rounded-xl animate-pulse" /> }
);

// El m² de referencia del simulador, por tipo de inversión.
//
// Antes era uno solo: `Math.round((VALOR_M2_CASA + VALOR_M2_DEPTO) / 2)` = USD
// 2.689, rotulado en pantalla como "valor mediano actual". No era la mediana de
// nada —es el promedio de dos medianas— y no existía en ninguna otra página del
// sitio. El JSON del modelo incluso trae su propio general ponderado (2.684), y
// su nota al lado dice "preferir por_tipo para publicar".
//
// Se notaba: con USD 150.000 esta página decía "≈ 56 m²" mientras /tasacion
// publicaba 2.085 para casas (72 m²) y 3.292 para departamentos (46 m²). Tres
// respuestas para la misma pregunta, y la única sin respaldo era la de acá.
//
// Ahora cada tipo usa el m² de lo que se está simulando, que son exactamente
// los dos valores que publica /tasacion. "reventa" va con casas porque es lo
// que dice la matriz de riesgo de esta misma página ("Casa reventa").
const M2_SIMULADOR = {
  alquiler: { m2: VALOR_M2_CASA, etiqueta: "casas" },
  turistico: { m2: VALOR_M2_DEPTO, etiqueta: "departamentos" },
  reventa: { m2: VALOR_M2_CASA, etiqueta: "casas" },
};

// Conteo de propiedades relevadas por tipo. Regla de Milton (2026-08-10): los
// valores ACTUALES los da el modelo predictivo; la serie histórica se deja como
// está. Todo lo de acá abajo es "actual", así que sale del JSON y no del
// teclado — que es de donde salían "913 terrenos", "66 locales" y "USD 2.640".
const RELEVADAS_POR_TIPO = mercadoJson.relevadas?.por_tipo ?? {};
const fmtM2 = (v) => `USD ${Number(v).toLocaleString("es-AR")}/m²`;

// Serie de evolución del m². Sale de lib/mercado.js, igual que /precio-m2 y
// /tasacion.
//
// Hasta 2026-08-09 esta página tenía su propia copia escrita a mano que decía
// que el m² había subido ~10% desde 2021, mientras las otras dos decían 57,7%.
// El comentario de la constante vieja incluso pedía "mantenerla alineada con la
// de app/precio-m2/page.js" — que es exactamente lo que nunca pasa cuando hay
// dos copias. Ahora hay una sola.
const EVOLUCION_HISTORICA = EVOLUCION_SERIE.map((p) => ({
  anio: p.anio,
  precio: p.usd_m2,
  variacion: p.variacion_pct,
  contexto: p.descripcion,
  fuente: "Relevamiento propio",
}));

// Rendimientos por segmento. Los porcentajes salen del modelo; el precio de
// referencia y el alquiler estimado se mantienen acá porque el export todavía
// no los trae. Los segmentos coinciden uno a uno con la tabla del JSON.
const PRECIOS_SEGMENTO = {
  "Depto 1 dorm": { precioVenta: 95000, alquiler: 650 },
  "Depto 2 dorm": { precioVenta: 185000, alquiler: 950 },
  "Casa 2 dorm": { precioVenta: 210000, alquiler: 1400 },
  "Casa 3 dorm": { precioVenta: 330000, alquiler: 1800 },
  "Casa 4 dorm": { precioVenta: 490000, alquiler: 2500 },
};

const RENTALS = (mercadoJson.rentabilidad_alquiler?.tabla ?? [])
  .filter((r) => PRECIOS_SEGMENTO[r.segmento])
  .map((r) => ({
    tipo: `${r.segmento} (${r.superficie_m2}m²)`,
    rentabilidad: r.rentabilidad_anual_pct,
    ...PRECIOS_SEGMENTO[r.segmento],
  }));

// --- Supuestos del simulador (se muestran también al usuario, al pie de la calculadora) ---
//
// Vivían más abajo, pegados al motor del simulador. Subieron acá porque desde
// el 11-ago la matriz de riesgo/retorno también los usa: son los supuestos de
// la página, no los de un componente.
const COSTOS_ENTRADA = 0.06;       // escritura, honorarios, comisión e impuestos de adquisición
const COSTOS_SALIDA = 0.04;        // comisión, impuestos y gastos al vender
const GASTOS_ALQUILER = 0.30;      // vacancia, mantenimiento, impuestos y administración
const GASTOS_TURISTICO = 0.45;     // suma equipamiento, plataformas, limpieza y mayor vacancia
const EQUIPAMIENTO_TURISTICO = 0.05;
const RENTA_BRUTA_TURISTICO = 10;  // referencia conservadora; antes era 12 % fijo
const REFORMA_REVENTA = 0.08;      // capital reservado para poner en valor
const MARGEN_REVENTA = 0.15;       // mejora sobre el precio, una sola vez al vender

// Valorización anual del m²: crecimiento compuesto de los últimos dos puntos de
// la serie (2.450 → 2.650 = 4,0%). El simulador la calculaba adentro de su
// useMemo; ahora se calcula una sola vez y la usan los dos, que era la
// condición para que la matriz no pueda volver a decir otra cosa.
const VALORIZACION_ANUAL =
  (Math.pow(
    EVOLUCION_HISTORICA[EVOLUCION_HISTORICA.length - 1].precio /
      EVOLUCION_HISTORICA[EVOLUCION_HISTORICA.length - 3].precio,
    1 / 2
  ) - 1) * 100;

// La evolución reciente fue cercana al 4 %, pero proyectarla completa hacia
// adelante convertía un dato histórico en promesa. El simulador usa 2 % como
// escenario base; el 4 % queda publicado solo como antecedente de mercado.
const VALORIZACION_PROYECTADA = 2;

// Renta bruta media del alquiler permanente, sobre los mismos segmentos que
// publica la tabla de rentabilidad. El simulador elige el segmento más cercano
// al monto que escribe la persona; la matriz no tiene monto, así que promedia.
const RENTA_BRUTA_ALQUILER =
  RENTALS.reduce((a, r) => a + r.rentabilidad, 0) / (RENTALS.length || 1);

const PESOS = { Demanda: 0.35, Liquidez: 0.20, 'Revalorización': 0.30, Estabilidad: 0.15 };

const scoreLabel = (score) => {
  if (score >= 80) return { texto: "Muy favorable", color: "text-emerald-600 bg-green-500/10 border-green-500/30" };
  if (score >= 70) return { texto: "Favorable", color: "text-primary-600 bg-primary-500/10 border-primary-500/30" };
  if (score >= 60) return { texto: "Moderado", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  return { texto: "Bajo potencial", color: "text-gray-500 bg-gray-500/10 border-gray-500/30" };
};

const FACTOR_SIMPLE = {
  Demanda: '¿Cuánta gente lo quiere?',
  Liquidez: '¿Qué tan fácil es vender?',
  'Revalorización': '¿Cuánto subió su precio?',
  Estabilidad: '¿Genera ingresos regulares?',
};

function calcularScore(factores) {
  return Math.round(factores.reduce((acc, f) => acc + f.valor * (PESOS[f.nombre] ?? 0), 0));
}

const SCORE_DATA = [
  {
    tipo: 'Depto turístico', riesgo: 'Dinámico',
    riesgoColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    acento: 'from-amber-500 to-orange-400',
    factores: [
      { nombre: 'Demanda', valor: 90, fuente: 'Airbnb SMA: rating 4.9/5 · alta ocupación en temporadas' },
      { nombre: 'Liquidez', valor: 75, fuente: 'Mercado de alquiler turístico activo · salida vía plataformas' },
      { nombre: 'Revalorización', valor: 85, fuente: `${fmtM2(VALOR_M2_DEPTO)} para departamentos · relevamiento propio` },
      { nombre: 'Estabilidad', valor: 60, fuente: 'Ingresos estacionales: pico en ski (jul) y trekking (ene)' },
    ],
    descripcion: 'Es lo que más rinde, pero el ingreso varía: fuerte en temporada de ski y verano, más flojo el resto del año.',
  },
  {
    tipo: 'Casa alquiler', riesgo: 'Moderado',
    riesgoColor: 'text-primary-600 bg-primary-500/10 border-primary-500/20',
    acento: 'from-primary-500 to-pink-500',
    factores: [
      // Decía "Solo 49 propiedades en alquiler relevadas". Ese número no está
      // en el modelo ni puede estarlo: el relevamiento cubre avisos de VENTA,
      // no de alquiler. No se reemplazó por otro, se dice qué mide el dato.
      { nombre: 'Demanda', valor: 75, fuente: `${RELEVADAS_POR_TIPO.Casa} casas relevadas en venta · oferta acotada para el tamaño del mercado` },
      { nombre: 'Liquidez', valor: 55, fuente: 'Mercado de reventa moderado · stock disponible reducido' },
      { nombre: 'Revalorización', valor: 80, fuente: `${fmtM2(VALOR_M2_CASA)} para casas · relevamiento propio` },
      { nombre: 'Estabilidad', valor: 82, fuente: 'Alquiler residencial USD · ingreso mensual predecible (USD 1.200+)' },
    ],
    descripcion: 'Cobrás alquiler todos los meses y la propiedad sube de valor con los años. La opción más tranquila para empezar.',
  },
  // TERRENO SE SACÓ DE ACÁ (2026-08-10, decisión de Milton).
  //
  // El sitio ya había tomado esta decisión en otra página y esta no se había
  // enterado: `/precio-m2` no publica Terreno, y lo dice por escrito —para
  // Cabaña, Local Comercial, Terreno y Oficina el modelo no exporta el `n`, así
  // que no se sabe sobre cuántas propiedades salió cada mediana, y quedan
  // fuera—. El modelo se entrena solo con Casa y Departamento.
  //
  // Acá, en cambio, Terreno tenía tarjeta completa con puntaje sobre cuatro
  // factores. Y el dato que sostenía el primero decía "913 terrenos en venta
  // relevados" cuando el relevamiento tiene 116: no era un número desactualizado
  // sino uno que el propio sitio contradice, y encima era el que justificaba el
  // puntaje de demanda ("alta oferta = absorción lenta").
  //
  // Un tipo de propiedad que el modelo no puede medir no puede tener un puntaje
  // del 1 al 100 en una tabla que se presenta como derivada del relevamiento.
  {
    tipo: 'Local comercial', riesgo: 'Moderado',
    riesgoColor: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
    acento: 'from-sky-500 to-cyan-400',
    factores: [
      { nombre: 'Demanda', valor: 65, fuente: `${RELEVADAS_POR_TIPO['Local Comercial']} locales relevados en total · mercado acotado pero activo` },
      { nombre: 'Liquidez', valor: 58, fuente: 'Compradores de nicho · precio medio USD 350.000' },
      // Decía "+21.8% vs ene 2025 · USD 2.640/m² (ene 2026)". Los dos números
      // estaban escritos a mano y ninguno coincidía: el modelo da USD 2.900/m²
      // para Local Comercial, y esa variación interanual no existe en el
      // export. Ahora el m² sale del modelo y la variación se sacó, porque no
      // hay de dónde calcularla.
      { nombre: 'Revalorización', valor: 88, fuente: `${fmtM2(VALOR_M2['Local Comercial'])} para locales · relevamiento propio` },
      { nombre: 'Estabilidad', valor: 70, fuente: 'Depende del ciclo económico · sostenido por turismo en SMA' },
    ],
    // "Es lo que más subió de precio en el último año" se apoyaba en el
    // "+21,8% vs ene 2025" que se acaba de sacar por no tener respaldo. Sin ese
    // número la frase queda sola, y el modelo no trae variación interanual por
    // tipo, así que no hay con qué sostenerla. Se reemplaza por lo que el
    // relevamiento sí dice.
    descripcion: 'Mercado chico y de compradores específicos. La renta depende de cómo venga la economía y el turismo local.',
  },
];

// Terreno sale también de acá, por lo mismo: si no está en la comparativa
// porque el modelo no puede medirlo, no puede estar en el gráfico de al lado
// con un riesgo de 1,8 y un retorno del 5 % escritos a mano. Las dos cosas son
// la misma afirmación en dos formatos.
//
// El eje de retorno se calcula desde el 11-ago (decisión de Milton); antes
// estaba escrito a mano y decía otra cosa que el simulador de esta misma
// página:
//
//   Casa alquiler   7 %  →  el simulador daba 9,6 %
//   Casa reventa    14 % →  el simulador daba 11,0 %
//   Depto turístico 18 % →  el simulador daba 13,6 %
//
// No eran números viejos: eran números de otro lado. Un visitante que hacía el
// test, miraba la matriz y después movía el simulador recibía dos respuestas
// distintas a la misma pregunta en la misma pantalla, y la que tenía respaldo
// era siempre la más baja. Es el mismo problema que la serie del m² duplicada
// que se unificó el 9-ago: el arreglo no es corregir los números sino sacarlos
// del mismo lugar, para que no puedan volver a separarse.
//
// Local comercial se cae del gráfico. Su 9 % tampoco tenía origen, y esta vez
// no hay de dónde sacarlo: `rentabilidad_alquiler` del modelo cubre deptos y
// casas, no locales, así que no existe el número de renta que haría falta para
// ubicarlo en el eje. Mantiene su tarjeta en la comparativa, que puntúa cuatro
// factores que sí tienen fuente —incluido el m² de locales— y no promete un
// retorno anual. Es la regla que ya se le aplicó a Terreno el 10-ago.
const retornoCaja = (rentaBruta, gastos) =>
  Math.round(rentaBruta * (1 - gastos) * 10) / 10;

const MATRIX_DATA = [
  { nombre: 'Casa alquiler', riesgo: 3.5, retorno: retornoCaja(RENTA_BRUTA_ALQUILER, GASTOS_ALQUILER), color: '#E8325A' },
  {
    nombre: 'Casa reventa',
    riesgo: 6.5,
    // La reventa no paga renta: el retorno es la valorización más el margen por
    // comprar bien y mejorar, igual que en el simulador.
    retorno: 4,
    color: '#f59e0b',
  },
  { nombre: 'Depto turístico', riesgo: 7.5, retorno: retornoCaja(RENTA_BRUTA_TURISTICO, GASTOS_TURISTICO), color: '#f97316' },
];

// Conecta el resultado del quiz con el resto de la página: qué tarjeta de la
// comparativa resaltar y con qué tipo preconfigurar el simulador.
//
// Cerrado el 2026-08-11 (decisión de Milton). Venía marcado como PENDIENTE
// desde el 10-ago: al sacar Terreno de la comparativa, el conservador quedó con
// `card: null` y `calc: null` —terminaba el test y la página no reaccionaba,
// sin error y sin aviso— mientras el quiz le seguía recomendando terrenos.
//
// La salida no fue devolver Terreno sino alinear los tres perfiles con las tres
// estrategias que la página sí mide, ordenadas por riesgo igual que la matriz
// de acá abajo y con las mismas tres opciones que ya tenía el simulador. El
// detalle de por qué cada perfil recibe lo que recibe está en el comentario de
// PERFILES, en components/InvestorQuiz.jsx.
//
// `moderado.card` queda en null a propósito, y es el único que sigue así: la
// reventa está en MATRIX_DATA pero no tiene tarjeta en SCORE_DATA, así que no
// hay nada que resaltar. El null es literal —no hay tarjeta—, a diferencia de
// un string que no matchea, que es un bug esperando. El moderado igual
// preconfigura el simulador en "reventa", que es el gesto que más se nota.
//
// Y no va a tenerla: se evaluó agregarla el 11-ago y se descartó. "Casa
// reventa" es el mismo activo que "Casa alquiler" —el modelo tiene un solo
// número para casas— así que demanda, liquidez y revalorización serían
// idénticas (75, 55, 80) y lo único que cambiaría es estabilidad, donde la
// reventa es peor porque no paga renta. Da 65/100: última de las cuatro, no por
// ser peor inversión (la matriz le da 11% contra 9,6% del alquiler) sino porque
// ninguno de los cuatro factores puede ver el margen de reventa, que es lo que
// hace que la estrategia valga la pena.
//
// El fondo: SCORE_DATA compara tipos de propiedad —qué comprar— y la reventa es
// qué hacer con lo comprado. Meterlas en la misma tabla le pone puntaje a dos
// preguntas distintas. Si alguna vez hay que resolverlo, es cambiando qué mide
// la comparativa, no agregando una fila.
const PERFIL_MAP = {
  conservador: { card: "Casa alquiler", calc: "alquiler", label: "Conservador" },
  moderado: { card: null, calc: "reventa", label: "Moderado" },
  agresivo: { card: "Depto turístico", calc: "turistico", label: "Dinámico" },
};

// Etiqueta de confianza. Mismo criterio que app/precio-m2/page.js.
//
// Acá solo hace falta una: los dos bloques que la usan —la serie de evolución y
// la tabla de rentabilidad— están marcados `referencia_curada` en el JSON del
// modelo, o sea que se cargan a mano y no salen del relevamiento. La etiqueta
// verde de "dato propio" no corresponde en ninguno de los dos, y ponerla igual
// sería justo el error que se corrigió en /precio-m2.
const BADGES = {
  estimado: { label: "Referencia de mercado", cls: "border-amber-200 text-amber-700", dot: "bg-amber-500" },
};

// ─── Tipografía compartida ──────────────────────────────────────────────────
//
// Las mismas tres primitivas que usan /tasacion y /precio-m2. Existen para que
// el lenguaje no dependa de que alguien se acuerde de copiar la clase correcta:
// esta página tenía `text-2xl font-semibold` en un título, `text-lg` en otro y
// `text-base sm:text-lg` en un tercero, todos con el mismo rol.
//
// La escala va en píxeles y no en `text-2xl/3xl` porque los saltos de Tailwind
// son demasiado grandes para lo que necesita una página con mucho dato: entre
// text-xl (20px) y text-2xl (24px) no hay nada, y el título de sección quiere
// 26px. El tracking negativo es lo que hace que un semibold grande se lea
// asentado en vez de inflado.

function Antetitulo({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{children}</p>
  );
}

function TituloSeccion({ id, children }) {
  return (
    <h2
      id={id}
      className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900 md:text-[34px]"
    >
      {children}
    </h2>
  );
}

function Subtitulo({ children }) {
  return (
    <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">{children}</p>
  );
}

// Encabezado de sección con la foto al lado, alternando el lado en cada
// sección. Es el patrón de las páginas de "cómo funciona" de Airbnb, a pedido
// de Milton, y reemplaza a la banda apaisada de ancho completo que había antes.
//
// Por qué es mejor acá: la banda partía la página en dos —título, foto, datos—
// y metía 400 px de stock entre lo que la persona acababa de leer y el número
// que venía a buscar. Al costado, la foto ocupa un espacio que en desktop
// estaba vacío (el texto de encabezado nunca pasa de media caja) y no empuja
// nada hacia abajo.
//
// `lg:` y no `md:` porque a 768 px dos columnas dejan el título en cuatro
// palabras por línea.
//
// En móvil la foto va **debajo** del texto, no arriba: el orden natural del DOM
// pondría la imagen primero y lo primero de una sección tiene que ser de qué
// trata, no una foto de archivo. De ahí el `order`.
//
// `objectPosition` va por foto porque un `center` parejo le corta la cabeza a
// la mujer de grafico1, que está arriba a la derecha.
function SeccionConFoto({ src, alt, objectPosition = "center", ladoFoto = "izquierda", children }) {
  const fotoPrimero = ladoFoto === "izquierda";
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={`order-2 ${fotoPrimero ? "lg:order-1" : "lg:order-2"}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 lg:aspect-[3/2]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            style={{ objectPosition }}
          />
        </div>
      </div>
      <div className={`order-1 ${fotoPrimero ? "lg:order-2" : "lg:order-1"}`}>{children}</div>
    </div>
  );
}

function Badge({ tipo, className = "" }) {
  const b = BADGES[tipo];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${b.cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
      {b.label}
    </span>
  );
}

const TASA_PLAZO_FIJO = 0.01;     // plazo fijo en dólares en bancos argentinos (~0,5–2% anual)

const fmtPct = (v) => v.toLocaleString("es-AR", { maximumFractionDigits: 1 });

// Límites del monto del simulador. El campo se escribe libremente, así que hay
// que acotarlo: sin tope, un cero de más manda el resultado a cifras que no
// significan nada, y un campo vacío rompe la cuenta con NaN.
const MONTO_MIN = 10000;
const MONTO_MAX = 2000000;

// Solo el número, sin acotar. Acepta "150.000" y "USD 150000".
const leerMonto = (v) => {
  const n = Number.parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

// OJO: el mínimo NO se aplica mientras la persona tipea, solo al salir del
// campo. Si se acotara en cada tecla, borrar el contenido para escribir otro
// monto sería imposible: al teclear el primer dígito ("1") el campo saltaría
// solo a 10.000 y le movería el cursor. Durante el tipeo se acota únicamente
// el máximo, que es el que puede romper la cuenta.
const acotarMonto = (v) => Math.min(MONTO_MAX, Math.max(MONTO_MIN, v));

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// "2026-07-03" → "3 Julio 2026". Sin new Date() a propósito: el parseo por zona
// horaria puede correr un día entre servidor y cliente y romper la hidratación.
function formatearFechaISO(iso) {
  const [anio, mes, dia] = (iso || "").split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

// Todo lo que esta página publica sale de lib/mercado.js, o sea del export del
// modelo (app/data/mercado_sma.json). Es la misma fuente que /tasacion y
// /precio-m2.
//
// Hasta el 2026-08-10 esta página consumía además la API en vivo del modelo y
// con eso pisaba el último punto de la serie, el m² de referencia y la fecha.
// Se sacó, y no fue por simplificar: la API está MÁS VIEJA que el export.
// Devuelve el relevamiento del 17-jul sobre 956 propiedades; el JSON es del
// 6-ago sobre 1.597. En casas la brecha es del 16 % (USD 1.797 contra 2.085).
//
// El efecto estaba en producción: esta página publicaba "+56,9 %" mientras
// /tasacion y /precio-m2 publicaban "+57,7 %" sobre la misma serie, y el
// reporte descargable salía fechado tres semanas antes que el resto del sitio.
//
// Para volver a datos en vivo hay que reexportar y redeployar el modelo. Y
// cuando pase, el lugar donde enchufarlo es lib/mercado.js —uno solo, del que
// cuelgan las tres páginas— y no acá: una página con su propia fuente es
// exactamente cómo se llegó a este problema.
export default function InversionesClient() {
  const [activeTab, setActiveTab] = useState("zonas");
  const [calcMonto, setCalcMonto] = useState(150000);
  // Lo que se ve en el campo mientras se tipea, separado del monto con el que
  // se calcula. Son dos cosas distintas: el campo puede estar a medio escribir
  // ("13") sin que el resultado salte a valores absurdos en cada tecla.
  const [montoTexto, setMontoTexto] = useState("150000");
  const [calcPlazo, setCalcPlazo] = useState(5);
  const [calcTipo, setCalcTipo] = useState("alquiler");
  const [leadName, setLeadName] = useState("");
  const [leadWa, setLeadWa] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [perfilQuiz, setPerfilQuiz] = useState(null);
  const { trackEvent, trackWhatsAppClick } = useAnalytics();

  const handleQuizResultado = (perfilKey) => {
    const mapa = PERFIL_MAP[perfilKey];
    if (!mapa) return;
    setPerfilQuiz(perfilKey);
    if (mapa.calc) setCalcTipo(mapa.calc);
  };

  const irA = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Dos destinos distintos, y no da lo mismo cuál:
  //   - el quiz manda a #simulador, que es donde están los controles. Acaba de
  //     preconfigurar el tipo de inversión; mandarlo al desglose lo dejaría
  //     mirando un resultado sin ver qué se cambió.
  //   - el botón del hero manda a #calculadora, el desglose, que es lo que pidió.
  const handleVerSimulador = () => irA("simulador");
  const handleVerDetalle = () => irA("calculadora");

  const cardRecomendada = perfilQuiz ? PERFIL_MAP[perfilQuiz].card : null;

  const fechaDatos = formatearFechaISO(MERCADO_GENERADO);
  // La cifra pública y redondeada, la misma que /tasacion y /precio-m2. Si esta
  // página mostrara el conteo exacto mientras el resto dice "más de 1.500", el
  // visitante no ve dos métricas, ve una contradicción.
  const totalPropiedades = RELEVADAS_PUBLICO;

  // La serie tal cual la exporta el modelo, sin pisar el último punto.
  const evolucion = EVOLUCION_HISTORICA;
  const primerPunto = evolucion[0];
  const ultimoPunto = evolucion[evolucion.length - 1];
  const crecimientoPct = Math.round((ultimoPunto.precio / primerPunto.precio - 1) * 1000) / 10;

  // Motor financiero: `calcMonto` es todo el capital disponible, no el precio
  // de cartel. Primero separa costos de entrada, equipamiento o reforma; recién
  // el resto compra el inmueble. La renta y la venta se calculan sobre ese
  // precio real, y la salida descuenta sus propios costos.
  const sim = useMemo(() => {
    const esReventa = calcTipo === "reventa";
    const gastosOperativos = calcTipo === "turistico" ? GASTOS_TURISTICO : GASTOS_ALQUILER;
    const costoAdicional = esReventa
      ? REFORMA_REVENTA
      : calcTipo === "turistico"
        ? EQUIPAMIENTO_TURISTICO
        : 0;
    const precioPropiedad = calcMonto / (1 + COSTOS_ENTRADA + costoAdicional);
    const costosIniciales = calcMonto - precioPropiedad;

    let rentaBruta = 0;
    if (calcTipo === "alquiler") {
      const cercana = RENTALS.reduce((a, b) =>
        Math.abs(b.precioVenta - precioPropiedad) < Math.abs(a.precioVenta - precioPropiedad) ? b : a
      );
      rentaBruta = cercana.rentabilidad;
    } else if (calcTipo === "turistico") {
      rentaBruta = RENTA_BRUTA_TURISTICO;
    }
    const rentaNeta = rentaBruta * (1 - gastosOperativos);
    const rentaAnual = precioPropiedad * (rentaNeta / 100);
    const rentaAcumulada = esReventa ? 0 : rentaAnual * calcPlazo;
    const mensual = esReventa ? 0 : rentaAnual / 12;

    const valorizacion = VALORIZACION_PROYECTADA;
    const valorMercadoFinal = precioPropiedad * Math.pow(1 + valorizacion / 100, calcPlazo);
    // En reventa, la mejora agrega margen una sola vez. Antes se sumaba a una
    // tasa anual y se componía cada año, aunque la obra se hace una vez.
    const precioVentaBruto = esReventa
      ? valorMercadoFinal * (1 + MARGEN_REVENTA)
      : valorMercadoFinal;
    const costosSalida = precioVentaBruto * COSTOS_SALIDA;
    const ventaNeta = precioVentaBruto - costosSalida;
    const total = ventaNeta + rentaAcumulada;
    const ganancia = total - calcMonto;
    const totalAnual = (Math.pow(Math.max(total, 1) / calcMonto, 1 / calcPlazo) - 1) * 100;
    const rentaSobreCapital = esReventa ? 0 : (rentaAnual / calcMonto) * 100;

    // El m² del tipo que se está simulando, no un promedio de los dos.
    const { m2: m2Ref, etiqueta: m2Etiqueta } = M2_SIMULADOR[calcTipo] ?? M2_SIMULADOR.alquiler;

    return {
      esReventa, rentaBruta, rentaNeta, valorizacion, totalAnual, rentaSobreCapital,
      rentaAcumulada, ganancia, total, mensual, precioPropiedad, costosIniciales,
      costosSalida, ventaNeta, valorMercadoFinal, gastosOperativos, costoAdicional,
      m2Ref, m2Etiqueta, m2Comprables: Math.round(precioPropiedad / m2Ref),
      plazoFijoTotal: calcMonto * Math.pow(1 + TASA_PLAZO_FIJO, calcPlazo),
    };
  }, [calcTipo, calcMonto, calcPlazo]);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadName.trim() || !leadWa.trim()) return;
    const tipoLabel = calcTipo === "alquiler" ? "Alquiler" : calcTipo === "turistico" ? "Turístico" : "Reventa";
    const msg = encodeURIComponent(
      `Hola Milton, soy ${leadName.trim()}. Usé la calculadora de inversiones y quiero recibir una propuesta personalizada.\n\n` +
      `📊 Mi simulación:\n` +
      `• Monto: USD ${calcMonto.toLocaleString("es-AR")}\n` +
      `• Tipo: ${tipoLabel}\n` +
      `• Plazo: ${calcPlazo} año${calcPlazo > 1 ? "s" : ""}\n` +
      `• Retorno anualizado estimado: ${fmtPct(sim.totalAnual)}%\n` +
      (sim.esReventa ? "" : `• Renta neta mensual estimada: USD ${Math.round(sim.mensual).toLocaleString("es-AR")}\n`) +
      `• Ganancia total estimada: USD ${Math.round(sim.ganancia).toLocaleString("es-AR")}\n\n` +
      `Mi WhatsApp: ${leadWa.trim()}`
    );
    trackEvent("generate_lead", {
      inquiry_type: "inversion",
      investment_type: calcTipo,
      amount: calcMonto,
    });
    trackWhatsAppClick(null, "inversiones_calculadora");
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    setLeadSent(true);
  };

  const scoredAssets = useMemo(
    () => SCORE_DATA.map((activo) => ({ ...activo, score: calcularScore(activo.factores) })).sort((a, b) => b.score - a.score),
    []
  );
  const bestAsset = scoredAssets[0];

  const downloadReportTxt = () => {
    const currentDate = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    // Vía barriosConMediana(): el reporte armaba las filas con `z.tipo`, un
    // campo que `por_barrio` no tiene, así que cada línea salía con un
    // "undefined" en el medio. Y no filtraba "General" —las publicaciones sin
    // barrio declarado—, que aparecía como si fuera un barrio de San Martín.
    const filasZonas = barriosConMediana().map(
      (b) => `${b.nombre} | USD ${b.medianaM2.toLocaleString("es-AR")}/m² (mediana sobre ${b.n} propiedades)`
    );
    // Una sola línea de fuente, con la fecha del export. Antes había dos según
    // si la API había contestado, y la de la API traía su propia fecha: el TXT
    // salía fechado tres semanas antes que la página desde la que se descargó.
    const fuentes = `Fuente: relevamiento propio de la oferta publicada, procesado por nuestro modelo (datos al ${fechaDatos})`;
    const dataText = `VALORES POR M² - SAN MARTÍN DE LOS ANDES\n${"=".repeat(45)}\nFecha: ${currentDate}\n\n${filasZonas.join("\n")}\n\nEVOLUCIÓN HISTÓRICA (USD/m²)\n${"=".repeat(45)}\n${evolucion.map((item) => `${item.anio}: $${item.precio}/m² ${item.variacion ? `(+${item.variacion}%)` : ""} - ${item.contexto}`).join("\n")}\n\n${fuentes}`.trim();
    const blob = new Blob([dataText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CatalanPropiedades-Valores-SMA-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero sobre blanco, sin grilla ni degradado de fondo. El peso lo lleva
          la tipografía —grande, semibold, tracking cerrado— y el aire, igual
          que en /tasacion y /precio-m2. */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-20 lg:px-8">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Inversiones · San Martín de los Andes
        </span>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-2xl text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-gray-900 md:text-[52px]">
              Invertí mejor en <span className="text-primary-600">San Martín de los Andes</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
              No solo publicamos propiedades. Analizamos el mercado para ayudarte a tomar mejores
              decisiones de inversión, con datos de acá y no promedios nacionales.
            </p>
          </div>

          <button
            onClick={downloadReportTxt}
            className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 lg:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar reporte
          </button>
        </div>

        {/* Las métricas en hairline y no en tarjetas: son el respaldo de lo que
            dice el título, no tres botones. Encajonarlas les da un peso que no
            les toca — es el mismo tratamiento de /tasacion y /precio-m2. */}
        <div className="mt-10 grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 py-5">
          {[
            { valor: totalPropiedades, label: "propiedades relevadas en San Martín" },
            // La fecha del export, siempre. Decía "Semanal" cuando la API
            // contestaba, que era una promesa de frecuencia y no un dato: la
            // API llevaba tres semanas devolviendo el mismo relevamiento.
            { valor: fechaDatos, label: "última actualización de los datos" },
            { valor: "Solo SMA", label: "sin promedios nacionales de por medio" },
          ].map((item, i) => (
            <div key={item.label} className={i === 0 ? "pr-4" : "px-4"}>
              <p className="text-lg font-semibold leading-tight text-gray-900 tabular-nums md:text-xl">
                {item.valor}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 md:text-xs">{item.label}</p>
            </div>
          ))}
        </div>

        {/* El simulador vive acá arriba, no a mitad de página.

            Antes estaba en la posición 7 —después del quiz, la comparativa de
            activos, dos gráficos y la matriz de riesgo—, así que el visitante
            recorría media página de datos sobre el mercado antes de ver un
            número sobre SU plata. Las tres métricas de arriba son respaldo:
            hablan de nosotros (cuántas propiedades relevamos, cada cuánto
            actualizamos). Esta caja es lo primero que habla de él.

            El desglose completo —de dónde sale la ganancia, la comparativa
            contra plazo fijo, los supuestos— sigue estando, más abajo, en
            #calculadora. Acá va un número y el detalle aparece si lo pide. */}
        <div id="simulador" className="mt-8 rounded-2xl border border-gray-200 p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Simulá tu inversión
          </p>

          {perfilQuiz && PERFIL_MAP[perfilQuiz].calc === calcTipo && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
              <p className="text-xs font-medium text-emerald-600">
                Preconfigurada con el tipo de inversión recomendado para tu perfil{" "}
                {PERFIL_MAP[perfilQuiz].label}
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
            {/* El monto se escribe. Antes era un <select> de montos fijos
                (25K, 50K, 75K…): seguías eligiendo de una lista de montos
                ajenos. El slider está para mover el número rápido, pero el
                que manda es el campo — si tenés USD 137.000, ponés 137.000. */}
            <div>
              <label htmlFor="sim-monto" className="block text-xs font-medium text-gray-500">
                Cuánto querés invertir (USD)
              </label>
              <input
                id="sim-monto"
                type="number"
                inputMode="numeric"
                min={MONTO_MIN}
                max={MONTO_MAX}
                step={5000}
                value={montoTexto}
                onChange={(e) => {
                  setMontoTexto(e.target.value);
                  const n = leerMonto(e.target.value);
                  // Sin mínimo acá: el mínimo llega en el blur. Ver el
                  // comentario de acotarMonto.
                  if (n !== null && n > 0) setCalcMonto(Math.min(MONTO_MAX, n));
                }}
                onBlur={() => {
                  const n = acotarMonto(leerMonto(montoTexto) ?? MONTO_MIN);
                  setCalcMonto(n);
                  setMontoTexto(String(n));
                }}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-900 tabular-nums outline-none transition-colors focus:border-gray-900"
              />
              <input
                type="range"
                aria-label="Monto a invertir"
                min={MONTO_MIN}
                max={MONTO_MAX}
                step={5000}
                value={calcMonto}
                onChange={(e) => {
                  const n = acotarMonto(Number(e.target.value));
                  setCalcMonto(n);
                  setMontoTexto(String(n));
                }}
                className="mt-3 w-full accent-primary-600"
              />
            </div>

            <div>
              <label htmlFor="sim-tipo" className="block text-xs font-medium text-gray-500">
                Tipo
              </label>
              <select
                id="sim-tipo"
                value={calcTipo}
                onChange={(e) => setCalcTipo(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-gray-900"
              >
                <option value="alquiler">Alquiler</option>
                <option value="turistico">Turístico</option>
                <option value="reventa">Reventa</option>
              </select>
            </div>

            <div>
              <label htmlFor="sim-plazo" className="block text-xs font-medium text-gray-500">
                Plazo
              </label>
              <select
                id="sim-plazo"
                value={calcPlazo}
                onChange={(e) => setCalcPlazo(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-gray-900"
              >
                {[1, 3, 5, 10].map((a) => (
                  <option key={a} value={a}>
                    {a} año{a > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* UN número, no cuatro tarjetas de colores. El resto del desglose
              está abajo para quien lo quiera. */}
          <div className="mt-6 border-t border-gray-100 pt-6" aria-live="polite">
            <p className="text-[34px] font-semibold leading-none tracking-[-0.025em] text-gray-900 tabular-nums md:text-[44px]">
              USD {Math.round(sim.total).toLocaleString("es-AR")}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
              Es con lo que terminarías en {calcPlazo} año{calcPlazo > 1 ? "s" : ""} si invertís{" "}
              <strong className="font-medium text-gray-900">
                USD {calcMonto.toLocaleString("es-AR")}
              </strong>{" "}
              en{" "}
              {calcTipo === "alquiler"
                ? "una propiedad para alquiler permanente"
                : calcTipo === "turistico"
                  ? "alquiler turístico"
                  : "compra y reventa"}
              {sim.esReventa ? (
                <>. La ganancia viene de comprar bien, mejorar y revender: no genera renta mensual.</>
              ) : (
                <>
                  : unos{" "}
                  <strong className="font-medium text-gray-900">
                    USD {Math.round(sim.mensual).toLocaleString("es-AR")} por mes
                  </strong>{" "}
                  de renta neta, más la suba de valor de la propiedad.
                </>
              )}{" "}
              El retorno anualizado estimado, después de costos de entrada y salida, es {fmtPct(sim.totalAnual)}%.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleVerDetalle}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Ver de dónde sale ese número
                <span aria-hidden="true">↓</span>
              </button>
              <span className="text-sm text-gray-400">
                Descontando costos iniciales, el capital alcanza para ≈ {sim.m2Comprables} m² al valor
                mediano de {sim.m2Etiqueta}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Las estimaciones de esta página son orientativas: no constituyen tasación profesional,
          asesoramiento financiero ni garantía de rentabilidad.
        </p>
      </section>

      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 md:py-12 lg:px-8">

          {/* Test de perfil inversor */}
          <div className="mb-8">
            <InvestorQuiz onResultado={handleQuizResultado} onVerSimulador={handleVerSimulador} />
          </div>

          {/* ¿Qué conviene comprar?

              Sin caja, sin sombra y sin gradientes. Los puntajes venían con
              `text-transparent bg-clip-text bg-gradient-to-br`: un número
              degradado no se lee más rápido, se lee peor, y encima cada tipo
              tenía su propio color, así que cuatro cifras comparables entre sí
              se veían como cuatro cosas distintas. Ahora las cuatro son del
              mismo gris y lo que las diferencia es el número. */}
          <section aria-labelledby="activos" className="mb-12 border-t border-gray-100 pt-10">
            <SeccionConFoto
              src="/grafico3.webp"
              alt="Dos personas señalando un informe con gráficos de barras sobre una mesa de trabajo"
              ladoFoto="izquierda"
            >
              <Antetitulo>Comparativa de activos</Antetitulo>
              <TituloSeccion id="activos">¿Qué tipo de propiedad puede convenirte?</TituloSeccion>
              <Subtitulo>
                Analizamos cuatro preguntas clave del mercado para cada tipo de propiedad. El puntaje
                las resume en un número del 1 al 100: a mayor puntaje, mejor posicionado está ese tipo
                de inversión según los datos actuales de San Martín de los Andes.
              </Subtitulo>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(FACTOR_SIMPLE).map(([key, simple]) => (
                  <span key={key} className="text-xs text-gray-400">{simple}</span>
                ))}
              </div>
            </SeccionConFoto>

            {/* Tres columnas, no cuatro: al sacar Terreno la grilla quedaba con
                un hueco a la derecha. */}
            <div className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {SCORE_DATA.map((activo) => {
                const score = calcularScore(activo.factores);
                const esMejor = score === bestAsset.score;
                return (
                  <div key={activo.tipo} className="flex flex-col border-t border-gray-100 py-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[15px] font-medium leading-tight text-gray-900">{activo.tipo}</h3>
                      <p className="text-[26px] font-semibold leading-none text-gray-900 tabular-nums">
                        {score}
                        <span className="ml-0.5 text-[11px] font-normal text-gray-400">/100</span>
                      </p>
                    </div>

                    {/* Las dos etiquetas que sí valen color: una dice cómo salió
                        en el análisis, la otra que este es el tipo que le tocó
                        a la persona en el quiz. El resto de la tarjeta era
                        color decorativo.

                        La fila reserva su altura con `h-5` aunque no haya
                        ninguna etiqueta. Sin eso colapsaba a 0 y las tarjetas
                        sin etiqueta subían 20 px respecto de la que sí la
                        tiene: la barra de puntaje, los cuatro factores y la
                        descripción quedaban en distinta línea entre columnas,
                        que es justo lo que una comparativa no puede permitirse
                        —se comparan de a pares, en horizontal—.

                        Los 20 px salen de la etiqueta: `leading-4` (16) +
                        `py-0.5` (2+2). El leading va explícito porque
                        `text-[10px]` es un valor arbitrario y Tailwind no le
                        asigna line-height propio: heredaría el del contenedor
                        y la altura dejaría de ser predecible.

                        Es `min-h` y no `h` fija: las dos etiquetas juntas miden
                        ~200 px y la columna más angosta (2 col a 640 px) da
                        300, así que nunca deberían envolver. Pero si alguna vez
                        envuelven —una fuente de reemplazo más ancha, una
                        etiqueta con más texto—, con altura fija se montarían
                        sobre la barra de puntaje. Así crece la fila y a lo sumo
                        se desalinea, que es un problema más chico. */}
                    <div className="mt-2 flex min-h-[20px] flex-wrap items-start gap-1.5">
                      {esMejor && (
                        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold leading-4 text-white">
                          Mejor posicionado
                        </span>
                      )}
                      {activo.tipo === cardRecomendada && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold leading-4 text-white">
                          Para tu perfil
                        </span>
                      )}
                    </div>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-1 rounded-full bg-gray-900" style={{ width: `${score}%` }} />
                    </div>

                    <dl className="mt-5 flex-1 space-y-2.5">
                      {activo.factores.map((f) => (
                        <div key={f.nombre} title={f.fuente}>
                          <div className="flex justify-between">
                            <dt className="text-[11px] text-gray-500">{FACTOR_SIMPLE[f.nombre] ?? f.nombre}</dt>
                            <dd className="text-[11px] font-medium text-gray-600 tabular-nums">{f.valor}</dd>
                          </div>
                          <div className="mt-1 h-px bg-gray-100">
                            <div className="h-px bg-gray-300" style={{ width: `${f.valor}%` }} />
                          </div>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-5 text-[11px] leading-relaxed text-gray-400">{activo.descripcion}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-xs leading-relaxed text-gray-400">
              Análisis orientativo sobre el relevamiento propio de la oferta publicada. No
              constituye asesoramiento financiero.
            </p>
          </section>

          {/* Datos del mercado */}
          <section aria-labelledby="datos" className="mb-12 border-t border-gray-100 pt-10">
            {/* Acá va el lago y no la segunda foto de gráficos (grafico1.webp,
                que queda disponible) por una razón concreta: toda la página
                habla de San Martín de los Andes y no tenía una sola imagen de
                San Martín de los Andes. Una mujer con una calculadora podría
                estar en cualquier ciudad del mundo; el lago dice de dónde
                salen los números que la sección está por mostrar.

                `hero-lago.webp` estaba en /public sin usar en ninguna página,
                así que no rompe la regla de no repetir fotos entre secciones.

                Ojo con las otras dos "hero-" de la carpeta: hero-montana y
                hero-pradera son el Fitz Roy, en El Chaltén, a 1.800 km de acá.
                No van en esta página. */}
            <SeccionConFoto
              src="/hero-lago.webp"
              alt="Lago rodeado de montañas boscosas con cumbres nevadas al fondo, en San Martín de los Andes"
              ladoFoto="derecha"
            >
              <Antetitulo>Datos del mercado · San Martín de los Andes</Antetitulo>
              <TituloSeccion id="datos">Cómo se movió el m² y cuánto rinde</TituloSeccion>
              <Subtitulo>
                Información orientativa sobre el relevamiento propio. No constituye tasación
                profesional. Datos al {fechaDatos}.
              </Subtitulo>
            </SeccionConFoto>

            {/* Tabs en hairline, no botones pintados: el activo se marca con el
                subrayado y el peso del texto. Un botón rosa lleno acá compite
                con el CTA real de la página, que es dejar los datos. */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-gray-100">
              {["zonas", "rentabilidad"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
                    activeTab === tab
                      ? "border-gray-900 font-semibold text-gray-900"
                      : "border-transparent font-medium text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "zonas" ? "Evolución de precios" : "Estimación de rentabilidad"}
                </button>
              ))}
            </div>

            {activeTab === "zonas" && (
              /* El gráfico vuelve a estar a la vista, completo, por decisión de
                 Milton: "el gráfico de evolución de precios me gusta más como
                 estaba antes".

                 Estuvo un rato convertido en tira sparkline con el +57,7 % en
                 34 px arriba y la serie escondida detrás de un "Ver año por
                 año". El razonamiento era el de Airbnb —un número decide más
                 rápido que un gráfico—, pero acá el gráfico es el argumento:
                 la página le está pidiendo a alguien que ponga USD 150.000 en
                 una ciudad, y ver la curva completa es lo que sostiene el
                 pedido. Un porcentaje solo se lee como publicidad.

                 Se conserva de aquella vuelta lo que era mejora y no rediseño:
                 el título en 17 px en vez de 22, y la nota al pie de dos líneas
                 en vez de seis.

                 Va como comentario de bloque de JavaScript y no con llaves al
                 estilo JSX, porque acá adentro estamos en una expresión y no
                 en los children de un elemento. */
              <div className="mt-7">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-gray-900">
                  Evolución del precio del m², en dólares
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  San Martín de los Andes · {primerPunto.anio}–{ultimoPunto.anio}
                </p>

                <div className="mt-4">
                  <InversionesEvolucionChart data={evolucion} alto="h-56 sm:h-80" />
                </div>

                <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 tabular-nums sm:text-sm">
                  <span>{primerPunto.anio}: USD {primerPunto.precio.toLocaleString("es-AR")}/m²</span>
                  <span className="font-semibold text-emerald-600">
                    {crecimientoPct >= 0 ? "+" : ""}{crecimientoPct}% en {ultimoPunto.anio - primerPunto.anio} años
                  </span>
                  <span>{ultimoPunto.anio}: USD {ultimoPunto.precio.toLocaleString("es-AR")}/m²</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Badge tipo="estimado" />
                  <p className="text-gray-400 text-[11px] leading-relaxed flex-1 min-w-[220px]">
                    La misma serie que publican el tasador y la página de precio del m². El modelo
                    le verifica el último año contra la mediana actual del relevamiento.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "rentabilidad" && (
              <div className="mt-8">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-gray-900">
                  Estimación de rentabilidad por alquiler
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
                  El porcentaje es cuánto recuperás por año solo con el alquiler: un 8 % significa
                  que por cada USD 100 invertidos te vuelven USD 8 al año. No incluye la suba de
                  valor de la propiedad.
                </p>

                {/* Estas tarjetas tenían `bg-green-950/20` y bordes
                    `green-900/30` — verdes de tema oscuro sobre fondo blanco,
                    otro resto de la conversión del 9-ago. En hairline el dato
                    se lee mejor y el problema desaparece solo. */}
                <div className="mt-7 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                  {RENTALS.map((item) => (
                    <div key={`${item.tipo}-${item.precioVenta}`} className="border-t border-gray-100 py-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] font-medium text-gray-900">{item.tipo}</span>
                        <span className="text-lg font-semibold text-gray-900 tabular-nums">{item.rentabilidad}%</span>
                      </div>
                      <dl className="mt-2 space-y-1 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <dt>Precio de referencia</dt>
                          <dd className="font-medium text-gray-600 tabular-nums">USD {item.precioVenta.toLocaleString("es-AR")}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Alquiler estimado</dt>
                          <dd className="font-medium text-gray-600 tabular-nums">USD {item.alquiler}/mes</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Renta anual</dt>
                          <dd className="font-medium text-gray-600 tabular-nums">USD {(item.alquiler * 12).toLocaleString("es-AR")}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Badge tipo="estimado" />
                  <p className="min-w-[220px] flex-1 text-[11px] leading-relaxed text-gray-400">
                    Estimaciones orientativas. Los valores reales varían según la propiedad y las
                    condiciones del mercado.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Matriz Riesgo / Retorno */}
          <section aria-labelledby="matriz" className="mb-12 border-t border-gray-100 pt-10">
            <Antetitulo>Riesgo y retorno</Antetitulo>
            <TituloSeccion id="matriz">¿Cuánto riesgo vale el retorno?</TituloSeccion>
            <Subtitulo>
              Cuanto más arriba está el punto, más gana por año ese tipo de propiedad. Cuanto más a
              la derecha, más pueden variar sus resultados de un año a otro. Lo mejor está arriba a
              la izquierda: buena ganancia con pocas sorpresas.
            </Subtitulo>

            {/* Los cuatro cuadrantes tenían fondo de color al 5 % y las
                etiquetas venían con bordes `emerald-900/50`, `amber-900/50` —
                más restos del tema oscuro. Las líneas del cuadrante alcanzan
                para leer la división; el color de fondo solo agregaba ruido
                detrás de los puntos, que es lo que hay que mirar. */}
            <div className="relative mt-5 h-80 sm:h-[26rem]">
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="border-b border-r border-gray-100" />
                <div className="border-b border-gray-100" />
                <div className="border-r border-gray-100" />
                <div />
              </div>
              <div className="pointer-events-none absolute left-2 top-2 text-[10px] font-semibold text-gray-400">Conservador</div>
              <div className="pointer-events-none absolute right-2 top-2 text-[10px] font-semibold text-gray-400">Crecimiento</div>
              <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-semibold text-gray-400">Bajo retorno</div>
              <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] font-semibold text-gray-400">Riesgo elevado</div>
              <InversionesMatrizChart data={MATRIX_DATA} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-10 sm:grid-cols-4">
              {[
                { arrow: "↙", label: "Conservador", desc: "Bajo riesgo · Bajo retorno" },
                { arrow: "↖", label: "Zona óptima", desc: "Bajo riesgo · Alto retorno" },
                { arrow: "↗", label: "Crecimiento", desc: "Alto riesgo · Alto retorno" },
                { arrow: "↘", label: "Riesgo elevado", desc: "Alto riesgo · Bajo retorno" },
              ].map((q) => (
                <div key={q.label} className="flex items-start gap-2 border-t border-gray-100 py-3">
                  <span className="mt-0.5 text-base leading-none text-gray-400" aria-hidden="true">{q.arrow}</span>
                  <div>
                    <dt className="text-[11px] font-semibold text-gray-900">{q.label}</dt>
                    <dd className="mt-0.5 text-[11px] text-gray-400">{q.desc}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* Los dos ejes no tienen el mismo respaldo y hasta hoy la página no
                lo decía. El de retorno sale de los mismos supuestos que el
                simulador de más abajo, así que se puede rastrear. El de riesgo
                es una escala de 1 a 10 puesta a criterio: no hay nada en el
                relevamiento que mida volatilidad, y no declararlo dejaba que la
                posición horizontal de cada punto pasara por dato. Mismo criterio
                que /precio-m2, que separa lo relevado de lo estimado. */}
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              En alquiler, el eje vertical muestra renta neta de gastos y vacancia, sin sumar
              valorización. En reventa muestra una referencia anualizada después de costos,
              con el margen de mejora aplicado una sola vez. La posición en el eje de riesgo, en
              cambio, es una estimación propia sobre cuánto pueden variar esos resultados
              de un año a otro: no surge del relevamiento.
            </p>
          </section>

          {/* El desglose del simulador */}
          <section id="calculadora" aria-labelledby="desglose" className="mb-12 border-t border-gray-100 pt-10">
            <Antetitulo>El detalle</Antetitulo>
            <TituloSeccion id="desglose">De dónde sale ese número</TituloSeccion>
            {/* Los controles NO se repiten acá. Dos copias del mismo control se
                desincronizan, y el visitante que cambia una no entiende por qué
                la otra dice otra cosa. Se cambian arriba, en #simulador, y todo
                este bloque se recalcula solo. */}
            <Subtitulo>
              Sobre USD {calcMonto.toLocaleString("es-AR")} a {calcPlazo} año
              {calcPlazo > 1 ? "s" : ""}. Para cambiar el monto, el tipo o el plazo,{" "}
              <a href="#simulador" className="font-medium text-gray-900 underline underline-offset-2">
                volvé al simulador
              </a>
              . Después de separar los costos iniciales, comprás ≈ {sim.m2Comprables} m² al valor mediano de {sim.m2Etiqueta}{" "}
              (USD {sim.m2Ref.toLocaleString("es-AR")}/m², el mismo que publicamos en el tasador).
            </Subtitulo>

            <div>
              {/* Las cuatro cifras iban en tarjetas rosa, verde, violeta y
                  naranja, cada una con su borde: cuatro colores para cuatro
                  datos del mismo cálculo, que los hacía ver como cuatro cosas
                  sin relación. En hairline se leen como lo que son, las partes
                  de un solo número. */}
              <div className="mt-8 grid grid-cols-2 divide-gray-100 border-y border-gray-100 py-5 md:grid-cols-4 md:divide-x">
                {[
                  {
                    valor: `${fmtPct(sim.totalAnual)}%`,
                    label: "retorno anualizado",
                    nota: "después de costos de entrada y salida",
                  },
                  {
                    valor: sim.esReventa ? "—" : `USD ${Math.round(sim.mensual).toLocaleString("es-AR")}`,
                    label: "renta neta mensual",
                    nota: sim.esReventa ? "la reventa no genera renta" : `${Math.round(sim.gastosOperativos * 100)}% de gastos descontado`,
                  },
                  {
                    valor: `+${fmtPct(sim.valorizacion)}%`,
                    label: "valorización anual",
                    nota: `escenario base; antecedente reciente ${fmtPct(VALORIZACION_ANUAL)}%`,
                  },
                  {
                    valor: `USD ${Math.round(sim.total).toLocaleString("es-AR")}`,
                    label: "total final",
                    nota: `inversión + ganancia en ${calcPlazo} año${calcPlazo > 1 ? "s" : ""}`,
                  },
                ].map((m, i) => (
                  <div key={m.label} className={i === 0 ? "pr-4" : "px-4"}>
                    <p className="text-lg font-semibold leading-tight text-gray-900 tabular-nums md:text-xl">
                      {m.valor}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-gray-400 md:text-xs">{m.label}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{m.nota}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-gray-600 md:text-base">
                <strong className="font-medium text-gray-900">En resumen:</strong> si invertís{" "}
                <strong className="font-medium text-gray-900">USD {calcMonto.toLocaleString("es-AR")}</strong> en{" "}
                {calcTipo === "alquiler" ? "una propiedad para alquiler permanente" : calcTipo === "turistico" ? "alquiler turístico" : "compra y reventa"}, en {calcPlazo} año{calcPlazo > 1 ? "s" : ""} terminarías con unos{" "}
                <strong className="font-medium text-gray-900">USD {Math.round(sim.total).toLocaleString("es-AR")}</strong>.{" "}
                {sim.esReventa ? (
                  <>La mejora agrega {fmtPct(MARGEN_REVENTA * 100)}% una sola vez al precio proyectado; no se compone cada año ni genera renta mensual.</>
                ) : (
                  <>
                    La ganancia sale de dos lados: unos <strong className="font-medium text-gray-900">USD {Math.round(sim.mensual).toLocaleString("es-AR")} por mes</strong> de renta neta (ya descontados gastos y vacancia) más la suba de valor de la propiedad.
                  </>
                )}
              </p>

              <h3 className="mt-9 text-[17px] font-semibold tracking-[-0.01em] text-gray-900">
                De dónde sale la ganancia
              </h3>
              <dl className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
                {!sim.esReventa && (
                  <div className="flex justify-between py-3 text-sm">
                    <dt className="text-gray-500">Renta neta acumulada en {calcPlazo} año{calcPlazo > 1 ? "s" : ""}</dt>
                    <dd className="font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.rentaAcumulada).toLocaleString("es-AR")}</dd>
                  </div>
                )}
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Capital destinado al precio de la propiedad</dt>
                  <dd className="font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.precioPropiedad).toLocaleString("es-AR")}</dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Costos iniciales{sim.esReventa ? " y reforma" : calcTipo === "turistico" ? " y equipamiento" : ""}</dt>
                  <dd className="font-semibold text-gray-900 tabular-nums">− USD {Math.round(sim.costosIniciales).toLocaleString("es-AR")}</dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-gray-500">Venta neta proyectada, descontando costos de salida</dt>
                  <dd className="font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.ventaNeta).toLocaleString("es-AR")}</dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="font-medium text-gray-900">Ganancia total estimada</dt>
                  <dd className="font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.ganancia).toLocaleString("es-AR")}</dd>
                </div>
              </dl>

              <h3 className="mt-9 text-[17px] font-semibold tracking-[-0.01em] text-gray-900">
                Contra un plazo fijo en dólares, a {calcPlazo} año{calcPlazo > 1 ? "s" : ""}
              </h3>
              <div className="mt-5">
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100 py-5">
                  <div className="pr-4">
                    <div className="text-lg font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.plazoFijoTotal).toLocaleString("es-AR")}</div>
                    <div className="mt-1 text-[11px] leading-snug text-gray-400">plazo fijo en dólares</div>
                    <div className="mt-0.5 text-[10px] leading-snug text-gray-400">~{TASA_PLAZO_FIJO * 100}% anual (bancos argentinos: 0,5–2%)</div>
                  </div>
                  <div className="px-4">
                    <div className="text-lg font-semibold text-gray-900 tabular-nums">USD {Math.round(sim.total).toLocaleString("es-AR")}</div>
                    <div className="mt-1 text-[11px] leading-snug text-gray-400">inversión inmobiliaria</div>
                    <div className="mt-0.5 text-[10px] leading-snug text-gray-400">~{fmtPct(sim.totalAnual)}% anual estimado</div>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Diferencia: <span className={`font-semibold ${sim.total >= sim.plazoFijoTotal ? "text-emerald-600" : "text-rose-600"}`}>
                    {sim.total >= sim.plazoFijoTotal ? "+" : "−"}USD {Math.abs(Math.round(sim.total - sim.plazoFijoTotal)).toLocaleString("es-AR")}
                  </span>{" "}
                  {sim.total >= sim.plazoFijoTotal ? "a favor del inmueble" : "a favor del plazo fijo"}
                </p>
                <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-200 leading-relaxed">
                  ¿Y el plazo fijo en pesos? Paga más en términos nominales (~15–19% TNA), pero está expuesto a la devaluación: medido en dólares, su resultado a varios años es impredecible y muchas veces negativo. Por eso comparamos contra la alternativa real en la misma moneda.
                </p>
              </div>

              <p className="mt-6 text-[11px] leading-relaxed text-gray-400">
                Supuestos: el monto incluye todo el capital · {COSTOS_ENTRADA * 100}% de costos de entrada · {COSTOS_SALIDA * 100}% de costos de salida · renta bruta de referencia{!sim.esReventa && sim.rentaBruta ? ` ${fmtPct(sim.rentaBruta)}%` : ""} · {Math.round(sim.gastosOperativos * 100)}% de descuento por vacancia, mantenimiento, impuestos y gestión · valorización futura base {fmtPct(VALORIZACION_PROYECTADA)}% anual (el antecedente reciente de {fmtPct(VALORIZACION_ANUAL)}% no se proyecta completo){sim.esReventa ? ` · reforma ${REFORMA_REVENTA * 100}% · margen de mejora ${MARGEN_REVENTA * 100}% aplicado una sola vez` : calcTipo === "turistico" ? ` · equipamiento inicial ${EQUIPAMIENTO_TURISTICO * 100}%` : ""}. Renta constante, sin reinversión. Estimación orientativa: no constituye asesoramiento financiero ni garantía de rentabilidad.
              </p>
            </div>

            <div className="mt-12 border-t border-gray-100 pt-10">
              {leadSent ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <p className="text-[17px] font-semibold text-gray-900">¡Listo! Te redirigimos a WhatsApp</p>
                  <p className="text-sm text-gray-500">Milton te responde en menos de 48 hs</p>
                  <button onClick={() => { setLeadSent(false); setLeadName(""); setLeadWa(""); }} className="mt-2 text-xs text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-900">
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit}>
                  {/* La cara al lado del formulario, no solo el nombre.
                      Debajo ya decía "Milton te responde en menos de 48 hs",
                      pero recién después de enviar. Antes de dejar el teléfono,
                      la persona no veía a quién se lo estaba dejando. */}
                  <div className="mb-4 flex items-center gap-3">
                    <Image
                      src="/Milton.webp"
                      alt="Milton Catalán, asesor inmobiliario en San Martín de los Andes"
                      width={44}
                      height={44}
                      sizes="44px"
                      className="h-11 w-11 flex-shrink-0 rounded-full object-cover object-top"
                    />
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Recibí una propuesta personalizada</p>
                      <p className="text-gray-500 text-xs">
                        Te responde Milton, en menos de 48 hs · Sin compromiso
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">Tu nombre</label>
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Ej: María González"
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">Tu WhatsApp</label>
                      <input
                        type="tel"
                        value={leadWa}
                        onChange={(e) => setLeadWa(e.target.value)}
                        placeholder="Ej: +54 9 11 1234-5678"
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-gray-900"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.186-1.622A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.658-.518-5.168-1.418l-.371-.22-3.673.963.981-3.585-.242-.38A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Solicitar propuesta por WhatsApp
                  </button>
                  <p className="mt-3 text-[11px] leading-relaxed text-gray-400">Tu información no se comparte con terceros · Respuesta en menos de 48 hs</p>
                </form>
              )}
            </div>
          </section>

          <AdvisoryProcess />
        </div>
      </div>
    </div>
  );
}
