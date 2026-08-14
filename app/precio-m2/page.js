// Precio del m² en San Martín de los Andes.
//
// TODO número de esta página sale de lib/mercado.js, que a su vez lee
// app/data/mercado_sma.json (el export del modelo). No hay constantes de precio
// escritas acá, y no las tiene que volver a haber.
//
// Por qué: hasta 2026-08-09 esta página tenía su propia serie de evolución
// cargada a mano. Decía que el m² había subido ~10% desde 2021 mientras
// /tasacion —que sí lee el modelo— decía 57,7%. Las dos frases estaban
// publicadas al mismo tiempo, a un clic de distancia. En una página cuyo
// argumento es "estos son datos verificables", eso no es un número mal puesto:
// es la credibilidad de las dos páginas.
//
// Para actualizar la página entera: regenerar mercado_sma.json y buildear.
//
// El lenguaje visual es el mismo de /tasacion: blanco, tipografía grande
// semibold con el tracking cerrado, métricas en hairline y bloques alternados
// de foto y texto. Antes esta página venía de la etapa anterior del sitio
// (font-black, tarjetas con sombra, emojis) y las dos se leían como escritas
// por gente distinta — que es justo lo que hace dudar de los números.

import Image from "next/image";
import Link from "next/link";
import CalculadoraM2 from "@/components/CalculadoraM2";
import PrecioM2Chart from "@/components/PrecioM2Chart";
import { canonicalUrl, DEFAULT_OG_IMAGE, SITE_URL } from "@/config";
import {
  EVOLUCION_SERIE,
  EVOLUCION_VARIACION_TOTAL,
  MERCADO_GENERADO,
  RANGO_M2,
  RELEVADAS_PUBLICO,
  VALOR_M2,
  VALOR_M2_CASA,
  VALOR_M2_DEPTO,
} from "@/lib/mercado";
import { barriosConMediana, medianaDeBarrio } from "@/lib/precioZonas";
import { barriosConPerfil, barrioDePropiedad } from "@/lib/barrios";
import { getProperties } from "@/lib/properties";
import { getPropertySlug } from "@/data/properties";

// Dos reglas para las fotos de esta página:
//
// 1. NO repetir con /tasacion. Las dos páginas van juntas en el recorrido del
//    visitante —el promedio acá, el número propio allá— y compartir foto las
//    hace ver como la misma página repetida.
// 2. Las personas que aparecen son de banco de imágenes, NO clientes de la
//    inmobiliaria. El texto alterno describe lo que se ve y no les inventa una
//    historia. En la página que promete "estos datos son reales", sugerir que
//    esa pareja compró con nosotros sería lo único capaz de tirar abajo el
//    resto.
//
// `porque` ya cumple las dos: hipotecario.jpeg no la usa ninguna otra página
// del sitio fuera del blog de créditos. Las otras dos todavía comparten archivo
// con /tasacion — el reemplazo está pendiente y documentado en
// docs/PROMPTS_IMAGENES_PRECIO_M2.md.
const FOTOS = {
  // PENDIENTE reemplazar: hoy comparte archivo con /tasacion.
  barrios: {
    src: "/tasacion-cuentas.jpg",
    alt: "Una pareja revisa sus cuentas con una notebook en la mesa de la cocina",
  },
  // PENDIENTE reemplazar: hoy comparte archivo con /tasacion.
  limites: {
    src: "/tasacion-ventana.jpg",
    alt: "Una mujer con una taza de café mira por la ventana de su casa a la luz de la mañana",
  },
  porque: {
    src: "/hipotecario.jpeg",
    alt: "Una persona firma documentos en un escritorio, junto a la maqueta de una casa",
  },
};

const BARRIOS_CON_FICHA = new Set(barriosConPerfil().map((b) => b.slug));

// "6 de agosto de 2026" a partir del ISO del export. Se calcula, no se escribe:
// el badge decía "Actualizado — Julio 2026" hardcodeado y lo iba a seguir
// diciendo para siempre hasta que alguien se acordara de editarlo.
const fecha = new Date(`${MERCADO_GENERADO}T12:00:00Z`);
const ACTUALIZADO = fecha.toLocaleDateString("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const usd = (n) => `USD ${Number(n).toLocaleString("es-AR")}`;

// Title y description reescritos el 2026-08-14 por CTR.
//
// Medición previa (Search Console, 28 días al 12-ago-2026): esta página tenía
// 223 impresiones en posición media 5,1 y solo 6 clics — CTR 2,7%. En posición
// 5 lo esperable ronda 5-8%: rankeaba bien y no la clickeaba nadie. No es un
// problema de posición, es de qué dice el resultado en la SERP.
//
// Dos cambios, los dos deliberados:
//
// 1. El title pasa de "Precio m² ..." a "Precio del m² en ...", que es como
//    la gente escribe la consulta. El anterior estaba redactado como etiqueta
//    de menú, no como respuesta.
// 2. La description ahora ABRE con los dos números en vez de describir la
//    página. En una búsqueda de precio, el número es el gancho: quien busca
//    "cuánto vale el m²" ya ve la respuesta en el resultado, y entra a ver el
//    detalle por barrio. Ningún competidor local publica esta cifra.
//
// Los valores salen de lib/mercado.js como el resto de la página — nunca
// escribirlos a mano acá, o el día que se regenere el modelo la SERP va a
// mostrar un precio que la página ya no dice (ver el TODO del encabezado).
export const metadata = {
  title: "Precio del m² en San Martín de los Andes 2026",
  // Sin "terrenos": la página ya no publica su m². Y el total sale de la
  // constante, no escrito a mano — decía "más de 1.500" fijo.
  description: `Casas ${usd(VALOR_M2_CASA)} y departamentos ${usd(VALOR_M2_DEPTO)} el m². Mediana por barrio y evolución 2021–2026, sobre un relevamiento propio de ${RELEVADAS_PUBLICO} propiedades.`,
  openGraph: {
    title: "Precio del m² en San Martín de los Andes 2026 — Catalán Propiedades",
    description: `Evolución del m² 2021–2026 y mediana por barrio, sobre ${RELEVADAS_PUBLICO} propiedades relevadas en San Martín de los Andes.`,
    url: canonicalUrl("/precio-m2"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Precio del m² San Martín de los Andes 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precio del m² en San Martín de los Andes 2026",
    description: `Mediana por barrio y evolución 2021–2026. ${RELEVADAS_PUBLICO} propiedades relevadas.`,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/precio-m2"),
  },
};

// Dos orígenes, no tres. Coinciden exactamente con `_leyenda_origen` del JSON
// del modelo: o el número sale del relevamiento, o es una referencia cargada a
// mano. La etiqueta azul "Referencia histórica" describía una tercera categoría
// que no existía en los datos.
const BADGES = {
  calculado: { label: "Dato propio", cls: "border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
  referencia: { label: "Referencia de mercado", cls: "border-amber-200 text-amber-700", dot: "bg-amber-500" },
};

function Badge({ tipo, className = "" }) {
  const b = BADGES[tipo];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${b.cls} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} aria-hidden="true" />
      {b.label}
    </span>
  );
}

// La serie del modelo trae {anio, usd_m2, variacion_pct, descripcion}; el
// gráfico espera {anio, precio, variacion, contexto, fuente}. Se traduce acá,
// una sola vez, en vez de mantener una copia de la serie con los otros nombres.
const EVOLUCION = EVOLUCION_SERIE.map((p) => ({
  anio: p.anio,
  precio: p.usd_m2,
  variacion: p.variacion_pct,
  contexto: p.descripcion,
  fuente: "Serie de referencia de mercado · Catalán Propiedades",
}));

// Casa y departamento van separados porque difieren ~58%: el promedio mezclado
// no le sirve ni al que vende una casa ni al que vende un departamento — es la
// misma razón que está documentada en lib/mercado.js y que esta página venía
// incumpliendo con su "USD 2.500 – 2.650" marcado como verificado.
const METRICAS = [
  { valor: usd(VALOR_M2_CASA), label: "el m² en casas" },
  { valor: usd(VALOR_M2_DEPTO), label: "el m² en departamentos" },
  {
    valor: EVOLUCION_VARIACION_TOTAL
      ? `+${EVOLUCION_VARIACION_TOTAL.toString().replace(".", ",")}%`
      : "—",
    label: "subió el m² desde 2021",
  },
];

const PLURAL = { Casa: "Casas", Departamento: "Departamentos" };

// Solo se publica el m² de los tipos para los que el modelo exporta el `n` de
// su mediana — hoy, Casa y Departamento. No es un capricho de prolijidad:
//
//   - `relevadas.por_tipo` cuenta los AVISOS de cada tipo (512 casas).
//   - `rango_por_tipo[].n` cuenta las propiedades sobre las que efectivamente
//     se calculó la mediana (188 casas).
//
// Los dos números son distintos porque el modelo descarta lo que no puede
// medir: 247 casas venían con el lote cargado como superficie cubierta. Publicar
// "USD 2.085/m² · 512 relevadas" era decir que el número tiene un respaldo casi
// tres veces mayor del que tiene.
//
// Para Cabaña, Local Comercial, Terreno y Oficina el export no trae ese `n`, así
// que no sabemos sobre cuántas propiedades salió cada mediana. Quedan fuera
// hasta que el modelo lo exporte — antes que publicarlas con una advertencia al
// pie, no se publican. (Oficina, además, sale de 2 avisos en total.)
const POR_TIPO = Object.entries(VALOR_M2)
  .map(([tipo, precio]) => ({ tipo, precio, rango: RANGO_M2[tipo] }))
  .filter((t) => t.rango?.n)
  .map((t) => ({ ...t, n: t.rango.n }))
  .sort((a, b) => b.precio - a.precio);

const BARRIOS = barriosConMediana();
const BARRIOS_VISIBLES = BARRIOS.slice(0, 8);
const BARRIOS_OCULTOS = BARRIOS.slice(8);

// El barrio con la mediana más alta, para el FAQ. Se calcula: escribirlo a mano
// es lo que hizo que la página destacara "máximo por zona: Chapelco Golf" cuando
// el modelo decía que el más alto era el Centro.
const BARRIO_MAS_CARO = [...BARRIOS].sort((a, b) => b.medianaM2 - a.medianaM2)[0] ?? null;

// El barrio se ofrece alfabético en la calculadora —ahí la persona busca el
// suyo, no el que más datos tiene— mientras que la lista de la página sigue
// ordenada por volumen de relevamiento.
const BARRIOS_ALFABETICOS = [...BARRIOS].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

// Lo que la calculadora necesita de cada tipo. Sale del mismo POR_TIPO que
// alimenta la sección "Dónde cae la mayoría", así que las dos no se pueden
// separar: si mañana el modelo exporta el `n` de Cabaña, aparece en las dos.
//
// Casa va primero —y por lo tanto es la opción por defecto— aunque POR_TIPO
// esté ordenado por precio y el departamento salga más caro el m². El orden de
// esa sección es "de más caro a más barato" y está bien así; acá el criterio es
// otro: el que llega buscando cuánto vale lo suyo, en esta ciudad, la mayoría
// de las veces tiene una casa. Arrancar en "Departamento" lo obliga a corregir
// el formulario antes de usarlo.
const TIPOS_CALC = POR_TIPO.map((t) => ({
  tipo: t.tipo,
  p25: t.rango.p25,
  p75: t.rango.p75,
  n: t.n,
})).sort((a, b) => (a.tipo === "Casa" ? -1 : b.tipo === "Casa" ? 1 : 0));

const ANIOS = EVOLUCION_SERIE.map((p) => p.anio);
const ANIO_DESDE = ANIOS.length ? Math.min(...ANIOS) : null;
const ANIO_HASTA = ANIOS.length ? Math.max(...ANIOS) : null;

const FUENTES = [
  {
    nombre: "Relevamiento propio",
    dato: `${RELEVADAS_PUBLICO} propiedades de San Martín de los Andes, actualizado al ${ACTUALIZADO}`,
  },
  {
    nombre: "Oferta publicada de la zona",
    dato: "Avisos de venta publicados en San Martín de los Andes, relevados y depurados por nosotros",
  },
  {
    nombre: "Prensa local",
    dato: "Cobertura periodística del mercado de San Martín, como referencia histórica",
  },
];

// ─── FAQ ────────────────────────────────────────────────────────────────────
//
// Las preguntas viven una sola vez: de acá salen tanto el acordeón que se ve en
// pantalla como el JSON-LD que lee Google. Es la misma regla que ya está escrita
// en /tasacion, y por el mismo motivo: si el JSON-LD tuviera su propia copia,
// Google podría mostrar en el buscador una respuesta que el visitante no
// encuentra en la página. Ya pasó una vez en /blog/score-de-inversion, donde el
// JSON-LD decía "más de 1.700 propiedades" —de un export viejo— y ninguna otra
// página del sitio decía eso.
//
// Todas las cifras salen de constantes. Ninguna respuesta tiene un número
// escrito a mano: si mañana se regenera el JSON del modelo, el FAQ se actualiza
// solo y no queda contradiciendo al resto de la página.
const FAQS = [
  {
    pregunta: "¿Cuánto cuesta el m² en San Martín de los Andes?",
    respuesta: `Al ${ACTUALIZADO}, la mediana es de ${usd(VALOR_M2_CASA)} por m² en casas y ${usd(
      VALOR_M2_DEPTO
    )} en departamentos. Van separados porque son mercados distintos: difieren casi un 60 %, así que el promedio de los dos juntos no le sirve ni al que vende una casa ni al que vende un departamento. La mitad de las casas se publica entre ${usd(
      RANGO_M2.Casa?.p25
    )} y ${usd(RANGO_M2.Casa?.p75)} el m².`,
  },
  {
    pregunta: "¿Cuánto sale una casa de 100 m² en San Martín de los Andes?",
    respuesta: `Con la mediana de ${usd(
      VALOR_M2_CASA
    )} por m², una casa de 100 m² ronda los ${usd(
      VALOR_M2_CASA * 100
    )}. La mitad del mercado cae entre ${usd(RANGO_M2.Casa?.p25 * 100)} y ${usd(
      RANGO_M2.Casa?.p75 * 100
    )}, según barrio, estado y características. Es una cuenta orientativa: entre el barrio más caro y el más barato hay casi el triple por metro cuadrado.`,
  },
  {
    pregunta: "¿Cuál es el barrio más caro de San Martín de los Andes?",
    respuesta: BARRIO_MAS_CARO
      ? `Entre los barrios con datos suficientes, la mediana más alta es la de ${
          BARRIO_MAS_CARO.nombre
        }: USD ${BARRIO_MAS_CARO.medianaM2.toLocaleString("es-AR")} por m² sobre ${
          BARRIO_MAS_CARO.n
        } propiedades relevadas. Solo publicamos los barrios con al menos 4 propiedades relevadas: con una o dos, la mediana no significa nada.`
      : "Publicamos la mediana de cada barrio con al menos 4 propiedades relevadas. Entre el más caro y el más barato hay casi el triple por metro cuadrado.",
  },
  {
    pregunta: "¿Por qué el m² es tan caro en San Martín de los Andes?",
    respuesta:
      "Por cuatro razones que se suman: es uno de los destinos más elegidos de la Patagonia y eso sostiene la demanda; hay muy pocas casas en alquiler anual frente a más de mil en venta; los proyectos nuevos de Chapelco Golf y la Costanera son de alta gama y empujan el promedio; y llegan compradores de Buenos Aires, Mendoza y del exterior que buscan resguardar valor en dólares. En 2022 la ciudad fue señalada como la del m² más caro del país, con USD 2.520.",
  },
  {
    pregunta: "¿De dónde salen estos precios?",
    respuesta: `De un relevamiento propio de ${RELEVADAS_PUBLICO} propiedades publicadas en venta en San Martín de los Andes, actualizado al ${ACTUALIZADO}. Es el mismo relevamiento con el que trabaja nuestro tasador. No existe un índice oficial de precios para la ciudad.`,
  },
  {
    pregunta: "¿Estos valores son de propiedades vendidas o publicadas?",
    respuesta:
      "Publicadas. Las medianas se calculan sobre la oferta publicada —lo que los vendedores piden— y no sobre operaciones cerradas, que en Argentina no son públicas. Sirven para orientarse sobre el nivel del mercado; para poner un precio hace falta mirar la propiedad.",
  },
  {
    pregunta: "¿Cada cuánto se actualizan estos datos?",
    respuesta: `Cada vez que volvemos a relevar el mercado. Los datos publicados hoy son del ${ACTUALIZADO}. La fecha que aparece arriba de todo no está escrita a mano: sale del propio archivo de datos, así que no puede quedar desactualizada sin que el número también cambie.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.pregunta,
    acceptedAnswer: { "@type": "Answer", text: f.respuesta },
  })),
};

// Dataset JSON-LD. Esta página es, literalmente, un conjunto de datos con
// fuente, cobertura temporal y fecha: declararlo es lo que le permite a Google
// tratarla como tal y no como un artículo más de precios.
//
// `dateModified` es la fecha del export, no la del build. Decirle a Google que
// los datos son de hoy cuando son del mes pasado es la misma señal falsa que
// arreglamos en el sitemap.
const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Precio del m² en San Martín de los Andes",
  description: `Mediana del precio por metro cuadrado en San Martín de los Andes, por tipo de propiedad y por barrio, sobre un relevamiento propio de ${RELEVADAS_PUBLICO} propiedades publicadas en venta. Incluye la evolución del m² en dólares entre ${ANIO_DESDE} y ${ANIO_HASTA}.`,
  url: canonicalUrl("/precio-m2"),
  // Sin `license`. Google lo recomienda, pero declarar una licencia (CC-BY o la
  // que sea) es decidir que cualquiera puede republicar el relevamiento. Esa es
  // una decisión comercial, no técnica, y no se toma desde acá. Si algún día se
  // define una, va en esta línea.
  isAccessibleForFree: true,
  dateModified: MERCADO_GENERADO,
  temporalCoverage: `${ANIO_DESDE}/${ANIO_HASTA}`,
  spatialCoverage: {
    "@type": "Place",
    name: "San Martín de los Andes, Neuquén, Argentina",
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Martín de los Andes",
      addressRegion: "Neuquén",
      addressCountry: "AR",
    },
  },
  creator: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    url: SITE_URL,
  },
  // Cada variable declara su unidad. `n` va en la descripción porque es lo que
  // separa un dato medido de una cifra suelta.
  variableMeasured: [
    {
      "@type": "PropertyValue",
      name: "Precio del m² en casas",
      unitText: "USD/m²",
      value: VALOR_M2_CASA,
      description: `Mediana sobre ${RANGO_M2.Casa?.n} propiedades. Rango intercuartil ${RANGO_M2.Casa?.p25}–${RANGO_M2.Casa?.p75} USD/m².`,
    },
    {
      "@type": "PropertyValue",
      name: "Precio del m² en departamentos",
      unitText: "USD/m²",
      value: VALOR_M2_DEPTO,
      description: `Mediana sobre ${RANGO_M2.Departamento?.n} propiedades. Rango intercuartil ${RANGO_M2.Departamento?.p25}–${RANGO_M2.Departamento?.p75} USD/m².`,
    },
    ...BARRIOS.map((b) => ({
      "@type": "PropertyValue",
      name: `Precio del m² en ${b.nombre}`,
      unitText: "USD/m²",
      value: b.medianaM2,
      description: `Mediana sobre ${b.n} propiedades relevadas en ${b.nombre}, casas y departamentos.`,
    })),
  ],
};

// Bloque imagen + texto. La imagen siempre lleva un ratio fijo y `sizes`: sin
// eso, la foto llega después del texto y empuja media página hacia abajo justo
// cuando la persona empezó a leer.
function BloqueConFoto({ foto, invertido = false, children }) {
  return (
    <div
      className={`grid items-center gap-8 md:gap-14 lg:grid-cols-2 ${
        invertido ? "lg:[&>figure]:order-last" : ""
      }`}
    >
      <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </figure>
      <div>{children}</div>
    </div>
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

function Antetitulo({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{children}</p>
  );
}

function FilaBarrio({ b }) {
  const conFicha = b.slug && BARRIOS_CON_FICHA.has(b.slug);
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <span className="text-[15px] font-medium text-gray-900">
        {/* Solo los barrios con ficha publicada son link; el resto quedaría
            apuntando a un 404. */}
        {conFicha ? (
          <Link href={`/barrios/${b.slug}`} className="hover:text-rose-600 hover:underline">
            {b.nombre}
          </Link>
        ) : (
          b.nombre
        )}
      </span>
      <span className="flex items-baseline gap-3">
        <span className="text-[11px] text-gray-400 tabular-nums">{b.n} relevadas</span>
        <span className="text-[15px] font-semibold text-gray-900 tabular-nums">
          USD {b.medianaM2.toLocaleString("es-AR")}/m²
        </span>
      </span>
    </div>
  );
}

// ── Puente al catálogo ──────────────────────────────────────────────────────
//
// Agregado el 2026-08-14. Hasta hoy la página terminaba ofreciendo /tasacion,
// /inversiones y /contacto: tres herramientas más. Ninguna propiedad.
//
// La medición mostraba lo que costaba eso. En 28 días (al 12-ago-2026) el sitio
// entero generó 6 clics a WhatsApp, y los cuatro orígenes fueron fichas de
// propiedad concretas y /alquileres. Ni uno salió de una herramienta, con esta
// página trayendo 223 impresiones. Las herramientas atraen y las propiedades
// convierten, y entre las dos no había puente.
//
// Por qué el m² de cada propiedad y no una grilla de fotos: la grilla ya existe
// en /propiedades y no hace falta otra puerta a lo mismo. Lo único que puede
// hacer ESTA página es cerrar su propio argumento —la mediana por barrio—
// contra algo que se puede comprar: "esta se publica 12% por debajo de la
// mediana de su barrio". Es el mismo dato de arriba, aplicado.
//
// Dos reglas para no romper lo que la página viene construyendo:
//
// 1. NO esconder las que están por encima de la mediana. Publicar solo las
//    baratas convertiría esto en una selección comercial disfrazada de dato,
//    que es justo lo que el resto de la página se cuidó de no ser.
// 2. Los lotes quedan afuera. El m² de terreno no es comparable con el de una
//    propiedad construida, y las medianas de arriba se calculan sin terrenos
//    (ver la nota del metadata). Compararlos daría un número que parece dato.
// 3. Solo entran las propiedades que caen en un barrio de San Martín. Al probar
//    esto contra el catálogo real aparecieron Meliquina y Costas del Aluminé:
//    son otras localidades, con un m² de 625 y 783 contra los ~2.000 de acá. Al
//    ordenar por precio quedaban primeras y le dejaban al lector la idea de que
//    el m² en San Martín arranca en 600. En una página que trata exactamente
//    sobre eso, no es un detalle. Se venden igual, desde /propiedades.
async function propiedadesConM2(limite = 6) {
  const todas = await getProperties();

  return todas
    .filter((p) => !p.vendida && !p.noDisponible && p.status !== "no_disponible")
    .filter((p) => p.modalidad !== "alquiler_permanente")
    .filter((p) => p.type !== "Lote")
    .map((p) => {
      const precio = Number(p.price);
      const superficie = Number(p.area);
      // Sin precio o sin superficie no hay m² que mostrar: se descarta en vez
      // de dibujar un cero.
      if (!precio || !superficie) return null;

      // Sin barrio identificado no sabemos si está en la ciudad: fuera.
      const barrio = barrioDePropiedad(p);
      if (!barrio) return null;

      const m2 = Math.round(precio / superficie);
      // `medianaDeBarrio` devuelve null cuando el barrio no llega al mínimo de
      // propiedades relevadas (le pasa hoy a Peñón de Lolog). En ese caso la
      // fila se muestra con su m² y sin comparación — nunca con una inventada.
      const mediana = medianaDeBarrio(barrio.slug);
      const delta = mediana
        ? Math.round(((m2 - mediana.medianaM2) / mediana.medianaM2) * 100)
        : null;

      return { p, m2, barrio, mediana, delta };
    })
    .filter(Boolean)
    // Primero las que tienen comparación —son las que aportan el dato— y dentro
    // de ellas, de la más barata por m² a la más cara. Las que no tienen mediana
    // de barrio se muestran igual, al final, sin inventarles una comparación.
    .sort((a, b) => {
      if ((a.delta === null) !== (b.delta === null)) return a.delta === null ? 1 : -1;
      if (a.delta !== null && b.delta !== null) return a.delta - b.delta;
      return a.m2 - b.m2;
    })
    .slice(0, limite);
}

function FilaPropiedad({ item }) {
  const { p, m2, barrio, mediana, delta } = item;

  return (
    <Link
      href={`/propiedades/${getPropertySlug(p)}`}
      className="group flex items-baseline justify-between gap-4 py-3.5"
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium text-gray-900 group-hover:text-rose-600">
          {p.title}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-gray-400">
          {p.type}
          {barrio ? ` · ${barrio.nombre}` : ""}
          {mediana
            ? ` · mediana del barrio USD ${mediana.medianaM2.toLocaleString("es-AR")}/m²`
            : ""}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[15px] font-semibold text-gray-900 tabular-nums">
          USD {m2.toLocaleString("es-AR")}/m²
        </span>
        {delta !== null && (
          <span
            className={`mt-0.5 block text-[11px] tabular-nums ${
              delta < 0 ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {delta === 0
              ? "en la mediana"
              : `${Math.abs(delta)}% ${delta < 0 ? "por debajo" : "por encima"}`}
          </span>
        )}
      </span>
    </Link>
  );
}

function SeccionPropiedades({ items }) {
  // Sin catálogo cargado no se dibuja el bloque vacío.
  if (!items.length) return null;

  return (
    <section aria-labelledby="propiedades" className="mt-14 border-t border-gray-100 pt-14">
      <h2
        id="propiedades"
        className="text-[22px] font-semibold tracking-[-0.01em] text-gray-900"
      >
        Cómo se paran las que están a la venta
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">
        El mismo cálculo de arriba, aplicado a lo que tenemos publicado hoy: cuánto sale el m² de
        cada propiedad y cómo queda contra la mediana de su barrio.
      </p>

      <div className="mt-6 divide-y divide-gray-100 border-y border-gray-100">
        {items.map((item) => (
          <FilaPropiedad key={item.p.id} item={item} />
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-400">
        El m² de cada propiedad es su precio publicado dividido su superficie. La comparación
        contra la mediana sirve para orientarse, no para tasar: la vista, el estado y la
        orientación mueven el precio bastante más que unos puntos de diferencia. No se incluyen
        lotes, porque el m² de terreno no es comparable con el de una propiedad construida.
      </p>

      <Link
        href="/propiedades"
        className="mt-5 inline-block text-sm font-semibold text-rose-600 hover:underline"
      >
        Ver todas las propiedades →
      </Link>
    </section>
  );
}

function SeccionBarrios() {
  return (
    <section aria-labelledby="barrios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <BloqueConFoto foto={FOTOS.barrios}>
        <Antetitulo>Lo que más pesa</Antetitulo>
        <TituloSeccion id="barrios">El barrio manda</TituloSeccion>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
          Entre el barrio más caro y el más barato hay casi el triple por metro cuadrado. Ninguna
          otra variable mueve tanto: dos casas iguales, a diez cuadras de distancia, pueden valer
          muy distinto. Cada fila es la mediana real de lo que se publica ahí, con la cantidad de
          propiedades que la respalda.
        </p>

        <div className="mt-7 divide-y divide-gray-100 border-y border-gray-100">
          {BARRIOS_VISIBLES.map((b) => (
            <FilaBarrio key={b.nombre} b={b} />
          ))}
        </div>

        {/* El resto queda a un clic: la lista completa en mobile es larguísima,
            pero el contenido tiene que estar en el HTML igual — es lo que Google
            indexa para "precio m2 <barrio>". Con <details> el texto está
            presente aunque esté colapsado, y funciona sin JavaScript. */}
        {BARRIOS_OCULTOS.length > 0 && (
          <details className="group mt-1">
            <summary className="cursor-pointer list-none py-3.5 text-sm font-semibold text-rose-600 hover:underline [&::-webkit-details-marker]:hidden">
              Ver los otros {BARRIOS_OCULTOS.length} barrios relevados
              <span className="group-open:hidden" aria-hidden="true"> ↓</span>
              <span className="hidden group-open:inline" aria-hidden="true"> ↑</span>
            </summary>
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {BARRIOS_OCULTOS.map((b) => (
                <FilaBarrio key={b.nombre} b={b} />
              ))}
            </div>
          </details>
        )}

        <p className="mt-3 text-xs leading-relaxed text-gray-400">
          Solo se listan los barrios con al menos 4 propiedades relevadas: con una o dos, la
          mediana no significa nada. No hay columna por tipo dentro de cada barrio porque ese dato
          no existe — el relevamiento no alcanza para separar los departamentos del Centro de las
          casas del Centro sin inventar el número.
        </p>
      </BloqueConFoto>
    </section>
  );
}

function SeccionLimites() {
  return (
    <section aria-labelledby="limites" className="border-y border-gray-100 bg-gray-50/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BloqueConFoto foto={FOTOS.limites} invertido>
          <Antetitulo>Los límites, dichos de frente</Antetitulo>
          <TituloSeccion id="limites">Un promedio no ve tu casa</TituloSeccion>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
            Estos números describen un mercado, no una propiedad. No ven lo que se ve desde el
            living a las siete de la tarde, ni cómo entra el sol en julio, ni el ruido de la calle
            a las ocho de la mañana, ni si la carpintería aguantó bien los inviernos.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
            Y hay una diferencia más de fondo: las medianas se calculan sobre la{" "}
            <strong className="font-medium text-gray-900">oferta publicada</strong> —lo que los
            vendedores piden— y no sobre operaciones cerradas, que en Argentina no son públicas.
            Sirven para orientarse; para poner un precio hace falta mirar la propiedad.
          </p>
          <Link
            href="/tasacion"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Tasar mi propiedad
            <span aria-hidden="true">→</span>
          </Link>
        </BloqueConFoto>
      </div>
    </section>
  );
}

function SeccionPorQue() {
  const razones = [
    {
      titulo: "Mucha gente quiere venir",
      texto:
        "Es uno de los destinos más elegidos de la Patagonia, y eso mantiene alta la demanda de alquileres turísticos y de propiedades para invertir.",
    },
    {
      titulo: "Hay muy pocas casas para alquilar todo el año",
      texto:
        "Se consiguen apenas unas 49, mientras que en venta hay más de 1.000. Al haber poca oferta, los precios suben.",
    },
    {
      titulo: "Se construye cada vez más y mejor",
      texto:
        "Los proyectos nuevos en Chapelco Golf y la Costanera son de alta gama y empujan el promedio hacia arriba.",
    },
    {
      titulo: "Llega gente de todos lados",
      texto:
        "Compradores de Buenos Aires, Mendoza y del exterior ven en San Martín una forma segura de guardar su dinero en dólares.",
    },
  ];

  return (
    <section aria-labelledby="porque" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <BloqueConFoto foto={FOTOS.porque}>
        <Antetitulo>El contexto</Antetitulo>
        <TituloSeccion id="porque">Por qué el m² es tan caro acá</TituloSeccion>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
          En 2022, San Martín de los Andes fue señalada como la ciudad con el m² más caro de
          Argentina, con USD 2.520. Sigue siendo uno de los mercados más caros del país, y estas
          son las cuatro razones.
        </p>

        <dl className="mt-7 divide-y divide-gray-100 border-y border-gray-100">
          {razones.map((r) => (
            <div key={r.titulo} className="py-4">
              <dt className="text-[15px] font-medium text-gray-900">{r.titulo}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-gray-600">{r.texto}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-gray-400">
          Dato de 2022 · Diario 7 Lagos, LM Neuquén y DiarioAndino
        </p>
      </BloqueConFoto>
    </section>
  );
}

export default async function PrecioM2Page() {
  // Se resuelve en build (output: "export"), igual que en las fichas de barrio.
  const propiedades = await propiedadesConM2();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero sobre blanco. Sin bloque de color: el peso lo lleva la tipografía
          —grande, semibold, con el tracking cerrado— y el aire alrededor. */}
      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Datos al {ACTUALIZADO}
        </span>
        <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-gray-900 md:text-[52px]">
          Cuánto vale el m² <span className="text-rose-600">en San Martín de los Andes</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
          {/* "Relevamos N" y no "calculados sobre N": el relevamiento entero es
              la base del trabajo, pero cada mediana se calcula sobre un
              subconjunto más chico (las que el modelo puede medir). La primera
              frase es cierta; la segunda no lo sería. */}
          El precio del metro cuadrado es cuánto vale cada metro de una propiedad. Sirve para
          comparar si algo está caro o barato sin importar el tamaño. Relevamos{" "}
          {RELEVADAS_PUBLICO} propiedades publicadas en San Martín de los Andes para calcular
          estos valores.
        </p>

        {/* Métricas en hairline, no en tarjetas: son un dato de respaldo, no
            tres botones. Encajonarlas les daría un peso que no les toca. */}
        <div className="mt-10 grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 py-5">
          {METRICAS.map((m, i) => (
            <div key={m.label} className={i === 0 ? "pr-4" : "px-4"}>
              <p className="text-lg font-semibold leading-tight text-gray-900 tabular-nums md:text-xl">
                {m.valor}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 md:text-xs">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Antes acá había un párrafo que hacía la cuenta con una casa de 100 m²
            de ejemplo. Es la misma cuenta, pero hecha con la casa de otro: quien
            llega buscando "precio m2 san martin" está tratando de saber cuánto
            vale LA SUYA. El dato agregado deja de ser una estadística sobre
            terceros recién cuando la persona pone sus propios metros. */}
        <CalculadoraM2 tipos={TIPOS_CALC} barrios={BARRIOS_ALFABETICOS} />
      </section>

      {/* Rangos + evolución */}
      <section aria-labelledby="rangos" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <Antetitulo>Dónde cae la mayoría</Antetitulo>
        <TituloSeccion id="rangos">No todo el mercado vale lo mismo</TituloSeccion>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
          La <strong className="font-medium text-gray-900">mediana</strong> es el valor del medio:
          la mitad se publica por encima y la mitad por debajo. Se usa en lugar del promedio porque
          una sola propiedad muy cara no la distorsiona. Esto es dónde cae el 50 % central del
          mercado.
        </p>

        <div className="mt-7 space-y-5">
          {POR_TIPO.map((t) => (
            <div key={t.tipo} className="border-y border-gray-100 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[15px] font-medium text-gray-900">{PLURAL[t.tipo] ?? t.tipo}</p>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">
                  {usd(t.precio)}/m²
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-500 tabular-nums">
                La mitad del mercado entre {usd(t.rango.p25)} y {usd(t.rango.p75)}
              </p>
            </div>
          ))}
        </div>
        <Badge tipo="calculado" className="mt-4" />
        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Casas y departamentos van separados porque son mercados distintos: el m² difiere casi un
          60 % entre uno y otro, y promediarlos no le sirve ni al que vende una casa ni al que
          vende un departamento.
        </p>

        <h3 className="mt-14 text-[22px] font-semibold tracking-[-0.01em] text-gray-900">
          Cómo evolucionó, en dólares
        </h3>
        <p className="mt-1 text-sm text-gray-400">San Martín de los Andes · 2021–2026</p>
        <div className="mt-6 rounded-2xl border border-gray-200 p-4 sm:p-6">
          <PrecioM2Chart data={EVOLUCION} />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {EVOLUCION.filter((e) => e.variacion).map((e) => (
              <span key={e.anio} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700 tabular-nums">{e.anio}</span>
                <span className="text-xs font-semibold text-emerald-600 tabular-nums">
                  +{e.variacion}%
                </span>
                <span className="text-xs text-gray-400">{e.contexto}</span>
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs leading-relaxed text-gray-400">
          <Badge tipo="referencia" />
          <span className="flex-1 min-w-[16rem]">
            Esta serie se mantiene a mano como referencia del mercado y el modelo le verifica el
            último año contra la mediana actual. Es el mismo dato que usa el tasador, para que las
            dos páginas nunca digan cosas distintas.
          </span>
        </p>
      </section>

      <SeccionBarrios />
      <SeccionLimites />

      <SeccionPorQue />

      {/* Fuentes + cierre */}
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <section aria-labelledby="fuentes" className="border-t border-gray-100 pt-14">
          <h2 id="fuentes" className="text-[22px] font-semibold tracking-[-0.01em] text-gray-900">
            De dónde salen estos datos
          </h2>
          <dl className="mt-6 divide-y divide-gray-100 border-y border-gray-100">
            {FUENTES.map((f) => (
              <div key={f.nombre} className="py-4">
                <dt className="text-[15px] font-medium text-gray-900">{f.nombre}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-gray-500">{f.dato}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            No existe un índice oficial de precios para San Martín de los Andes. Es el mismo
            relevamiento con el que se entrena el tasador, y se actualiza cada vez que volvemos a
            relevar el mercado.
          </p>
        </section>

        {/* FAQ. Va después de las fuentes y antes del cierre: son las preguntas
            que quedan cuando ya se leyeron los números, y la última de ellas
            ("¿y la mía cuánto vale?") es justo la que contesta el bloque de
            abajo. Con <details> el texto está en el HTML aunque esté colapsado,
            así que Google lo indexa igual y funciona sin JavaScript. */}
        <section aria-labelledby="faq" className="mt-14 border-t border-gray-100 pt-14">
          <h2 id="faq" className="text-[22px] font-semibold tracking-[-0.01em] text-gray-900">
            Preguntas frecuentes
          </h2>
          <div className="mt-6 divide-y divide-gray-100 border-y border-gray-100">
            {FAQS.map((f) => (
              <details key={f.pregunta} className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                  {f.pregunta}
                  <span
                    className="mt-0.5 shrink-0 text-gray-300 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-relaxed text-gray-600">{f.respuesta}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Va después del FAQ y antes del cierre: cuando alguien terminó de leer
            los números ya sabe si el mercado le cierra, y la pregunta siguiente
            es qué hay. El cierre —tasar la propia— queda abajo, que es el otro
            camino posible. */}
        <SeccionPropiedades items={propiedades} />

        <section
          aria-labelledby="cierre"
          className="mt-14 rounded-2xl bg-gray-900 px-6 py-10 text-center sm:px-10"
        >
          <h2 id="cierre" className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white">
            ¿Y tu propiedad cuánto vale?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
            Los promedios sirven para tener una idea, pero cada propiedad es distinta. El tasador
            te da un rango en un minuto y no te pide datos la primera vez.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/tasacion"
              className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              Tasar mi propiedad gratis
            </Link>
            <Link
              href="/inversiones"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Ver análisis de inversiones
            </Link>
            <Link
              href="/contacto"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Consultar con Milton
            </Link>
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-gray-400">
          Los valores de esta página son orientativos y no reemplazan una tasación profesional
          formal. Pueden variar según las condiciones del mercado.
        </p>
      </div>

      {/* Los dos JSON-LD salen de las mismas constantes que la página: el FAQ,
          del array FAQS; el Dataset, de lib/mercado.js. Ninguno tiene números
          propios, así que no pueden desincronizarse de lo que se ve. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
    </div>
  );
}
