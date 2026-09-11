import Image from "next/image";
import CarruselDecoracion from "@/components/CarruselDecoracion";
import TasacionProfesionalClient from "@/components/TasacionProfesionalClient";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { getBarrios } from "@/lib/tasador";
import { barriosConMediana } from "@/lib/precioZonas";
import {
  EVOLUCION_SERIE,
  EVOLUCION_VARIACION_TOTAL,
  RELEVADAS_PUBLICO,
} from "@/lib/mercado";
import { TASACIONES_LIBRES } from "@/lib/tasadorOpciones";

// Las fotos de las secciones, en un solo lugar: cambiar cualquiera es cambiar
// una línea acá.
//
// La aérea del pueblo es propia y es la que más pesa — no la tiene ningún otro
// sitio de la zona. No se usa hero-montana.webp, que es el Fitz Roy en Chaltén,
// a 1.500 km: ilustrar el mercado local con un cerro de otra provincia rompe
// justo lo que la página promete.
//
// Las otras tres son de Adobe Stock, licenciadas (IDs 391213057, 349623503 y
// 201838164). Son personas genéricas, no clientes de la inmobiliaria, y por eso
// el texto alterno las describe sin atribuirles ninguna historia: en una página
// que vive de decir "estos son datos reales", insinuar que son clientes de
// verdad sería lo único capaz de tirar abajo el resto.
const FOTOS = {
  barrios: {
    src: "/sanmartin.jpeg",
    alt: "Vista aérea de San Martín de los Andes al atardecer, con el lago Lácar al fondo y el pueblo iluminado entre los cerros",
  },
  vista: {
    src: "/tasacion-ventana.jpg",
    alt: "Una mujer con una taza de café mira por la ventana de su casa a la luz de la mañana",
  },
  mercado: {
    src: "/tasacion-cuentas.jpg",
    alt: "Una pareja revisa sus cuentas con una notebook en la mesa de la cocina",
  },
};

// Carrusel aspiracional del cierre. Son referencias de estilo, no propiedades
// en venta: el texto de la sección lo dice y los pies de foto describen la
// decoración, nunca una casa concreta. Confundir las dos cosas en la página que
// promete datos verificables sería el peor lugar para hacerlo.
const DECORACION = [
  {
    src: "/deco-living-vigas.jpg",
    titulo: "Vigas a la vista",
    detalle: "La madera estructural sin tapar es lo que más rápido da carácter a un living de montaña.",
    alt: "Living amplio con vigas de madera a la vista y muebles claros",
  },
  {
    src: "/deco-living-ventanal.jpg",
    titulo: "El hogar como centro",
    detalle: "Sillones enfrentados al fuego y no al televisor: cambia por completo cómo se usa el ambiente.",
    alt: "Living con hogar encendido, sillones y una gran ventana",
  },
  {
    src: "/deco-living-moderno.jpg",
    titulo: "Ventanal de piso a techo",
    detalle: "Cuando el paisaje es el que tenemos acá, la mejor decoración es dejarlo entrar.",
    alt: "Living moderno luminoso con hogar y pared vidriada al fondo",
  },
  {
    src: "/deco-living-fuego.jpg",
    titulo: "Para el invierno largo",
    detalle: "Textiles gruesos, alfombra y luz baja: lo que hace que julio se disfrute en vez de aguantarse.",
    alt: "Personas descansando junto a un hogar encendido en una casa de estilo loft",
  },
  {
    src: "/deco-living-fiestas.jpg",
    titulo: "Listo para recibir",
    detalle: "Pensar el ambiente para cuando llega la familia es lo que más se agradece en temporada.",
    alt: "Living decorado con adornos de fin de año junto al hogar",
  },
];

// Una hora, no un día — y el motivo importa, porque acá había una caché de más.
//
// Quien protege a la API dormida es el `next: { revalidate: 86_400 }` del fetch
// de `getBarrios` en `lib/tasador.js`: esa lista se pide una vez por día y el
// resto del tiempo sale de caché, esté el contenedor despierto o no. Esta
// constante es otra cosa: gobierna cada cuánto se regenera el HTML de la página.
//
// Tenerla también en un día no agregaba protección —la llamada a la API no
// depende de ella— y sí agregaba una consecuencia fea: cuando el fetch falla no
// se cachea nada, la página se genera con la lista de respaldo, y con 86400 esa
// versión degradada quedaba servida 24 horas antes de reintentar. Con 3600 se
// reintenta a la hora. La cantidad de llamadas a la API es la misma, porque el
// fetch sigue cacheado un día; lo único que cambia es cuánto dura el daño
// cuando algo sale mal.
export const revalidate = 3600;

export const metadata = {
  title: "Tasación online de propiedades en San Martín de los Andes",
  description:
    "Tasá tu casa o departamento en San Martín de los Andes en menos de un minuto, gratis y sin dejar datos la primera vez. Rango de valor, precio por m² y comparación con tu barrio.",
  openGraph: {
    title: "Tasador online gratis en San Martín de los Andes — Catalán Propiedades",
    description:
      "Modelo entrenado con propiedades reales de la zona. Resultado al instante: rango de valor, precio por m² y cómo se compara con tu barrio.",
    url: canonicalUrl("/tasacion"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Tasación de propiedades en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasador online gratis en San Martín de los Andes",
    description:
      "Resultado al instante con datos reales del mercado local. Gratis y sin dejar datos la primera vez.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/tasacion"),
  },
};

// Las preguntas viven una sola vez: de acá salen tanto el acordeón que se ve en
// pantalla como el JSON-LD que lee Google. Antes existían solo en el JSON-LD, o
// sea que Google podía mostrar en el buscador una respuesta que el visitante no
// encontraba en la página. Con una sola fuente eso no puede volver a pasar.
const FAQS = [
  {
    pregunta: "¿Cuánto cuesta tasar una propiedad en San Martín de los Andes?",
    respuesta:
      "Nada. El tasador online de Catalán Propiedades es gratuito y da el resultado al instante. La primera tasación no pide ningún dato personal; a partir de la segunda pedimos un correo. La tasación personal de Milton también es gratuita y sin compromiso.",
  },
  {
    pregunta: "¿Cuánto tarda la tasación online?",
    respuesta:
      "Menos de un minuto. Se completan cinco pasos —tipo de propiedad, barrio, superficie, distribución y extras— y el modelo devuelve el valor en el momento. Si preferís la tasación personal de Milton, la respuesta llega en menos de 48 horas hábiles.",
  },
  {
    pregunta: "¿En qué se basa la tasación?",
    respuesta: `El modelo se apoya en un relevamiento de ${RELEVADAS_PUBLICO} propiedades reales de San Martín de los Andes. Mira barrio, superficie cubierta y de terreno, distribución de ambientes, cocheras y características como pileta, vista o estado a estrenar.`,
  },
  {
    pregunta: "¿Por qué el tasador devuelve un rango y no un precio exacto?",
    respuesta:
      "Porque el modelo tiene un margen de error conocido y publicar un número al peso fingiría una precisión que no existe. El rango es más honesto y además más útil para decidir a qué precio publicar. Hay cosas que ningún modelo ve: la vista real, el estado fino, el ruido de la calle o cómo entra el sol.",
  },
  {
    pregunta: "¿La tasación online reemplaza una tasación profesional formal?",
    respuesta:
      "No. Es una estimación referencial, útil para tomar decisiones iniciales. Para operaciones formales de compra, venta o garantías bancarias se requiere una tasación profesional certificada.",
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

const COMO_FUNCIONA = [
  {
    n: "01",
    titulo: "Contás cómo es",
    texto: "Cinco pasos cortos: tipo, barrio, metros, distribución y extras. Una pregunta por pantalla.",
  },
  {
    n: "02",
    titulo: "El modelo la compara",
    texto: `Contra ${RELEVADAS_PUBLICO} propiedades reales de San Martín, no contra un promedio nacional.`,
  },
  {
    n: "03",
    titulo: "Ves el rango y el porqué",
    texto: "Valor estimado, precio por m² y cómo se para contra la mediana de tu barrio.",
  },
];

// Bloque imagen + texto. La imagen siempre lleva un ratio fijo y `sizes`: sin
// eso, la foto llega después del texto y empuja media página hacia abajo justo
// cuando la persona empezó a leer.
function BloqueConFoto({ foto, invertido = false, children, prioridad = false }) {
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
          priority={prioridad}
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

function SeccionBarrios() {
  // Se usa barriosConMediana() y no barriosDestacados() del JSON crudo porque
  // el segundo devolvía "General" en el puesto 2 — el cajón donde caen las
  // publicaciones sin barrio declarado (n=173). Esta página lo estaba
  // publicando como si fuera un barrio de San Martín, con su USD 3.000/m².
  // barriosConMediana() además usa los nombres canónicos del sitio ("Vega
  // Maipú", no "Vega Maipu"), así que las dos páginas nombran igual al mismo
  // lugar.
  const destacados = barriosConMediana().slice(0, 4);

  return (
    <section aria-labelledby="barrios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
      <BloqueConFoto foto={FOTOS.barrios}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Lo que más pesa
        </p>
        <TituloSeccion id="barrios">El barrio manda</TituloSeccion>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
          En San Martín, entre el barrio más caro y el más barato hay casi el triple por metro
          cuadrado. Ninguna otra variable mueve tanto: dos casas iguales, a diez cuadras de
          distancia, pueden valer muy distinto. Por eso el tasador te pide el barrio antes que los
          metros.
        </p>

        <dl className="mt-7 divide-y divide-gray-100 border-y border-gray-100">
          {destacados.map((b) => (
            <div key={b.nombre} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="text-[15px] font-medium text-gray-900">{b.nombre}</dt>
              <dd className="flex items-baseline gap-3">
                <span className="text-[11px] text-gray-400 tabular-nums">{b.n} relevadas</span>
                <span className="text-[15px] font-semibold text-gray-900 tabular-nums">
                  USD {b.medianaM2.toLocaleString("es-AR")}/m²
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-gray-400">
          Mediana del m² sobre las propiedades relevadas de cada barrio.
        </p>
      </BloqueConFoto>
    </section>
  );
}

function SeccionVista() {
  return (
    <section
      aria-labelledby="vista"
      className="border-y border-gray-100 bg-gray-50/60 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BloqueConFoto foto={FOTOS.vista} invertido>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Los límites, dichos de frente
          </p>
          <TituloSeccion id="vista">Esto el modelo no lo puede tasar</TituloSeccion>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
            Un modelo ve metros, ambientes y coordenadas. No ve lo que se ve desde el living a las
            siete de la tarde, ni cómo entra el sol en julio, ni el ruido de la calle a las ocho de
            la mañana, ni si la carpintería aguantó bien los inviernos.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
            Eso puede mover el precio bastante más que un dormitorio de diferencia. Es la razón por
            la que el resultado te da un rango y no un número, y por la que abajo está el camino
            para que Milton la mire en persona.
          </p>
        </BloqueConFoto>
      </div>
    </section>
  );
}

function SeccionMercado() {
  // La serie es referencia curada, no sale del scraping: se dice explícitamente
  // al pie para no presentarla con la misma autoridad que el modelo.
  const serie = EVOLUCION_SERIE.slice(-5);
  const maximo = Math.max(...serie.map((p) => p.usd_m2), 1);

  return (
    <section aria-labelledby="mercado" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
      <BloqueConFoto foto={FOTOS.mercado}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Por qué conviene volver
        </p>
        <TituloSeccion id="mercado">El mercado no se queda quieto</TituloSeccion>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600 md:text-base">
          El m² en San Martín subió{" "}
          {EVOLUCION_VARIACION_TOTAL ? (
            <span className="font-semibold text-gray-900">
              {EVOLUCION_VARIACION_TOTAL.toString().replace(".", ",")}%
            </span>
          ) : (
            "bastante"
          )}{" "}
          desde 2021. Una tasación de hace dos años ya no describe tu propiedad: describe otro
          mercado. Tasar de nuevo es gratis y lleva un minuto.
        </p>

        <div className="mt-7 flex items-end gap-2 sm:gap-3" aria-hidden="true">
          {serie.map((p) => (
            <div key={p.anio} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-medium text-gray-500 tabular-nums">
                {(p.usd_m2 / 1000).toFixed(1).replace(".", ",")}k
              </span>
              <div
                className="w-full rounded-t bg-gray-900"
                style={{ height: `${Math.round((p.usd_m2 / maximo) * 88)}px` }}
              />
              <span className="text-[11px] text-gray-400 tabular-nums">{p.anio}</span>
            </div>
          ))}
        </div>
        <p className="sr-only">
          Evolución del valor del m² en dólares:{" "}
          {serie.map((p) => `${p.anio}, ${p.usd_m2} dólares`).join("; ")}.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Serie de referencia del mercado, cargada a mano y revisada contra la mediana actual. No
          sale del modelo: los números del tasador se calculan aparte.
        </p>
      </BloqueConFoto>
    </section>
  );
}

// Acordeón con <details>: funciona sin JavaScript, es navegable con teclado y
// el buscador puede leer las respuestas aunque estén cerradas.
function SeccionFaq() {
  return (
    <section aria-labelledby="preguntas" className="border-t border-gray-100 pt-14">
      <h2
        id="preguntas"
        className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-gray-900 md:text-[32px]"
      >
        Respondemos tus preguntas
      </h2>

      <div className="mt-8 divide-y divide-gray-100 border-y border-gray-100">
        {FAQS.map((f) => (
          <details key={f.pregunta} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
              {f.pregunta}
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gray-600">{f.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function TasacionPage() {
  const barrios = await getBarrios();

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero sobre blanco. Sin bloque de color: el peso lo lleva la tipografía
          —grande, semibold, con el tracking cerrado— y el aire alrededor. Es la
          diferencia entre una página que grita y una que se lee. */}
      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Gratis · resultado al instante
        </span>
        {/* Título a dos colores: la pregunta en negro y el lugar en el rosa de
            la marca. El corte no es decorativo — cae justo donde cambia el
            sentido de la frase, así el color subraya lo que diferencia a este
            tasador de cualquier otro: que sabe de San Martín y no del país. */}
        <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-gray-900 md:text-[52px]">
          ¿Cuánto vale tu propiedad?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
          Contestá cinco preguntas y el modelo te da un rango de valor con datos reales del mercado
          local. La primera tasación no te pide ni el nombre.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#tasador"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gray-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
          >
            Tasar mi propiedad
            <span aria-hidden="true">↓</span>
          </a>
          <p className="text-sm text-gray-500">Menos de un minuto · sin compromiso</p>
        </div>

        {/* Métricas en hairline, no en tarjetas: son un dato de respaldo, no
            tres botones. Encajonarlas les daría un peso que no les toca. */}
        <div className="mt-10 grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100 py-5">
          {[
            { valor: "Tu valor", label: "estimación inmediata" },
            { valor: "Un rango", label: "con margen a la vista" },
            { valor: "Tu barrio", label: "comparación por m²" },
          ].map((m, i) => (
            <div key={m.label} className={i === 0 ? "pr-4" : "px-4"}>
              <p className="text-lg font-semibold leading-tight text-gray-900 tabular-nums md:text-xl">
                {m.valor}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 md:text-xs">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div id="tasador" className="mx-auto mt-10 max-w-3xl scroll-mt-24 px-4 sm:px-6 md:mt-12 lg:px-8">
        <TasacionProfesionalClient barriosIniciales={barrios} />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 md:py-20">
        <section aria-labelledby="como-funciona">
          <h2 id="como-funciona" className="text-[22px] font-semibold tracking-[-0.01em] text-gray-900">
            Cómo funciona
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {COMO_FUNCIONA.map((p) => (
              <div key={p.n}>
                <p className="text-[11px] font-bold tracking-widest text-gray-300">{p.n}</p>
                <p className="mt-2 font-semibold text-gray-900">{p.titulo}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{p.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-xl border border-gray-200 p-5 text-sm leading-relaxed text-gray-600">
            {TASACIONES_LIBRES === 1 ? "La primera tasación" : `Las primeras ${TASACIONES_LIBRES}`} es
            libre y anónima. Si querés tasar otra propiedad —o probar variantes de la misma— te
            pedimos un correo, y si tenés cuenta no te pedimos nada y además te las guardamos.
          </p>
        </section>
      </div>

      {/* Las tres secciones con foto. Van DEBAJO del tasador a propósito: son
          el "por qué creerle" y no el "qué hacer". Ponerlas arriba empujaría
          hacia abajo lo único que la persona vino a usar. */}
      <SeccionBarrios />
      <SeccionVista />
      <SeccionMercado />

      <div className="mx-auto max-w-3xl px-4 pb-14 sm:px-6 lg:px-8 md:pb-20">
        <SeccionFaq />

        {/* Segundo camino. No compite con el tasador: es lo que sigue cuando el
            número ya está y hay que decidir a cuánto publicar de verdad. */}
        {/* Cierre aspiracional. El formulario largo que estaba acá se sacó
            porque volvía a preguntar tipo, barrio, metros, dormitorios y estado
            —todo lo que la persona ya había contestado en el wizard—, y pedir
            dos veces lo mismo es la forma más rápida de que alguien abandone.
            En su lugar va lo que uno piensa después de saber cuánto vale: qué
            hacer con eso. */}
        <section aria-labelledby="inspiracion" className="mt-16 border-t border-gray-100 pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Después del número
          </p>
          <h2
            id="inspiracion"
            className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900 md:text-[32px]"
          >
            Vivir <span className="text-rose-600">en la montaña</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-600">
            Saber cuánto vale tu propiedad es el primer paso. El que viene después es imaginar: si
            la vendés, qué querés que sea la próxima; si te quedás, qué le harías. Estas son
            referencias de estilo para casas de acá — no son propiedades en venta.
          </p>

          <div className="mt-8">
            <CarruselDecoracion items={DECORACION} />
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-gray-400">
          Las estimaciones de esta página son orientativas y no reemplazan una tasación profesional
          formal. Los valores son referenciales y pueden variar según las condiciones del mercado.
        </p>
      </div>
    </div>
  );
}
